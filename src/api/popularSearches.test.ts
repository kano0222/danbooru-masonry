import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchPopularSearches, parsePopularSearches } from './popularSearches';

beforeEach(() => vi.stubGlobal('window', { setTimeout, clearTimeout }));
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('popular searches API', () => {
  it.each([
    ['2026-01-01T00:30:00Z', '2025-12-31'],
    ['2024-03-01T23:30:00Z', '2024-02-29'],
  ])('falls back once to the previous UTC date for empty rankings at %s', async (now, previous) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(now));
    const fetch = vi.fn()
      .mockResolvedValueOnce(new Response('[]', { headers: { 'content-type': 'application/json' } }))
      .mockResolvedValueOnce(new Response('[["blue_hair",42]]', { headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', fetch);
    await expect(fetchPopularSearches('https://danbooru.donmai.us')).resolves.toEqual([{ query: 'blue_hair', count: 42 }]);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[1][0]).toBe(`https://danbooru.donmai.us/explore/posts/searches.json?date=${previous}`);
  });

  it('stops when the previous ranking is also empty and propagates fallback errors', async () => {
    const fetch = vi.fn().mockImplementation(async () => new Response('[]', { headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', fetch);
    await expect(fetchPopularSearches('https://danbooru.donmai.us')).resolves.toEqual([]);
    expect(fetch).toHaveBeenCalledTimes(2);
    fetch.mockClear();
    fetch.mockResolvedValueOnce(new Response('[]', { headers: { 'content-type': 'application/json' } }))
      .mockResolvedValueOnce(new Response('blocked', { status: 403 }));
    await expect(fetchPopularSearches('https://danbooru.donmai.us')).rejects.toThrow('403');
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('reads the original ranked tuples and requests the same-origin endpoint', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify([['blue_hair', 100], ['landscape', 80]]), {
      headers: { 'content-type': 'application/json' },
    }));
    vi.stubGlobal('fetch', fetch);
    await expect(fetchPopularSearches('https://danbooru.donmai.us')).resolves.toEqual([
      { query: 'blue_hair', count: 100 }, { query: 'landscape', count: 80 },
    ]);
    expect(fetch).toHaveBeenCalledWith('https://danbooru.donmai.us/explore/posts/searches.json',
      expect.objectContaining({ credentials: 'same-origin', signal: expect.any(AbortSignal) }));
    expect(fetch).toHaveBeenCalledOnce();
  });

  it('rejects HTTP and non-JSON responses instead of treating them as rankings', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('blocked', { status: 403 })));
    await expect(fetchPopularSearches('https://danbooru.donmai.us')).rejects.toThrow('403');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>challenge</html>', {
      headers: { 'content-type': 'text/html' },
    })));
    await expect(fetchPopularSearches('https://danbooru.donmai.us')).rejects.toThrow();
  });

  it('ignores malformed entries, deduplicates and limits the ranking to ten', () => {
    expect(parsePopularSearches([[' a b ', 9], ['a b', 8], ['', 10], ['bad', -1], ['nan', NaN], ['bad', '3'], null]))
      .toEqual([{ query: 'a b', count: 9 }]);
    expect(parsePopularSearches(Array.from({ length: 20 }, (_, i) => [`tag_${i}`, 20 - i]))).toHaveLength(10);
    expect(parsePopularSearches({})).toEqual([]);
    expect(parsePopularSearches([])).toEqual([]);
  });

  it('aborts stalled requests after five seconds', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('window', { setTimeout, clearTimeout });
    vi.stubGlobal('fetch', vi.fn((_url: string, init: RequestInit) => new Promise((_resolve, reject) => {
      init.signal?.addEventListener('abort', () => reject(new Error('aborted')));
    })));
    const result = expect(fetchPopularSearches('https://danbooru.donmai.us')).rejects.toThrow('aborted');
    await vi.advanceTimersByTimeAsync(5000);
    await result;
  });
});
