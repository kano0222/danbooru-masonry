import { afterEach, describe, expect, it, vi } from 'vitest';
import { DanbooruAdapter } from '../adapters/danbooru';
import { normalizePost } from './normalizePost';
import {
  createState,
  parseTagClickBehavior,
  saveOpenViewerTagsByDefault,
  saveShowViewerTags,
  saveTagClickBehavior,
} from './state';
import {
  consumeMasonryLaunchUrl,
  getTagSearchUrl,
  getViewerTags,
  shouldSearchInCurrentTab,
} from './viewerTags';
import {
  closeViewer,
  onViewerKeydown,
  onViewerWheel,
  refreshViewerTags,
  setViewerTagsOpen,
} from './viewer';

const adapter = new DanbooruAdapter();
afterEach(() => vi.unstubAllGlobals());
function state() {
  vi.stubGlobal('location', { search: '' });
  vi.stubGlobal('GM_getValue', (_key: string, fallback: unknown) => fallback);
  return createState(adapter);
}

describe('viewer tag settings and links', () => {
  it('uses the viewer tag defaults and persists preferences', () => {
    const value = state();
    expect(value.showViewerTags).toBe(true);
    expect(value.openViewerTagsByDefault).toBe(false);
    expect(value.tagClickBehavior).toBe('masonry-new-tab');
    const save = vi.fn();
    vi.stubGlobal('GM_setValue', save);
    saveShowViewerTags(false);
    saveOpenViewerTagsByDefault(true);
    saveTagClickBehavior('masonry-new-tab');
    expect(save.mock.calls).toEqual([
      ['danbooru-masonry.showViewerTags', false],
      ['danbooru-masonry.openViewerTagsByDefault', true],
      ['danbooru-masonry.tagClickBehavior', 'masonry-new-tab'],
    ]);
    vi.stubGlobal('GM_getValue', (key: string, fallback: unknown) => {
      if (key.endsWith('showViewerTags')) return false;
      if (key.endsWith('openViewerTagsByDefault')) return true;
      if (key.endsWith('tagClickBehavior')) return 'original-new-tab';
      return fallback;
    });
    const restored = createState(adapter);
    expect(restored.showViewerTags).toBe(false);
    expect(restored.openViewerTagsByDefault).toBe(true);
    expect(restored.tagClickBehavior).toBe('original-new-tab');
  });
  it.each([undefined, null, 'invalid', 1])('rejects invalid behavior %s', (value) => {
    expect(parseTagClickBehavior(value)).toBe('masonry-new-tab');
  });
  it('excludes typed tags and deduplicates general tags in source order', () => {
    const post = normalizePost(
      {
        id: 1,
        tag_string_general: 'z a z artist series character highres',
        tag_string_artist: 'artist',
        tag_string_copyright: 'series',
        tag_string_character: 'character',
        tag_string_meta: 'highres',
      },
      adapter.origin,
    );
    expect(getViewerTags(post)).toEqual(['z', 'a']);
    expect(getViewerTags(normalizePost({ id: 2 }, adapter.origin))).toEqual([]);
  });
  it.each(['original-new-tab', 'masonry-current-tab', 'masonry-new-tab'] as const)(
    'encodes a single raw tag for %s',
    (behavior) => {
      const tag = 'a&b_(日本語)+#';
      const url = new URL(getTagSearchUrl(adapter, tag, behavior));
      expect(url.searchParams.get('tags')).toBe(tag);
      expect(url.searchParams.get('page')).toBeNull();
      expect(url.searchParams.get('dmh')).toBe(behavior === 'masonry-new-tab' ? '1' : null);
    },
  );
  it('only intercepts unmodified primary clicks in current-tab mode', () => {
    const click = { button: 0 } as MouseEvent;
    expect(shouldSearchInCurrentTab(click, 'masonry-current-tab')).toBe(true);
    for (const key of ['ctrlKey', 'metaKey', 'shiftKey', 'altKey'])
      expect(shouldSearchInCurrentTab({ ...click, [key]: true }, 'masonry-current-tab')).toBe(
        false,
      );
    expect(shouldSearchInCurrentTab({ button: 1 } as MouseEvent, 'masonry-current-tab')).toBe(
      false,
    );
    expect(shouldSearchInCurrentTab(click, 'masonry-new-tab')).toBe(false);
    expect(shouldSearchInCurrentTab(click, 'original-new-tab')).toBe(false);
  });
  it('consumes only exact launch flags on list pages while preserving other URL data', () => {
    const clean = consumeMasonryLaunchUrl(
      'https://danbooru.donmai.us/posts?tags=a%26b&dmh=1&page=2#top',
    );
    expect(clean).toBe('https://danbooru.donmai.us/posts?tags=a%26b&page=2#top');
    expect(consumeMasonryLaunchUrl(clean!)).toBeNull();
    for (const path of ['/posts/12?dmh=1', '/posts?dmh=true', '/posts?dmh=0'])
      expect(consumeMasonryLaunchUrl(adapter.origin + path)).toBeNull();
  });
});

describe('viewer tag panel', () => {
  function setup() {
    const value = state();
    const nodes = new Map<string, ReturnType<typeof node>>();
    function node() {
      return {
        hidden: false,
        innerHTML: '',
        scrollTop: 25,
        textContent: '',
        setAttribute: vi.fn(),
        focus: vi.fn(),
        classList: { contains: () => true },
      };
    }
    for (const id of [
      'dmh-viewer',
      'dmh-viewer-tags',
      'dmh-viewer-tags-list',
      'dmh-viewer-tags-panel',
      'dmh-viewer-tags-toggle',
      'dmh-viewer-info',
    ])
      nodes.set(id, node());
    vi.stubGlobal('document', { getElementById: (id: string) => nodes.get(id) || null });
    value.posts = [
      normalizePost(
        { id: 1, tag_string_general: 'hello <unsafe>', tag_string_artist: 'author' },
        adapter.origin,
      ),
    ];
    value.viewerIndex = 0;
    return { value, nodes };
  }
  it('updates content, scroll and links while keeping expansion across posts', () => {
    const { value, nodes } = setup();
    setViewerTagsOpen(value, true);
    refreshViewerTags(value);
    expect(value.viewerTagsOpen).toBe(true);
    expect(nodes.get('dmh-viewer-tags-list')!.scrollTop).toBe(0);
    expect(nodes.get('dmh-viewer-tags-list')!.innerHTML).toContain('&lt;unsafe&gt;');
    expect(nodes.get('dmh-viewer-tags-toggle')!.textContent).toBe('隐藏标签');
    value.tagClickBehavior = 'masonry-new-tab';
    refreshViewerTags(value);
    expect(nodes.get('dmh-viewer-info')!.innerHTML).toContain('dmh=1');
    value.showViewerTags = false;
    refreshViewerTags(value);
    expect(nodes.get('dmh-viewer-tags')!.hidden).toBe(true);
    expect(value.viewerTagsOpen).toBe(false);
  });
  it('reveals the panel when the viewer starts in the default-open state', () => {
    const { value, nodes } = setup();
    value.viewerTagsOpen = true;
    nodes.get('dmh-viewer-tags-panel')!.hidden = true;
    refreshViewerTags(value);
    expect(nodes.get('dmh-viewer-tags-panel')!.hidden).toBe(false);
    expect(nodes.get('dmh-viewer-tags-toggle')!.textContent).toBe('隐藏标签');
  });
  it('Escape closes the panel first and restores keyboard focus', () => {
    const { value, nodes } = setup();
    setViewerTagsOpen(value, true);
    const event = { key: 'Escape', preventDefault: vi.fn() } as unknown as KeyboardEvent;
    onViewerKeydown(value, event);
    expect(value.viewerTagsOpen).toBe(false);
    expect(nodes.get('dmh-viewer-tags-toggle')!.textContent).toBe('显示标签');
    expect(nodes.get('dmh-viewer-tags-toggle')!.focus).toHaveBeenCalledOnce();
    expect(event.preventDefault).toHaveBeenCalledOnce();
    setViewerTagsOpen(value, true);
    closeViewer(value);
    expect(value.viewerTagsOpen).toBe(false);
  });
  it('does not prevent native panel scrolling or navigate when zoomed', () => {
    const { value } = setup();
    value.zoomMode = true;
    const event = {
      deltaY: 100,
      target: { closest: () => ({}) },
      preventDefault: vi.fn(),
    } as unknown as WheelEvent;
    onViewerWheel(value, event);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(value.viewerIndex).toBe(0);
  });

  it('does not consume Escape for a panel hidden by an empty tag list', () => {
    const { value, nodes } = setup();
    setViewerTagsOpen(value, true);
    value.posts[0].tagGroups.general = [];
    refreshViewerTags(value);
    expect(nodes.get('dmh-viewer-tags')!.hidden).toBe(true);
    const event = { key: 'Escape', preventDefault: vi.fn() } as unknown as KeyboardEvent;
    onViewerKeydown(value, event);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(nodes.get('dmh-viewer-tags-toggle')!.focus).not.toHaveBeenCalled();
    expect(value.viewerTagsOpen).toBe(false);
  });
});
