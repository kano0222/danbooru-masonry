import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Post } from '../adapters/types';
import { createBlacklistConfig } from '../core/blacklist';
import { normalizePost } from '../core/normalizePost';
import { fetchPostsJson } from './posts';

const origin = 'https://danbooru.donmai.us';

function normalize(raw: unknown): Post {
  const value = raw as { id: number; available?: boolean; tag_string?: string };
  return {
    id: String(value.id),
    raw: value,
    available: value.available !== false,
    tags: value.tag_string?.split(' ') || [],
    rating: 'u',
    score: 0,
  } as Post;
}

describe('posts API', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('uses one JSON request and filters unavailable and blacklisted posts', async () => {
    const rawPosts = Array.from({ length: 9 }, (_, index) => ({
      id: index + 1,
      file_url: index < 7 ? `https://cdn.donmai.us/original/${index + 1}.jpg` : undefined,
      tag_string: index < 2 ? 'oooesonitn scat' : 'oooesonitn',
    }));
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(rawPosts), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const blacklist = createBlacklistConfig(true, false, [{ source: 'scat', enabled: true }]);

    await expect(
      fetchPostsJson(
        origin,
        { tags: 'oooesonitn', page: 1, pageUrlSearch: '?z=5', blacklist },
        (raw) => normalizePost(raw, origin),
      ),
    ).resolves.toMatchObject({ posts: [{ id: '3' }, { id: '4' }, { id: '5' }, { id: '6' }, { id: '7' }], hasSourcePosts: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('distinguishes a fully filtered page from an empty source page', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ id: 1, available: false }]), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response('[]', {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      );
    vi.stubGlobal('fetch', fetchMock);
    const blacklist = createBlacklistConfig(false, false, []);

    await expect(
      fetchPostsJson(origin, { tags: '', page: 1, blacklist }, normalize),
    ).resolves.toEqual({ posts: [], hasSourcePosts: true });
    await expect(
      fetchPostsJson(origin, { tags: '', page: 2, blacklist }, normalize),
    ).resolves.toEqual({ posts: [], hasSourcePosts: false });
  });
});
