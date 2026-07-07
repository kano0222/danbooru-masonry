import { fetchAutocompleteJson } from '../api/autocomplete';
import { createFavorite, deleteFavorite, isPostFavorited } from '../api/favorites';
import { fetchPostsJson } from '../api/posts';
import { normalizePost as normalizeDanbooruPost } from '../core/normalizePost';
import { mergePostsUrl } from '../utils/url';
import type { AutocompleteItem, BooruAdapter, GetPostsParams, Post } from './types';

export class DanbooruAdapter implements BooruAdapter {
  siteName = 'Danbooru';

  constructor(public origin = 'https://danbooru.donmai.us') {}

  isMatch(location: Location): boolean {
    return (
      location.origin === this.origin &&
      (location.pathname === '/' || location.pathname.startsWith('/posts'))
    );
  }

  getPosts(params: GetPostsParams): Promise<Post[]> {
    return fetchPostsJson(this.origin, params, (raw) => this.normalizePost(raw));
  }

  getAutocomplete(query: string): Promise<AutocompleteItem[]> {
    return fetchAutocompleteJson(this.origin, query);
  }

  createFavorite(postId: string): Promise<void> {
    return createFavorite(this.origin, postId);
  }

  deleteFavorite(postId: string): Promise<void> {
    return deleteFavorite(this.origin, postId);
  }

  isFavorited(postId: string): Promise<boolean> {
    return isPostFavorited(this.origin, postId);
  }

  getPostUrl(postId: string, currentTags = ''): string {
    const url = new URL(`/posts/${encodeURIComponent(postId)}`, this.origin);
    if (currentTags) url.searchParams.set('q', currentTags);
    return url.toString();
  }

  getPostsPageUrl(tags?: string, page?: number): string {
    return mergePostsUrl(this.origin, tags, page);
  }

  normalizePost(raw: unknown): Post {
    return normalizeDanbooruPost(raw, this.origin);
  }
}
