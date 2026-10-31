export const SEARCH_LIBRARY_KEY = 'danbooru-masonry.searchLibrary';
export const MAX_RECENT_SEARCHES = 20;
export interface SearchLibraryData {
  pinned: string[];
  recent: string[];
}

function parseQueries(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((query): query is string => typeof query === 'string')
    .map((query) => query.trim()).filter(Boolean))];
}

export function parseSearchLibrary(value: unknown): SearchLibraryData {
  const data = value && typeof value === 'object' ? value as Partial<SearchLibraryData> : {};
  const pinned = parseQueries(data.pinned);
  const recent = parseQueries(data.recent).filter((query) => !pinned.includes(query))
    .slice(0, MAX_RECENT_SEARCHES);
  return { pinned, recent };
}

export class SearchLibrary {
  data: SearchLibraryData = { pinned: [], recent: [] };
  private storageFailed = false;

  constructor() {
    this.refresh();
  }

  refresh(): void {
    if (this.storageFailed) return;
    try {
      this.data = parseSearchLibrary(GM_getValue(SEARCH_LIBRARY_KEY, this.data));
    } catch {
      // Storage can be unavailable; keep this session's searches usable.
    }
  }

  private persist(): void {
    try {
      GM_setValue(SEARCH_LIBRARY_KEY, this.data);
    } catch {
      // Match other settings: changes still apply in this session.
      this.storageFailed = true;
    }
  }

  record(value: string): void {
    const query = value.trim();
    if (!query) return;
    this.refresh();
    if (this.data.pinned.includes(query)) return;
    this.data.recent = [query, ...this.data.recent.filter((item) => item !== query)]
      .slice(0, MAX_RECENT_SEARCHES);
    this.persist();
  }

  togglePinned(query: string): void {
    this.refresh();
    const index = this.data.pinned.indexOf(query);
    if (index >= 0) {
      this.data.pinned.splice(index, 1);
      this.data.recent = [query, ...this.data.recent].slice(0, MAX_RECENT_SEARCHES);
    } else if (this.data.recent.includes(query)) {
      this.data.recent = this.data.recent.filter((item) => item !== query);
      this.data.pinned.push(query);
    } else {
      return;
    }
    this.persist();
  }

  remove(query: string): void {
    this.refresh();
    if (!this.data.recent.includes(query)) return;
    this.data.recent = this.data.recent.filter((item) => item !== query);
    this.persist();
  }
}
