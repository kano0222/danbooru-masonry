import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppState } from './core/state';
import type { GetPostsResult } from './adapters/types';
import { DanbooruAdapter } from './adapters/danbooru';
import { boot } from './main';
import { installLaunchButton, renderShell } from './ui/shell';
import { closeViewer } from './core/viewer';
import { TagTranslationStore } from './data/tagTranslation';
import { normalizePost } from './core/normalizePost';
import { closeAutocomplete, openAutocomplete } from './ui/autocomplete';

vi.mock('./ui/shell', () => ({ installLaunchButton: vi.fn(), renderShell: vi.fn() }));
vi.mock('./ui/styles', () => ({ installStyles: vi.fn() }));
vi.mock('./ui/cards', () => ({ renderPosts: vi.fn() }));
vi.mock('./core/shortcuts', () => ({ installShortcuts: vi.fn() }));
vi.mock('./core/scrollControls', () => ({
  bindScrollControls: vi.fn(),
  scheduleScrollControlsUpdate: vi.fn(),
}));
vi.mock('./core/masonry', async (original) => ({
  ...(await original<object>()),
  layoutMasonry: vi.fn(),
}));
vi.mock('./core/viewer', async (original) => ({
  ...(await original<object>()),
  closeViewer: vi.fn(),
}));
vi.mock('./ui/autocomplete', async (original) => ({
  ...(await original<object>()),
  closeAutocomplete: vi.fn(),
  openAutocomplete: vi.fn(),
}));
vi.mock('./core/blacklist', async (original) => ({
  ...(await original<object>()),
  captureBlacklist: () => ({ config: { enabled: false, rules: [] }, text: '' }),
}));

type Handler = (event: unknown) => void;
function node() {
  const handlers = new Map<string, Handler[]>();
  return {
    handlers,
    addEventListener: (name: string, handler: Handler) =>
      handlers.set(name, [...(handlers.get(name) || []), handler]),
    classList: { contains: () => false, add: vi.fn(), remove: vi.fn(), toggle: vi.fn() },
    setAttribute: vi.fn(),
    remove: vi.fn(),
    style: {},
    value: '',
    innerHTML: '',
    textContent: '',
    disabled: false,
    blur: vi.fn(),
    contains: vi.fn(() => false),
  };
}
let nodes: Map<string, ReturnType<typeof node>>;
let adapter: DanbooruAdapter;
function renderedState(): AppState {
  return vi.mocked(renderShell).mock.calls[0][0];
}
function clickTag(tag: string) {
  const event = {
    button: 0,
    target: { id: '', closest: () => ({ dataset: { viewerTag: tag } }) },
    preventDefault: vi.fn(),
  };
  for (const handler of nodes.get('dmh-viewer')!.handlers.get('click')!) handler(event);
  return event;
}
beforeEach(() => {
  vi.clearAllMocks();
  nodes = new Map();
  vi.stubGlobal('location', {
    href: 'https://danbooru.donmai.us/posts?tags=old&dmh=1',
    pathname: '/posts',
    search: '?tags=old&dmh=1',
    replace: vi.fn(),
    reload: vi.fn(),
  });
  vi.stubGlobal('history', {
    state: { preserved: true },
    replaceState: vi.fn(),
    pushState: vi.fn(),
  });
  vi.stubGlobal('document', {
    getElementById: (id: string) => {
      if (!nodes.has(id)) nodes.set(id, node());
      return nodes.get(id);
    },
    querySelectorAll: () => [],
    hasFocus: vi.fn(() => true),
    addEventListener: vi.fn(),
    body: { dataset: {} },
    documentElement: { classList: { remove: vi.fn() } },
  });
  vi.stubGlobal('window', { addEventListener: vi.fn(), scrollY: 0, scrollTo: vi.fn() });
  vi.stubGlobal('GM_getValue', (_key: string, fallback: unknown) => fallback);
  vi.spyOn(TagTranslationStore.prototype, 'load').mockResolvedValue(true);
  adapter = new DanbooruAdapter();
  vi.spyOn(adapter, 'getPosts').mockResolvedValue({ posts: [], hasSourcePosts: false });
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('masonry launch and tag search', () => {
  it('closes suggestions and blurs the input immediately on search submission', async () => {
    boot(adapter);
    await vi.waitFor(() => expect(adapter.getPosts).toHaveBeenCalledOnce());
    const input = nodes.get('dmh-tags')!;
    input.value = ' new_tag ';
    vi.mocked(adapter.getPosts).mockReturnValue(new Promise(() => {}));
    for (const handler of nodes.get('dmh-search')!.handlers.get('submit')!) {
      handler({ preventDefault: vi.fn() });
    }
    expect(closeAutocomplete).toHaveBeenCalled();
    expect(input.blur).toHaveBeenCalledOnce();
    expect(renderedState().tags).toBe('new_tag');
  });
  it('preserves dismissed suggestions across window focus restoration but opens on explicit entry', async () => {
    boot(adapter);
    await vi.waitFor(() => expect(renderShell).toHaveBeenCalledOnce());
    const input = nodes.get('dmh-tags')!;
    const fire = (name: string) => input.handlers.get(name)!.forEach((fn) => fn({ target: input }));
    fire('focus');
    expect(openAutocomplete).toHaveBeenCalledOnce();
    vi.mocked(openAutocomplete).mockClear();
    vi.mocked(document.hasFocus).mockReturnValue(false);
    fire('blur');
    nodes.get('dmh-search')!.handlers.get('focusout')!.forEach((fn) => fn({}));
    await Promise.resolve();
    expect(closeAutocomplete).not.toHaveBeenCalled();
    vi.mocked(document.hasFocus).mockReturnValue(true);
    fire('focus');
    expect(openAutocomplete).not.toHaveBeenCalled();
    fire('click');
    expect(openAutocomplete).toHaveBeenCalledOnce();
    fire('blur');
    fire('focus');
    expect(openAutocomplete).toHaveBeenCalledTimes(2);
  });
  it('closes suggestions only when focus leaves the search component', async () => {
    boot(adapter);
    await vi.waitFor(() => expect(renderShell).toHaveBeenCalledOnce());
    const form = nodes.get('dmh-search')!;
    form.contains.mockReturnValue(true);
    form.handlers.get('focusout')!.forEach((fn) => fn({}));
    await Promise.resolve();
    expect(closeAutocomplete).not.toHaveBeenCalled();
    form.contains.mockReturnValue(false);
    form.handlers.get('focusout')!.forEach((fn) => fn({}));
    await Promise.resolve();
    expect(closeAutocomplete).toHaveBeenCalledOnce();
  });
  it('ignores scrollbar pointer events but dismisses suggestions on outside clicks', async () => {
    boot(adapter);
    await vi.waitFor(() => expect(renderShell).toHaveBeenCalledOnce());
    const handler = vi.mocked(document.addEventListener).mock.calls.find(([name]) => name === 'pointerdown')![1] as Handler;
    handler({ target: { closest: (selector: string) => selector.includes('#dmh-scrollbar') ? {} : null } });
    expect(closeAutocomplete).not.toHaveBeenCalled();
    handler({ target: { closest: () => null } });
    expect(closeAutocomplete).toHaveBeenCalledOnce();
  });
  it('consumes the launch flag and guards against duplicate startup', async () => {
    boot(adapter);
    const start = vi.mocked(installLaunchButton).mock.calls[0][0];
    start();
    start();
    await vi.waitFor(() => expect(adapter.getPosts).toHaveBeenCalledOnce());
    expect(renderShell).toHaveBeenCalledOnce();
    expect(history.replaceState).toHaveBeenCalledWith(
      { preserved: true },
      '',
      'https://danbooru.donmai.us/posts?tags=old',
    );
    expect(renderedState().started).toBe(true);
  });
  it('leaves unmarked pages in manual mode', async () => {
    location.href = 'https://danbooru.donmai.us/posts?tags=old';
    boot(adapter);
    await Promise.resolve();
    expect(installLaunchButton).toHaveBeenCalledOnce();
    expect(renderShell).not.toHaveBeenCalled();
    expect(history.replaceState).not.toHaveBeenCalled();
  });
  it('exits masonry when the title is clicked', async () => {
    boot(adapter);
    await vi.waitFor(() => expect(renderShell).toHaveBeenCalledOnce());
    for (const handler of nodes.get('dmh-title-exit')!.handlers.get('click')!) handler({});
    expect(location.reload).toHaveBeenCalledOnce();
  });
  it('retries partial initialization by reloading instead of binding a second shell', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(renderShell).mockImplementationOnce(() => {
      throw new Error('shell failed');
    });
    boot(adapter);
    await vi.waitFor(() => expect(installLaunchButton).toHaveBeenCalledTimes(2));
    expect(renderedState().started).toBe(false);
    vi.mocked(installLaunchButton).mock.calls[1][0]();
    expect(location.replace).toHaveBeenCalledWith(
      'https://danbooru.donmai.us/posts?tags=old&dmh=1',
    );
    expect(renderShell).toHaveBeenCalledOnce();
  });
  it('closes details, replaces the query and ignores an old in-flight response', async () => {
    let resolveOld!: (value: GetPostsResult) => void;
    vi.mocked(adapter.getPosts).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveOld = resolve;
        }),
    );
    boot(adapter);
    await vi.waitFor(() => expect(adapter.getPosts).toHaveBeenCalledOnce());
    const state = renderedState();
    state.tagClickBehavior = 'masonry-current-tab';
    state.page = 8;
    const post = normalizePost({ id: 9 }, adapter.origin);
    vi.mocked(adapter.getPosts).mockResolvedValueOnce({ posts: [post], hasSourcePosts: true });
    const click = clickTag('new_tag');
    await vi.waitFor(() => expect(state.posts).toEqual([post]));
    expect(click.preventDefault).toHaveBeenCalledOnce();
    expect(closeViewer).toHaveBeenCalledWith(state);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' });
    expect(adapter.getPosts).toHaveBeenLastCalledWith(
      expect.objectContaining({ tags: 'new_tag', page: 1 }),
    );
    resolveOld({ posts: [normalizePost({ id: 1 }, adapter.origin)], hasSourcePosts: true });
    await Promise.resolve();
    expect(state.posts).toEqual([post]);
    expect(state.tags).toBe('new_tag');
  });
});
