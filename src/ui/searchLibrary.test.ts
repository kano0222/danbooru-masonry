import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { bindSearchLibrary, renderPopularSearches, renderSearchLists, translateSearchQuery } from './searchLibrary';
import { showSearchPanel } from './searchPanel';
import type { SearchLibraryData } from '../core/searchLibrary';
import type { PopularSearch } from '../api/popularSearches';

type Listener = (event: any) => void;
function element() {
  const listeners = new Map<string, Listener>();
  return {
    listeners, hidden: true, innerHTML: '', scrollTop: 0, dataset: {} as Record<string, string>,
    addEventListener: (type: string, fn: Listener) => listeners.set(type, fn),
    setAttribute: vi.fn(), focus: vi.fn(), querySelectorAll: () => [],
  };
}
let nodes: Map<string, ReturnType<typeof element>>;
let storage: SearchLibraryData;
let onSearch: ReturnType<typeof vi.fn<(query: string) => void>>;
let onClose: ReturnType<typeof vi.fn<(preservePanel?: boolean) => void>>;
let loadPopular: ReturnType<typeof vi.fn<() => Promise<PopularSearch[]>>>;
let controller: ReturnType<typeof bindSearchLibrary>;
let documentEvents: Map<string, Listener>;
const translations: Record<string, string> = { blue_hair: '蓝发', red_hair: '红发' };
const translate = (tag: string) => translations[tag] || '';
const get = (id: string) => nodes.get(`dmh-${id}`)!;
function action(searchAction: string, query: string) {
  const button = { dataset: { searchAction, query } };
  get('search-library').listeners.get('click')!({ target: { closest: () => button } });
}

beforeEach(() => {
  vi.useFakeTimers();
  storage = { pinned: ['blue_hair'], recent: ['new', 'old'] };
  nodes = new Map(['tags', 'search-panel', 'search-library', 'search-lists', 'search-popular', 'ac']
    .map((id) => [`dmh-${id}`, element()]));
  documentEvents = new Map();
  vi.stubGlobal('document', {
    getElementById: (id: string) => nodes.get(id),
    addEventListener: (type: string, fn: Listener) => documentEvents.set(type, fn),
  });
  vi.stubGlobal('window', { addEventListener: vi.fn() });
  vi.stubGlobal('GM_getValue', () => structuredClone(storage));
  vi.stubGlobal('GM_setValue', (_key: string, data: SearchLibraryData) => { storage = structuredClone(data); });
  onSearch = vi.fn();
  onClose = vi.fn();
  loadPopular = vi.fn(async () => []);
  controller = bindSearchLibrary({ onSearch, onClose, translate, loadPopular });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('search history panel', () => {
  it('shows sixteen entries with popular searches disabled and avoids fetching until enabled', async () => {
    storage = { pinned: ['blue_hair'], recent: Array.from({ length: 20 }, (_, i) => `tag_${i}`) };
    controller = bindSearchLibrary({ onSearch, onClose, translate, loadPopular, hidePopular: true });
    controller.open();
    expect(get('search-lists').innerHTML.match(/data-search-action="search"/g)).toHaveLength(16);
    expect(get('search-popular').hidden).toBe(true);
    expect(loadPopular).not.toHaveBeenCalled();
    action('expand', '');
    expect(get('search-lists').innerHTML.match(/data-search-action="search"/g)).toHaveLength(21);
    controller.close();
    controller.open();
    expect(get('search-lists').innerHTML.match(/data-search-action="search"/g)).toHaveLength(16);
    loadPopular.mockResolvedValue([{ query: 'blue_hair', count: 123 }]);
    controller.setHidePopular(false);
    await Promise.resolve();
    expect(get('search-lists').innerHTML.match(/data-search-action="search"/g)).toHaveLength(8);
    expect(get('search-popular').hidden).toBe(false);
    expect(loadPopular).toHaveBeenCalledOnce();
    controller.setHidePopular(true);
    expect(get('search-popular').hidden).toBe(true);
    expect(get('search-lists').innerHTML.match(/data-search-action="search"/g)).toHaveLength(16);
    controller.setHidePopular(false);
    expect(loadPopular).toHaveBeenCalledOnce();
  });

  it('keeps a late ranking hidden when disabled while loading', async () => {
    let resolve!: (items: PopularSearch[]) => void;
    loadPopular.mockReturnValue(new Promise((done) => { resolve = done; }));
    controller.open();
    controller.setHidePopular(true);
    resolve([{ query: 'blue_hair', count: 10 }]);
    await Promise.resolve();
    expect(get('search-popular').hidden).toBe(true);
    controller.close();
    controller.open();
    expect(get('search-popular').hidden).toBe(true);
    expect(loadPopular).toHaveBeenCalledOnce();
  });

  it('shows eight entries by default and offers expansion below the list only when more exist', () => {
    const data = { pinned: ['blue_hair'], recent: Array.from({ length: 9 }, (_, i) => `tag_${i}`) };
    const collapsed = renderSearchLists(data, translate);
    expect(collapsed.match(/data-search-action="search"/g)).toHaveLength(8);
    expect(collapsed).toContain('aria-expanded="false"');
    expect(collapsed).toContain('展开更多');
    expect(collapsed.indexOf('data-query="blue_hair"')).toBeLessThan(collapsed.indexOf('data-query="tag_0"'));
    expect(collapsed.indexOf('id="dmh-search-history-toggle"')).toBeGreaterThan(collapsed.lastIndexOf('data-search-action="search"'));
    const expanded = renderSearchLists(data, translate, true);
    expect(expanded.match(/data-search-action="search"/g)).toHaveLength(10);
    expect(expanded).toContain('aria-expanded="true"');
    expect(expanded).toContain('>收起<svg');
    expect(renderSearchLists({ pinned: [], recent: data.recent.slice(0, 8) }, translate))
      .not.toContain('data-search-action="expand"');
  });

  it('expands without searching or persisting, collapses scroll position and resets on reopen', () => {
    storage = { pinned: ['blue_hair'], recent: Array.from({ length: 9 }, (_, i) => `tag_${i}`) };
    const before = structuredClone(storage);
    controller.open();
    action('expand', '');
    expect(get('search-lists').innerHTML.match(/data-search-action="search"/g)).toHaveLength(10);
    expect(get('search-panel').hidden).toBe(false);
    get('search-panel').scrollTop = 100;
    action('expand', '');
    expect(get('search-lists').innerHTML.match(/data-search-action="search"/g)).toHaveLength(8);
    expect(get('search-panel').scrollTop).toBe(0);
    action('expand', '');
    get('search-panel').scrollTop = 100;
    controller.close();
    expect(get('search-panel').scrollTop).toBe(0);
    controller.open();
    expect(get('search-lists').innerHTML.match(/data-search-action="search"/g)).toHaveLength(8);
    expect(onSearch).not.toHaveBeenCalled();
    expect(storage).toEqual(before);
    expect(loadPopular).toHaveBeenCalledOnce();
  });

  it('merges history with corner pins and no delete control on pinned entries', () => {
    const pinned = renderSearchLists({ pinned: ['blue_hair'], recent: [] }, translate);
    expect(pinned).toContain('搜索历史');
    expect(pinned).toContain('aria-pressed="true"');
    expect(pinned).not.toContain('data-search-action="remove"');
    expect(pinned).not.toContain('dmh-search-label-inline');
    expect(pinned).toContain('>蓝发</span>');
    expect(pinned).not.toContain('常用搜索');
    const html = renderSearchLists({ pinned: [], recent: ['<img onerror="bad">'] }, translate);
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain('class="dmh-search-remove"');
  });

  it('translates known tags without rewriting the complete search expression', () => {
    expect(translateSearchQuery('blue_hair -red_hair order:score', translate)).toBe('蓝发 · -红发');
    expect(translateSearchQuery('unknown order:score', translate)).toBe('');
    controller.record('blue_hair order:score');
    action('search', 'blue_hair order:score');
    expect(onSearch).toHaveBeenCalledExactlyOnceWith('blue_hair order:score');
  });

  it('summarizes content tags without directives, unknown tags or quoted metadata fragments', () => {
    expect(translateSearchQuery('blue_hair or -red_hair unknown rating:g order:score', translate))
      .toBe('蓝发 · -红发');
    expect(translateSearchQuery('blue_hair blue_hair source:"a red_hair b"', translate)).toBe('蓝发');
    expect(translateSearchQuery('source:"blue_hair red_hair" order:score', translate)).toBe('');
    const html = renderSearchLists({ pinned: [], recent: ['blue_hair -red_hair order:score', 'unknown'] }, translate);
    expect(html).toContain('class="dmh-search-label"><span');
    expect(html).toContain('>蓝发 · -红发</span>');
    expect(html.match(/class="dmh-search-query-cn"/g)).toHaveLength(1);
    expect(html).toContain('data-query="blue_hair -red_hair order:score"');
  });

  it('pins and unpins entries without searching, and deletes without an undo flow', () => {
    action('pin', 'new');
    expect(storage).toEqual({ pinned: ['blue_hair', 'new'], recent: ['old'] });
    action('remove', 'new');
    expect(storage.pinned).toContain('new');
    action('pin', 'new');
    expect(storage).toEqual({ pinned: ['blue_hair'], recent: ['new', 'old'] });
    action('remove', 'new');
    expect(storage.recent).toEqual(['old']);
    expect(onSearch).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('switches contents inside the same panel and restores input focus on Escape', () => {
    controller.open();
    const panel = get('search-panel');
    expect(panel.hidden).toBe(false);
    expect(onClose).toHaveBeenCalledWith(true);
    showSearchPanel('suggestions');
    expect(get('search-panel')).toBe(panel);
    expect(panel.hidden).toBe(false);
    expect(get('search-library').hidden).toBe(true);
    expect(get('ac').hidden).toBe(false);
    controller.open();
    expect(panel.hidden).toBe(false);
    expect(get('ac').hidden).toBe(true);
    documentEvents.get('keydown')!({ key: 'Escape', preventDefault: vi.fn(), stopPropagation: vi.fn() });
    expect(panel.hidden).toBe(true);
    expect(get('tags').focus).toHaveBeenCalled();
  });

  it('renders ranked popular searches with translations and executes a selected query', async () => {
    loadPopular.mockResolvedValue([{ query: 'blue_hair', count: 123 }]);
    controller.open();
    await Promise.resolve();
    expect(get('search-popular').hidden).toBe(false);
    expect(get('search-popular').innerHTML).toContain('>热门搜索</h3>');
    expect(get('search-popular').innerHTML).not.toContain('Danbooru 热门搜索');
    expect(get('search-popular').innerHTML).toContain('123 次搜索');
    expect(get('search-popular').innerHTML).toContain('>蓝发</span>');
    expect(get('search-popular').innerHTML).toContain('dmh-search-label-inline');
    action('search', 'blue_hair');
    expect(onSearch).toHaveBeenCalledExactlyOnceWith('blue_hair');
    expect(storage.recent).not.toContain('blue_hair');
    expect(get('search-panel').hidden).toBe(true);
    expect(renderPopularSearches([], translate)).toBe('');
  });

  it('hides empty or failed rankings and caches failure before retrying', async () => {
    loadPopular.mockRejectedValue(new Error('403'));
    controller.open();
    await Promise.resolve();
    expect(get('search-popular').hidden).toBe(true);
    expect(get('search-lists').innerHTML).toContain('blue_hair');
    controller.open();
    expect(loadPopular).toHaveBeenCalledOnce();
    vi.advanceTimersByTime(5 * 60 * 1000);
    loadPopular.mockResolvedValue([]);
    controller.open();
    await Promise.resolve();
    expect(loadPopular).toHaveBeenCalledTimes(2);
    expect(get('search-popular').hidden).toBe(true);
  });

  it('does not replace suggestions or reopen a dismissed panel when rankings resolve late', async () => {
    let resolve!: (items: PopularSearch[]) => void;
    loadPopular.mockReturnValue(new Promise((done) => { resolve = done; }));
    controller.open();
    controller.open();
    expect(loadPopular).toHaveBeenCalledOnce();
    showSearchPanel('suggestions');
    controller.close();
    resolve([{ query: 'blue_hair', count: 10 }]);
    await Promise.resolve();
    expect(get('search-panel').hidden).toBe(true);
    controller.open();
    expect(get('search-popular').innerHTML).toContain('blue_hair');
    expect(loadPopular).toHaveBeenCalledOnce();
  });
});
