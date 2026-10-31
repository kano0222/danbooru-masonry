import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_RECENT_SEARCHES, parseSearchLibrary, SEARCH_LIBRARY_KEY, SearchLibrary } from './searchLibrary';

let storage: unknown;
beforeEach(() => {
  storage = undefined;
  vi.stubGlobal('GM_getValue', (_key: string, fallback: unknown) => structuredClone(storage ?? fallback));
  vi.stubGlobal('GM_setValue', (key: string, value: unknown) => {
    expect(key).toBe(SEARCH_LIBRARY_KEY);
    storage = structuredClone(value);
  });
});
afterEach(() => vi.unstubAllGlobals());

describe('search history', () => {
  it('retains the newest twenty saved searches without limiting pinned entries', () => {
    const pinned = Array.from({ length: 25 }, (_, i) => `pinned_${i}`);
    storage = { pinned, recent: Array.from({ length: 30 }, (_, i) => `recent_${i}`) };
    const library = new SearchLibrary();
    expect(library.data.pinned).toEqual(pinned);
    expect(library.data.recent).toEqual(Array.from({ length: 20 }, (_, i) => `recent_${i}`));
    library.record('new');
    expect((storage as { recent: string[] }).recent).toEqual(['new', ...Array.from({ length: 19 }, (_, i) => `recent_${i}`)]);
    library.togglePinned('pinned_0');
    expect(library.data.recent).toHaveLength(20);
    expect(library.data.recent[0]).toBe('pinned_0');
    expect(library.data.recent).not.toContain('recent_18');
    expect(library.data.pinned).toEqual(pinned.slice(1));
  });
  it('sanitizes queries and deduplicates pinned and recent entries without rewriting syntax', () => {
    expect(parseSearchLibrary({ pinned: ['  a  b ', null, '', 'a  b'], recent: ['a  b', 'b a'] }))
      .toEqual({ pinned: ['a  b'], recent: ['b a'] });
    expect(parseSearchLibrary(null)).toEqual({ pinned: [], recent: [] });
  });

  it('records nonempty explicit searches and moves reuse to the front', () => {
    const library = new SearchLibrary();
    library.record(' ');
    expect(storage).toBeUndefined();
    for (let i = 0; i < 35; i++) library.record(`tag_${i}`);
    library.record(' tag_8 ');
    expect(library.data.recent).toHaveLength(MAX_RECENT_SEARCHES);
    expect(library.data.recent[0]).toBe('tag_8');
    expect(library.data.recent.filter((query) => query === 'tag_8')).toHaveLength(1);
    expect(library.data.recent).not.toContain('tag_4');
    expect(new SearchLibrary().data).toEqual(library.data);
  });

  it('keeps pinned entries separate from the eviction limit without duplicates on reuse', () => {
    const library = new SearchLibrary();
    library.record('a');
    library.togglePinned('a');
    for (let i = 0; i < 35; i++) library.record(`tag_${i}`);
    library.record('a');
    expect(library.data.pinned).toEqual(['a']);
    expect(library.data.recent).toHaveLength(20);
    expect(library.data.recent).not.toContain('a');
    library.remove('a');
    expect(library.data.pinned).toEqual(['a']);
  });

  it('unpins into the front of recent history instead of deleting', () => {
    const library = new SearchLibrary();
    library.record('a');
    library.togglePinned('a');
    library.record('b');
    library.togglePinned('a');
    expect(library.data).toEqual({ pinned: [], recent: ['a', 'b'] });
    library.remove('a');
    expect(library.data.recent).toEqual(['b']);
    library.togglePinned('missing');
    expect(library.data.pinned).toEqual([]);
  });

  it('preserves pin order while ordinary history is updated', () => {
    const library = new SearchLibrary();
    for (const query of ['a', 'b']) { library.record(query); library.togglePinned(query); }
    library.record('a');
    library.record('c');
    expect(library.data).toEqual({ pinned: ['a', 'b'], recent: ['c'] });
  });

  it('reads newer stored searches before mutations from another tab', () => {
    const first = new SearchLibrary();
    const second = new SearchLibrary();
    first.record('a');
    second.togglePinned('a');
    first.record('b');
    expect(first.data).toEqual({ pinned: ['a'], recent: ['b'] });
  });

  it('remains usable within the session if storage is blocked', () => {
    vi.stubGlobal('GM_getValue', () => { throw new Error('blocked'); });
    vi.stubGlobal('GM_setValue', () => { throw new Error('blocked'); });
    const library = new SearchLibrary();
    library.record('a');
    library.togglePinned('a');
    library.record('b');
    expect(library.data).toEqual({ pinned: ['a'], recent: ['b'] });
  });

  it('keeps session changes when storage remains readable but writes fail', () => {
    storage = { pinned: ['old'], recent: [] };
    vi.stubGlobal('GM_setValue', () => { throw new Error('read only'); });
    const library = new SearchLibrary();
    library.record('new');
    library.togglePinned('new');
    expect(library.data).toEqual({ pinned: ['old', 'new'], recent: [] });
  });
});
