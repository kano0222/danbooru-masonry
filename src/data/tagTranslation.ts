import { fetchWithTimeout } from '../utils/fetch';

export const TAG_TRANSLATION_URL =
  'https://cdn.jsdelivr.net/gh/kano0222/danbooru-tag-zh@main/artifacts/ffdkj/zh-hans.min.json';
export const TAG_TRANSLATION_TIMEOUT_MS = 2500;

async function requestTranslations(): Promise<Record<string, string>> {
  if (typeof GM_xmlhttpRequest === 'function') {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'GET',
        url: TAG_TRANSLATION_URL,
        timeout: TAG_TRANSLATION_TIMEOUT_MS,
        anonymous: true,
        headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
        onload: (response) => {
          try {
            if (response.status < 200 || response.status >= 300) throw new Error(`HTTP ${response.status}`);
            resolve(JSON.parse(response.responseText) as Record<string, string>);
          } catch (error) {
            reject(error);
          }
        },
        onerror: () => reject(new Error('Translation request failed')),
        ontimeout: () => reject(new Error('Translation request timed out')),
        onabort: () => reject(new Error('Translation request aborted')),
      });
    });
  }

  // The local preview has no userscript manager and supplies its own fetch.
  const response = await fetchWithTimeout(TAG_TRANSLATION_URL, TAG_TRANSLATION_TIMEOUT_MS, {
    cache: 'no-cache',
    headers: { Accept: 'application/json' },
    credentials: 'omit',
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return (await response.json()) as Record<string, string>;
}

export class TagTranslationStore {
  private data: Record<string, string> = {};
  private loading: Promise<boolean> | null = null;
  loaded = false;

  load(): Promise<boolean> {
    if (!this.loading) this.loading = this.loadOnce();
    return this.loading;
  }

  translate(tag: string): string {
    for (const key of this.lookupKeys(tag)) {
      const value = this.data[key];
      if (value) return value;
    }
    return '';
  }

  format(tag: string): string {
    const translated = this.translate(tag);
    return translated ? `${tag} ${translated}` : tag;
  }

  private async loadOnce(): Promise<boolean> {
    try {
      this.data = await requestTranslations();
      this.loaded = true;
      return true;
    } catch (error) {
      console.warn('[Danbooru Masonry] tag translation load failed:', error);
      this.data = {};
      this.loaded = false;
      return false;
    }
  }

  private lookupKeys(tag: string): string[] {
    const underscored = tag.replace(/\s+/g, '_');
    const spaced = underscored.replace(/_/g, ' ');
    return [tag, underscored, spaced, tag.toLowerCase(), underscored.toLowerCase(), spaced.toLowerCase()];
  }
}
