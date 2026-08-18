import type { GetPostsParams, GetPostsResult, Post } from '../adapters/types';
import { isPostBlacklisted } from '../core/blacklist';
import { fetchJson } from '../utils/fetch';

export async function fetchPostsJson(
  origin: string,
  params: GetPostsParams,
  normalize: (raw: unknown) => Post,
): Promise<GetPostsResult> {
  const url = new URL('/posts.json', origin);
  const currentParams = new URLSearchParams(params.pageUrlSearch || '');
  const z = currentParams.get('z');
  url.searchParams.set('tags', params.tags);
  url.searchParams.set('page', String(params.page));
  if (z) url.searchParams.set('z', z);
  const data = await fetchJson<unknown[]>(url.toString(), {}, 'posts.json');
  const rawPosts = Array.isArray(data) ? data : [];
  return {
    posts: rawPosts
      .map(normalize)
      .filter((post) => post.available && !isPostBlacklisted(post, params.blacklist)),
    hasSourcePosts: rawPosts.length > 0,
  };
}
