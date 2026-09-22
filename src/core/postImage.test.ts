import { describe, expect, it } from 'vitest';
import type { Post } from '../adapters/types';
import { getPostThumbnailUrl } from './postImage';

describe('getPostThumbnailUrl', () => {
  it('keeps the card image as the viewer placeholder even when it is also the final image', () => {
    const post = {
      thumbnailUrl: 'https://example.com/720.jpg',
      previewUrl: 'https://example.com/180.jpg',
      listUrl: 'https://example.com/720.jpg',
      viewerUrl: 'https://example.com/720.jpg',
    } as Post;
    expect(getPostThumbnailUrl(post)).toBe(post.thumbnailUrl);
  });

  it('uses the same thumbnail when the final viewer image is different', () => {
    const post = {
      thumbnailUrl: 'https://example.com/720.jpg',
      previewUrl: 'https://example.com/180.jpg',
      listUrl: 'https://example.com/720.jpg',
      viewerUrl: 'https://example.com/sample.jpg',
    } as Post;
    expect(getPostThumbnailUrl(post)).toBe(post.thumbnailUrl);
  });

  it('falls back to the preview and then the list image', () => {
    expect(getPostThumbnailUrl({ previewUrl: 'preview', listUrl: 'list' } as Post)).toBe(
      'preview',
    );
    expect(getPostThumbnailUrl({ listUrl: 'list' } as Post)).toBe('list');
  });
});
