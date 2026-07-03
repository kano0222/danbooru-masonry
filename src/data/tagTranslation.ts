import { fetchWithTimeout } from '../utils/fetch';

export const TAG_TRANSLATION_URL =
  'https://cdn.jsdelivr.net/gh/asadahimeka/yandere-masonry@main/src/data/all_tags_cn_space.min.json';
export const TAG_TRANSLATION_TIMEOUT_MS = 2500;

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
      const response = await fetchWithTimeout(TAG_TRANSLATION_URL, TAG_TRANSLATION_TIMEOUT_MS, {
        headers: { Accept: 'application/json' },
        credentials: 'omit',
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this.data = (await response.json()) as Record<string, string>;
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
