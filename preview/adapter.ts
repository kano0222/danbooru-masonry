import type { AutocompleteItem, BooruAdapter, GetPostsParams, Post } from '../src/adapters/types';

export const PAGE_SIZE = 20;

/** Local demo data only; never delegates to the live Danbooru adapter. */
export class PreviewAdapter implements BooruAdapter {
  siteName = 'Danbooru';
  origin: string;

  constructor(private posts: Post[], private pageUrl: string) {
    this.origin = new URL(pageUrl).origin;
  }

  isMatch(): boolean { return true; }

  private matchingPosts(query: string): Post[] {
    const terms = query.split(/\s+/).filter((term) => term && term !== '(' && term !== ')');
    const result = this.posts.filter((post) => terms.every((term) => {
      const negative = term.startsWith('-');
      const value = negative ? term.slice(1) : term;
      let matches: boolean;
      if (value.startsWith('order:')) return true;
      if (/^(?:ordfav|fav):/.test(value)) matches = post.favorited;
      else if (value.startsWith('rating:')) {
        const rating = value.slice(7);
        const aliases: Record<string, string> = { general: 'g', sensitive: 's', questionable: 'q', explicit: 'e' };
        matches = post.rating === (aliases[rating] ?? rating);
      }
      else matches = post.tags.includes(value);
      return negative ? !matches : matches;
    }));
    if (terms.includes('order:rank') || terms.includes('order:score')) {
      result.sort((a, b) => b.score - a.score);
    }
    return result;
  }

  async getPosts({ tags, page }: GetPostsParams) {
    const posts = this.matchingPosts(tags).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    return { posts, hasSourcePosts: posts.length > 0 };
  }

  async getPostCount(tags: string): Promise<number> {
    return this.matchingPosts(tags).length;
  }

  async getAutocomplete(query: string): Promise<AutocompleteItem[]> {
    const counts = new Map<string, { count: number; category: string }>();
    for (const post of this.posts) {
      for (const [category, tags] of Object.entries(post.tagGroups)) {
        for (const tag of tags) {
          const previous = counts.get(tag);
          counts.set(tag, { count: (previous?.count ?? 0) + 1, category });
        }
      }
    }
    return [...counts].filter(([tag]) => tag.includes(query.toLowerCase()))
      .sort((a, b) => b[1].count - a[1].count).slice(0, 10)
      .map(([value, { count, category }]) => ({ value, count: String(count), category }));
  }

  async createFavorite(id: string): Promise<void> { this.findPost(id).favorited = true; }
  async deleteFavorite(id: string): Promise<void> { this.findPost(id).favorited = false; }
  async isFavorited(id: string): Promise<boolean> { return this.findPost(id).favorited; }

  getPostUrl(id: string): string {
    const index = this.posts.findIndex((post) => post.id === id);
    const url = new URL(this.getPostsPageUrl('', Math.floor(Math.max(0, index) / PAGE_SIZE) + 1));
    url.hash = `post-${id}`;
    return url.toString();
  }

  getPostsPageUrl(tags = '', page = 1): string {
    const url = new URL(this.pageUrl);
    url.search = '';
    url.hash = '';
    if (tags) url.searchParams.set('tags', tags);
    url.searchParams.set('page', String(page));
    return url.toString();
  }

  normalizePost(): Post { throw new Error('Preview posts are already normalized'); }

  private findPost(id: string): Post {
    const post = this.posts.find((item) => item.id === id);
    if (!post) throw new Error(`Unknown preview post: ${id}`);
    return post;
  }
}
