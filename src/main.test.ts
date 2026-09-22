import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppState } from './core/state';
import type { GetPostsResult } from './adapters/types';
import { DanbooruAdapter } from './adapters/danbooru';
import * as userSettings from './api/userSettings';
import { ApiError } from './utils/fetch';
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
  captureBlacklist: () => ({ available: true, config: { enabled: false, rules: [] }, text: '' }),
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
    setCustomValidity: vi.fn(),
    reportValidity: vi.fn(),
    dataset: {} as Record<string, string>,
    remove: vi.fn(),
    style: {},
    value: '',
    innerHTML: '',
    appendChild: vi.fn(),
    href: '',
    target: '',
    rel: '',
    textContent: '',
    disabled: false,
    readOnly: false,
    hidden: true,
    open: false,
    showModal: vi.fn(),
    close: vi.fn(),
    focus: vi.fn(),
    getBoundingClientRect: () => ({ left: 10, right: 100, top: 10, bottom: 100 }),
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
    assign: vi.fn(),
    reload: vi.fn(),
  });
  vi.stubGlobal('history', {
    state: { preserved: true },
    replaceState: vi.fn(),
    pushState: vi.fn(),
  });
  vi.stubGlobal('document', {
    getElementById: (id: string) => {
      if (!nodes.has(id)) {
        const el = node();
        if (id.startsWith('dmh-download-template-')) el.dataset.downloadTemplate = id.slice('dmh-download-template-'.length);
        nodes.set(id, el);
      }
      return nodes.get(id);
    },
    createElement: () => node(),
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
  it('searches ranked posts from the hot shortcut', async () => {
    boot(adapter);
    await vi.waitFor(() => expect(adapter.getPosts).toHaveBeenCalledOnce());
    vi.mocked(adapter.getPosts).mockClear();
    nodes.get('dmh-hot-search')!.handlers.get('click')!.forEach((handler) => handler({}));
    await vi.waitFor(() => expect(adapter.getPosts).toHaveBeenCalledOnce());
    expect(renderedState().tags).toBe('order:rank');
    expect(nodes.get('dmh-tags')!.value).toBe('order:rank');
    expect(history.pushState).toHaveBeenLastCalledWith(null, '', adapter.getPostsPageUrl('order:rank', 1));
  });
  it('searches the current user favorites and ignores missing identity', async () => {
    boot(adapter);
    await vi.waitFor(() => expect(adapter.getPosts).toHaveBeenCalledOnce());
    const click = () => nodes.get('dmh-favorites-search')!.handlers.get('click')!.forEach((handler) => handler({}));
    vi.mocked(adapter.getPosts).mockClear();
    click();
    expect(adapter.getPosts).not.toHaveBeenCalled();
    document.body.dataset.currentUserId = '42';
    document.body.dataset.currentUserName = 'My Name';
    click();
    await vi.waitFor(() => expect(adapter.getPosts).toHaveBeenCalledOnce());
    expect(renderedState().tags).toBe('ordfav:My_Name');
    expect(nodes.get('dmh-tags')!.value).toBe('ordfav:My_Name');
    expect(history.pushState).toHaveBeenLastCalledWith(null, '', adapter.getPostsPageUrl('ordfav:My_Name', 1));
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
  it('automatically enters on list pages when enabled', async () => {
    location.href = 'https://danbooru.donmai.us/posts?tags=old';
    vi.stubGlobal('GM_getValue', (key: string, fallback: unknown) =>
      key === 'danbooru-masonry.autoEnterMasonry' ? true : fallback,
    );
    boot(adapter);
    await vi.waitFor(() => expect(renderShell).toHaveBeenCalledOnce());
    expect(history.replaceState).not.toHaveBeenCalled();
  });
  it('skips automatic entry once after an explicit exit', async () => {
    location.href = 'https://danbooru.donmai.us/posts?tags=old&dmh=0';
    vi.stubGlobal('GM_getValue', (key: string, fallback: unknown) =>
      key === 'danbooru-masonry.autoEnterMasonry' ? true : fallback,
    );
    boot(adapter);
    await Promise.resolve();
    expect(renderShell).not.toHaveBeenCalled();
    expect(history.replaceState).toHaveBeenCalledWith(
      { preserved: true }, '', 'https://danbooru.donmai.us/posts?tags=old',
    );
  });
  it('exits masonry when the title is clicked', async () => {
    boot(adapter);
    await vi.waitFor(() => expect(renderShell).toHaveBeenCalledOnce());
    for (const handler of nodes.get('dmh-title-exit')!.handlers.get('click')!) handler({});
    expect(location.assign).toHaveBeenCalledWith(
      'https://danbooru.donmai.us/posts?tags=old&dmh=0',
    );
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

describe('settings editors and content filtering', () => {
  it.each(['blacklist', 'download'])('opens and closes the %s editor and restores focus', async (name) => {
    boot(adapter);
    await vi.waitFor(() => expect(adapter.getPosts).toHaveBeenCalledOnce());
    const button = nodes.get('dmh-' + name + '-editor-open')!;
    const dialog = nodes.get('dmh-' + name + '-editor')!;
    button.handlers.get('click')!.forEach(fn => fn({}));
    expect(dialog.showModal).toHaveBeenCalledOnce();
    nodes.get('dmh-' + name + '-editor-close')!.handlers.get('click')!.forEach(fn => fn({}));
    expect(dialog.close).toHaveBeenCalledOnce();
    dialog.handlers.get('close')!.forEach(fn => fn({}));
    expect(button.focus).toHaveBeenCalledOnce();
    const event = { key: 'ArrowLeft', stopPropagation: vi.fn() };
    dialog.handlers.get('keydown')!.forEach(fn => fn(event));
    expect(event.stopPropagation).toHaveBeenCalledOnce();
    dialog.handlers.get('pointerdown')!.forEach(fn => fn({ target: dialog, button: 0, clientX: 0, clientY: 0 }));
    dialog.handlers.get('click')!.forEach(fn => fn({ target: dialog, clientX: 0, clientY: 0 }));
    expect(dialog.close).toHaveBeenCalledTimes(2);
  });
  it('defaults to unfiltered search and saves toggles without changing the entered query', async () => {
    const save = vi.fn();
    vi.stubGlobal('GM_setValue', save);
    boot(adapter);
    await vi.waitFor(() => expect(adapter.getPosts).toHaveBeenCalledOnce());
    const state = renderedState();
    expect(state.hideNsfw).toBe(false);
    expect(adapter.getPosts).toHaveBeenLastCalledWith(expect.objectContaining({ tags: 'old' }));
    state.tags = 'a or b';
    state.page = 9;
    const toggle = (checked: boolean) => nodes.get('dmh-show-nsfw')!.handlers.get('change')!.forEach(fn => fn({ target: { checked } }));
    toggle(false);
    await vi.waitFor(() => expect(state.loading).toBe(false));
    expect(adapter.getPosts).toHaveBeenLastCalledWith(expect.objectContaining({ tags: '( a or b ) rating:g', page: 1 }));
    expect(state.tags).toBe('a or b');
    expect(nodes.get('dmh-tags')!.value).toBe('a or b');
    expect(save).toHaveBeenLastCalledWith('danbooru-masonry.hideNsfw', true);
    toggle(true);
    await vi.waitFor(() => expect(state.loading).toBe(false));
    expect(adapter.getPosts).toHaveBeenLastCalledWith(expect.objectContaining({ tags: 'a or b', page: 1 }));
    expect(save).toHaveBeenLastCalledWith('danbooru-masonry.hideNsfw', false);
  });
  it('restores the NSFW preference for the first request', async () => {
    vi.stubGlobal('GM_getValue', (key: string, fallback: unknown) => key === 'danbooru-masonry.hideNsfw' ? true : fallback);
    boot(adapter);
    await vi.waitFor(() => expect(adapter.getPosts).toHaveBeenCalledOnce());
    expect(renderedState().hideNsfw).toBe(true);
    expect(adapter.getPosts).toHaveBeenLastCalledWith(expect.objectContaining({ tags: '( old ) rating:g' }));
  });
  it('ignores an unfiltered response arriving after the filter is enabled', async () => {
    let resolveOld!: (value: GetPostsResult) => void;
    vi.mocked(adapter.getPosts).mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve; }));
    boot(adapter);
    await vi.waitFor(() => expect(adapter.getPosts).toHaveBeenCalledOnce());
    nodes.get('dmh-show-nsfw')!.handlers.get('change')!.forEach(fn => fn({ target: { checked: false } }));
    await vi.waitFor(() => expect(renderedState().loading).toBe(false));
    resolveOld({ posts: [normalizePost({ id: 9, rating: 'e' }, adapter.origin)], hasSourcePosts: true });
    await Promise.resolve();
    expect(renderedState().posts).toEqual([]);
    expect(renderedState().sourcePosts).toEqual([]);
  });
});

describe('search error display', () => {
  it('shows the Chinese tag limit and a trusted upgrade link', async () => {
    vi.mocked(adapter.getPosts).mockRejectedValue(new ApiError(422, 'PostQuery::TagLimitError', 'You cannot search for more than 2 tags at a time.', 'posts.json'));
    boot(adapter);
    await vi.waitFor(() => expect(nodes.get('dmh-message')?.textContent).toContain('最多搜索 2 个标签'));
    const link = nodes.get('dmh-message')!.appendChild.mock.calls[0][0];
    expect(link.href).toBe('https://danbooru.donmai.us/upgrade');
    expect(link.textContent).toBe(' 升级账号');
    expect(link.rel).toBe('noreferrer');
  });
  it('renders unknown server details as text, not markup', async () => {
    vi.mocked(adapter.getPosts).mockRejectedValue(new ApiError(422, 'PostQuery::Error', '<img src=x onerror=alert(1)>', 'posts.json'));
    boot(adapter);
    await vi.waitFor(() => expect(nodes.get('dmh-message')?.textContent).toContain('<img'));
    expect(nodes.get('dmh-message')!.innerHTML).toBe('');
    expect(nodes.get('dmh-message')!.appendChild).not.toHaveBeenCalled();
  });
});

describe('Chinese empty results and blacklist read failures', () => {
  it('shows a Chinese message for empty search results', async () => {
    boot(adapter);
    await vi.waitFor(() => expect(nodes.get('dmh-message')?.textContent).toBe('没有找到符合条件的图片。'));
  });
  it('never submits blacklist changes when capture was unavailable', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    boot(adapter);
    await vi.waitFor(() => expect(adapter.getPosts).toHaveBeenCalledOnce());
    renderedState().blacklistAvailable = false;
    document.body.dataset.currentUserId = '42';
    nodes.get('dmh-blacklist-save')!.handlers.get('click')!.forEach(fn => fn({}));
    await Promise.resolve();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('settings editor selection and empty templates', () => {
  it.each(['blacklist', 'download'])('keeps the %s editor open when dragging from content to the backdrop', async name => {
    boot(adapter);
    await vi.waitFor(() => expect(adapter.getPosts).toHaveBeenCalledOnce());
    const dialog = nodes.get('dmh-' + name + '-editor')!;
    const fire = (type: string, event: unknown) => dialog.handlers.get(type)!.forEach(fn => fn(event));
    fire('pointerdown', { target: {}, button: 0, clientX: 50, clientY: 50 });
    fire('click', { target: dialog, clientX: 150, clientY: 50 });
    expect(dialog.close).not.toHaveBeenCalled();
    fire('pointerdown', { target: dialog, button: 0, clientX: 0, clientY: 0 });
    fire('pointercancel', {});
    fire('click', { target: dialog, clientX: 0, clientY: 0 });
    expect(dialog.close).not.toHaveBeenCalled();
    fire('pointerdown', { target: dialog, button: 0, clientX: 0, clientY: 0 });
    fire('click', { target: {}, clientX: 50, clientY: 50 });
    expect(dialog.close).not.toHaveBeenCalled();
    fire('pointerdown', { target: dialog, button: 0, clientX: 0, clientY: 0 });
    fire('click', { target: dialog, clientX: 0, clientY: 0 });
    expect(dialog.close).toHaveBeenCalledOnce();
  });
  it.each(['', '   '])('restores an empty template %j to the last saved value when closed', async empty => {
    const save = vi.fn();
    vi.stubGlobal('GM_setValue', save);
    boot(adapter);
    await vi.waitFor(() => expect(adapter.getPosts).toHaveBeenCalledOnce());
    const state = renderedState();
    state.downloadFilenameTemplates.pixiv = 'my_saved_{postid}.{ext}';
    const get = (id: string) => document.getElementById(id) as unknown as ReturnType<typeof node>;
    const input = get('dmh-download-template-pixiv');
    input.value = empty;
    const other = get('dmh-download-template-twitter');
    other.value = 'valid_{id}.{ext}';
    nodes.get('dmh-download-editor')!.handlers.get('close')!.forEach(fn => fn({}));
    expect(input.value).toBe('my_saved_{postid}.{ext}');
    expect(input.setCustomValidity).toHaveBeenCalledWith('');
    expect(other.value).toBe(state.downloadFilenameTemplates.twitter);
    nodes.get('dmh-download-editor-open')!.handlers.get('click')!.forEach(fn => fn({}));
    expect(input.value).toBe('my_saved_{postid}.{ext}');
    expect(save).not.toHaveBeenCalled();
  });
});

describe('download template drafts', () => {
  async function setupDraft() {
    boot(adapter);
    await vi.waitFor(() => expect(adapter.getPosts).toHaveBeenCalledOnce());
    nodes.get('dmh-download-editor-open')!.handlers.get('click')!.forEach(fn => fn({}));
    return nodes.get('dmh-download-template-pixiv')!;
  }
  it('saves fields together and keeps empty drafts out of storage', async () => {
    const save = vi.fn(); vi.stubGlobal('GM_setValue', save);
    const input = await setupDraft();
    const old = { ...renderedState().downloadFilenameTemplates };
    input.value = '  ';
    nodes.get('dmh-download-save')!.handlers.get('click')!.forEach(fn => fn({}));
    expect(save).not.toHaveBeenCalled();
    expect(renderedState().downloadFilenameTemplates).toEqual(old);
    expect(input.reportValidity).toHaveBeenCalledOnce();
    input.value = 'new_{postid}.{ext}';
    nodes.get('dmh-download-save')!.handlers.get('click')!.forEach(fn => fn({}));
    expect(save).toHaveBeenCalledExactlyOnceWith('danbooru-masonry.downloadFilenameTemplates', { ...old, pixiv: 'new_{postid}.{ext}' });
    expect(nodes.get('dmh-download-editor')!.close).toHaveBeenCalledOnce();
  });
  it('reset changes only the draft; cancel restores every saved template', async () => {
    const save = vi.fn(); vi.stubGlobal('GM_setValue', save);
    const input = await setupDraft();
    renderedState().downloadFilenameTemplates.pixiv = 'saved_{id}.{ext}';
    input.value = 'draft_{id}.{ext}';
    nodes.get('dmh-download-template-reset')!.handlers.get('click')!.forEach(fn => fn({}));
    expect(save).not.toHaveBeenCalled();
    expect(renderedState().downloadFilenameTemplates.pixiv).toBe('saved_{id}.{ext}');
    expect(input.value).toBe('pixiv[{artist}]_{original}');
    nodes.get('dmh-download-cancel')!.handlers.get('click')!.forEach(fn => fn({}));
    nodes.get('dmh-download-editor')!.handlers.get('close')!.forEach(fn => fn({}));
    expect(input.value).toBe('saved_{id}.{ext}');
    expect(save).not.toHaveBeenCalled();
  });
});

describe('blacklist draft lifecycle', () => {
  async function openDraft() {
    boot(adapter);
    await vi.waitFor(() => expect(adapter.getPosts).toHaveBeenCalledOnce());
    document.body.dataset.currentUserId = '42';
    renderedState().blacklistText = 'original_rule';
    nodes.get('dmh-blacklist-editor-open')!.handlers.get('click')!.forEach(fn => fn({}));
    return nodes.get('dmh-blacklist-rules')!;
  }
  it('discards edits on cancel without sending an account request', async () => {
    const save = vi.spyOn(userSettings, 'updateBlacklistedTags').mockResolvedValue();
    const input = await openDraft();
    input.value = 'draft_rule';
    nodes.get('dmh-blacklist-cancel')!.handlers.get('click')!.forEach(fn => fn({}));
    nodes.get('dmh-blacklist-editor')!.handlers.get('close')!.forEach(fn => fn({}));
    expect(input.value).toBe('original_rule');
    expect(save).not.toHaveBeenCalled();
  });
  it('blocks closing while saving and closes only after the account update succeeds', async () => {
    let resolve!: () => void;
    const save = vi.spyOn(userSettings, 'updateBlacklistedTags').mockImplementation(() => new Promise<void>(r => { resolve = r; }));
    const input = await openDraft();
    const dialog = nodes.get('dmh-blacklist-editor')!;
    input.value = 'draft_rule';
    nodes.get('dmh-blacklist-save')!.handlers.get('click')!.forEach(fn => fn({}));
    expect(input.readOnly).toBe(true);
    nodes.get('dmh-blacklist-cancel')!.handlers.get('click')!.forEach(fn => fn({}));
    const escape = { preventDefault: vi.fn() };
    dialog.handlers.get('cancel')!.forEach(fn => fn(escape));
    expect(escape.preventDefault).toHaveBeenCalledOnce();
    expect(dialog.close).not.toHaveBeenCalled();
    resolve();
    await vi.waitFor(() => expect(dialog.close).toHaveBeenCalledOnce());
    expect(renderedState().blacklistText).toBe('draft_rule');
    expect(input.readOnly).toBe(false);
    expect(save).toHaveBeenCalledExactlyOnceWith(adapter.origin, '42', 'draft_rule');
  });
  it('retains the failed draft and permits retry', async () => {
    vi.spyOn(userSettings, 'updateBlacklistedTags').mockRejectedValue(new Error('保存失败'));
    const input = await openDraft();
    input.value = 'draft_rule';
    nodes.get('dmh-blacklist-save')!.handlers.get('click')!.forEach(fn => fn({}));
    await vi.waitFor(() => expect(renderedState().blacklistSaving).toBe(false));
    expect(input.value).toBe('draft_rule');
    expect(renderedState().blacklistText).toBe('original_rule');
    expect(nodes.get('dmh-blacklist-editor')!.close).not.toHaveBeenCalled();
    expect(nodes.get('dmh-blacklist-cancel')!.disabled).toBe(false);
  });
});

it('does not validate templates while typing, but validates on Save', async () => {
  const input = document.getElementById('dmh-download-template-pixiv') as unknown as ReturnType<typeof node>;
  vi.stubGlobal('document', { ...document, querySelectorAll: (selector: string) => selector === 'input[data-download-template]' ? [input] : [] });
  boot(adapter);
  await vi.waitFor(() => expect(adapter.getPosts).toHaveBeenCalledOnce());
  nodes.get('dmh-download-editor-open')!.handlers.get('click')!.forEach(fn => fn({}));
  input.value = '  ';
  input.handlers.get('input')!.forEach(fn => fn({}));
  expect(input.setCustomValidity).toHaveBeenLastCalledWith('');
  expect(input.reportValidity).not.toHaveBeenCalled();
  nodes.get('dmh-download-save')!.handlers.get('click')!.forEach(fn => fn({}));
  expect(input.setCustomValidity).toHaveBeenLastCalledWith('模板不能为空');
  expect(input.reportValidity).toHaveBeenCalledOnce();
});
