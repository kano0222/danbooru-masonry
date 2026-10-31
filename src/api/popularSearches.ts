import { fetchWithTimeout } from '../utils/fetch';

export interface PopularSearch {
  query: string;
  count: number;
}

export async function fetchPopularSearches(origin: string): Promise<PopularSearch[]> {
  const url = new URL('/explore/posts/searches.json', origin);
  const previousDay = new Date();
  previousDay.setUTCDate(previousDay.getUTCDate() - 1);
  const searches = await requestPopularSearches(url);
  if (searches.length) return searches;
  url.searchParams.set('date', previousDay.toISOString().slice(0, 10));
  return requestPopularSearches(url);
}

async function requestPopularSearches(url: URL): Promise<PopularSearch[]> {
  const response = await fetchWithTimeout(url.toString(), 5000, {
    credentials: 'same-origin', headers: { Accept: 'application/json' },
  });
  if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
    throw new Error(`Popular searches request failed: HTTP ${response.status}`);
  }
  return parsePopularSearches(await response.json());
}

export function parsePopularSearches(value: unknown): PopularSearch[] {
  if (!Array.isArray(value)) return [];
  const searches: PopularSearch[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (!Array.isArray(item) || typeof item[0] !== 'string' || typeof item[1] !== 'number') continue;
    const query = item[0].trim();
    const count = item[1];
    if (!query || !Number.isFinite(count) || count <= 0 || seen.has(query)) continue;
    searches.push({ query, count });
    seen.add(query);
    if (searches.length === 10) break;
  }
  return searches;
}
