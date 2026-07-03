export function absoluteUrl(value: unknown, origin: string): string {
  const url = typeof value === 'string' ? value.trim() : '';
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('//')) return `${location.protocol}${url}`;
  if (url.startsWith('/')) return new URL(url, origin).toString();
  return url;
}

export function isHttpUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export function mergePostsUrl(origin: string, tags?: string, page?: number): string {
  const url = new URL('/posts', origin);
  if (tags) url.searchParams.set('tags', tags);
  if (page && page > 1) url.searchParams.set('page', String(page));
  return url.toString();
}
