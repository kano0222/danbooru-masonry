import type { Post, BooruAdapter } from '../adapters/types';
import type { TagClickBehavior } from './state';

export function getViewerTags(post: Post): string[] {
  const groups = post.tagGroups;
  const excluded = new Set([
    ...groups.artist,
    ...groups.copyright,
    ...groups.character,
    ...groups.meta,
  ]);
  return [...new Set(groups.general)].filter((tag) => tag && !excluded.has(tag));
}

export function getTagSearchUrl(
  adapter: BooruAdapter,
  tag: string,
  behavior: TagClickBehavior,
): string {
  const url = new URL(adapter.getPostsPageUrl(tag));
  if (behavior === 'masonry-new-tab') url.searchParams.set('dmh', '1');
  return url.toString();
}

export function shouldSearchInCurrentTab(event: MouseEvent, behavior: TagClickBehavior): boolean {
  return (
    behavior === 'masonry-current-tab' &&
    event.button === 0 &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

export function consumeMasonryLaunchUrl(href: string): string | null {
  const url = new URL(href);
  if (!['/', '/posts', '/posts/'].includes(url.pathname) || url.searchParams.get('dmh') !== '1')
    return null;
  url.searchParams.delete('dmh');
  return url.toString();
}
