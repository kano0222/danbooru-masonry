import type { Post } from '../adapters/types';

export function getPostThumbnailUrl(post: Post): string {
  return post.thumbnailUrl || post.previewUrl || post.listUrl || '';
}
