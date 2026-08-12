import { describe, expect, it } from 'vitest';

import { normalizePost } from './normalizePost';

const origin = 'https://danbooru.donmai.us';

describe('normalizePost', () => {
  it('normalizes common Danbooru post fields and derived URLs', () => {
    const post = normalizePost(
      {
        id: 123,
        file_url: '/data/original/image.jpg',
        large_file_url: '/data/large/image.jpg',
        sample_file_url: '/data/sample/image.jpg',
        preview_file_url: '/data/preview/image.jpg',
        image_width: '1200',
        image_height: '800',
        tag_string: 'blue_archive yuuka highres',
        tag_string_copyright: 'blue_archive',
        tag_string_character: 'yuuka',
        tag_string_meta: 'highres',
        rating: 's',
        score: '42',
      },
      origin,
    );

    expect(post.id).toBe('123');
    expect(post.fileUrl).toBe('https://danbooru.donmai.us/data/original/image.jpg');
    expect(post.thumbnailUrl).toBe('https://danbooru.donmai.us/data/preview/image.jpg');
    expect(post.listUrl).toBe('https://danbooru.donmai.us/data/preview/image.jpg');
    expect(post.playbackUrl).toBe('');
    expect(post.viewerUrl).toBe('https://danbooru.donmai.us/data/sample/image.jpg');
    expect(post.width).toBe(1200);
    expect(post.height).toBe(800);
    expect(post.aspectRatio).toBe(1.5);
    expect(post.tags).toEqual(['blue_archive', 'yuuka', 'highres']);
    expect(post.tagGroups.general).toEqual([]);
    expect(post.rating).toBe('s');
    expect(post.score).toBe(42);
    expect(post.fileExt).toBe('jpg');
    expect(post.isVideo).toBe(false);
    expect(post.isUgoira).toBe(false);
    expect(post.available).toBe(true);
  });

  it.each(['mp4', 'webm'])('uses an original %s file as the playback resource', (extension) => {
    const post = normalizePost(
      {
        id: 2,
        file_ext: extension,
        file_url: `https://cdn.donmai.us/original/video.${extension}`,
        preview_file_url: 'https://cdn.donmai.us/preview/video.jpg',
      },
      origin,
    );

    expect(post.thumbnailUrl).toBe('https://cdn.donmai.us/preview/video.jpg');
    expect(post.playbackUrl).toBe(`https://cdn.donmai.us/original/video.${extension}`);
    expect(post.isVideo).toBe(true);
    expect(post.isUgoira).toBe(false);
  });

  it('separates a ZIP original from its image thumbnail and WebM playback variant', () => {
    const post = normalizePost(
      {
        id: 3,
        file_ext: 'zip',
        file_url: 'https://cdn.donmai.us/original/ugoira.zip',
        preview_file_url: 'https://cdn.donmai.us/180x180/ugoira.jpg',
        media_asset: {
          variants: [
            { type: '360x360', url: 'https://cdn.donmai.us/360x360/ugoira.jpg', file_ext: 'jpg' },
            { type: '720x720', url: 'https://cdn.donmai.us/720x720/ugoira.webp', file_ext: 'webp' },
            { type: 'sample', url: 'https://cdn.donmai.us/sample/ugoira.webm', file_ext: 'webm' },
          ],
        },
      },
      origin,
    );

    expect(post.fileUrl).toBe('https://cdn.donmai.us/original/ugoira.zip');
    expect(post.thumbnailUrl).toBe('https://cdn.donmai.us/720x720/ugoira.webp');
    expect(post.previewUrl).toBe('https://cdn.donmai.us/180x180/ugoira.jpg');
    expect(post.playbackUrl).toBe('https://cdn.donmai.us/sample/ugoira.webm');
    expect(post.listUrl).not.toMatch(/\.zip(?:[?#]|$)/);
    expect(post.playbackUrl).not.toMatch(/\.zip(?:[?#]|$)/);
    expect(post.isVideo).toBe(true);
    expect(post.isUgoira).toBe(true);
  });

  it('falls back to a static preview when a ZIP has no playable variant', () => {
    const post = normalizePost(
      {
        id: 4,
        file_ext: 'zip',
        file_url: 'https://cdn.donmai.us/original/ugoira.zip',
        preview_file_url: 'https://cdn.donmai.us/preview/ugoira.jpg',
      },
      origin,
    );

    expect(post.thumbnailUrl).toBe('https://cdn.donmai.us/preview/ugoira.jpg');
    expect(post.listUrl).toBe('https://cdn.donmai.us/preview/ugoira.jpg');
    expect(post.playbackUrl).toBe('');
    expect(post.viewerUrl).toBe('https://cdn.donmai.us/preview/ugoira.jpg');
    expect(post.isVideo).toBe(false);
    expect(post.isUgoira).toBe(true);
  });

  it('infers variant media types from URLs with query strings and hashes', () => {
    const post = normalizePost(
      {
        id: 5,
        file_ext: 'zip',
        file_url: 'https://cdn.donmai.us/original/ugoira.zip?original#download',
        media_asset: {
          variants: [
            { type: '720x720', url: 'https://cdn.donmai.us/720x720/ugoira.webp?x=1#image' },
            { type: 'sample', url: 'https://cdn.donmai.us/sample/ugoira.webm?x=1#video' },
          ],
        },
      },
      origin,
    );

    expect(post.thumbnailUrl).toBe('https://cdn.donmai.us/720x720/ugoira.webp?x=1#image');
    expect(post.playbackUrl).toBe('https://cdn.donmai.us/sample/ugoira.webm?x=1#video');
  });

  it('prefers pixiv_id when normalizing Pixiv sources', () => {
    const post = normalizePost(
      {
        id: 1,
        file_url: 'https://cdn.donmai.us/original.jpg',
        pixiv_id: '987654321',
        source: 'https://i.pximg.net/img-original/img/2024/01/01/00/00/00/123456789_p0.jpg',
      },
      origin,
    );

    expect(post.source).toBe('https://www.pixiv.net/artworks/987654321');
  });

  it('extracts Pixiv artwork IDs from pximg source filenames', () => {
    const post = normalizePost(
      {
        id: 1,
        file_url: 'https://cdn.donmai.us/original.jpg',
        source:
          'https://i.pximg.net/img-original/img/2024/01/01/00/00/00/123456789_p0_master1200.jpg',
      },
      origin,
    );

    expect(post.source).toBe('https://www.pixiv.net/artworks/123456789');
  });

  it('does not treat fav_count as current user favorite state', () => {
    const post = normalizePost(
      {
        id: 1,
        file_url: 'https://cdn.donmai.us/original.jpg',
        fav_count: 99,
      },
      origin,
    );

    expect(post.favorited).toBe(false);
  });

  it('uses explicit current-user favorite fields for favorite state', () => {
    const post = normalizePost(
      {
        id: 1,
        file_url: 'https://cdn.donmai.us/original.jpg',
        is_favorited: true,
        fav_count: 0,
      },
      origin,
    );

    expect(post.favorited).toBe(true);
  });
});
