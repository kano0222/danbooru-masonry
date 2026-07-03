import type { GetPostsParams, Post } from '../adapters/types';
import { fetchJson } from '../utils/fetch';

export async function fetchPostsJson(
  origin: string,
  params: GetPostsParams,
  normalize: (raw: unknown) => Post,
): Promise<Post[]> {
  const url = new URL('/posts.json', origin);
  const currentParams = new URLSearchParams(params.pageUrlSearch || '');
  const z = currentParams.get('z');
  url.searchParams.set('tags', params.tags);
  url.searchParams.set('page', String(params.page));
  if (z) url.searchParams.set('z', z);
  const data = await fetchJson<unknown[]>(url.toString(), {}, 'posts.json');
  return (Array.isArray(data) ? data : []).map(normalize).filter((post) => post.available);
}
