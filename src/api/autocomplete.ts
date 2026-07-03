import type { AutocompleteItem } from '../adapters/types';
import { fetchJson } from '../utils/fetch';

export async function fetchAutocompleteJson(origin: string, query: string): Promise<AutocompleteItem[]> {
  const url = new URL('/autocomplete.json', origin);
  url.searchParams.set('search[type]', 'tag_query');
  url.searchParams.set('search[query]', query);
  url.searchParams.set('limit', '10');
  const result = await fetchJson<unknown[]>(url.toString(), {}, 'autocomplete');
  return (Array.isArray(result) ? result : []).map(normalizeAutocompleteItem).filter((item) => item.value);
}

function normalizeAutocompleteItem(raw: unknown): AutocompleteItem {
  const item = (raw || {}) as Record<string, unknown>;
  return {
    value: String(item.value || item.name || item.label || item.tag || '').trim(),
    count: String(item.post_count ?? item.postCount ?? item.count ?? ''),
    category: String(item.category_name || item.category || item.type || ''),
  };
}
