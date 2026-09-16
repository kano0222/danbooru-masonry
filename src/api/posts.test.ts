import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Post } from '../adapters/types';
import { normalizePost } from '../core/normalizePost';
import { fetchPostsJson, getPostLoadError } from './posts';

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

  it('uses one JSON request and keeps available posts for render-time filtering', async () => {
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
    await expect(
      fetchPostsJson(
        origin,
        { tags: 'oooesonitn', page: 1, pageUrlSearch: '?z=5' },
        (raw) => normalizePost(raw, origin),
      ),
    ).resolves.toMatchObject({
      posts: [
        { id: '1' },
        { id: '2' },
        { id: '3' },
        { id: '4' },
        { id: '5' },
        { id: '6' },
        { id: '7' },
      ],
      hasSourcePosts: true,
    });
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
    await expect(
      fetchPostsJson(origin, { tags: '', page: 1 }, normalize),
    ).resolves.toEqual({ posts: [], hasSourcePosts: true });
    await expect(
      fetchPostsJson(origin, { tags: '', page: 2 }, normalize),
    ).resolves.toEqual({ posts: [], hasSourcePosts: false });
  });
});

describe('readable post errors', () => {
  afterEach(() => vi.unstubAllGlobals());
  async function responseError(status: number, body: unknown, contentType = 'application/json') {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      contentType === 'application/json' ? JSON.stringify(body) : String(body),
      { status, headers: { 'content-type': contentType } },
    )));
    try {
      await fetchPostsJson(origin, { tags: 'a b c', page: 1 }, normalize);
      throw new Error('Expected the request to fail');
    } catch (error) {
      return getPostLoadError(error);
    }
  }
  it.each([2, 6])('uses the actual server tag limit %s and offers an upgrade', async limit => {
    const result = await responseError(422, {
      success: false,
      error: 'PostQuery::TagLimitError',
      message: 'You cannot search for more than ' + limit + ' tags at a time.',
      backtrace: ['private details'],
    });
    expect(result.upgrade).toBe(true);
    expect(result.message).toContain('最多搜索 ' + limit + ' 个标签');
    expect(result.message).not.toContain('private details');
  });
  it('does not invent a limit when the server omits it', async () => {
    const result = await responseError(422, { error: 'PostQuery::TagLimitError' });
    expect(result.upgrade).toBe(true);
    expect(result.message).toContain('超过当前账号上限');
    expect(result.message).not.toContain('2');
  });
  it('does not mislabel other 422 errors as tag limits', async () => {
    const result = await responseError(422, { error: 'PostQuery::Error', message: 'Invalid query' });
    expect(result.upgrade).toBe(false);
    expect(result.message).toContain('搜索条件无效');
    expect(result.message).toContain('Invalid query');
  });
  it.each([[401, '身份验证失败'], [403, '访问被拒绝'], [410, '页码超过'], [429, '请求过于频繁'], [503, '服务暂时不可用']])('explains HTTP %s', async (status, text) => {
    const result = await responseError(Number(status), {});
    expect(result.message).toContain(text);
    expect(result.upgrade).toBe(false);
  });
  it('distinguishes search timeouts from generic server failures', async () => {
    expect((await responseError(500, { error: 'ActiveRecord::QueryCanceled' })).message).toContain('搜索超时');
  });
  it('handles HTML error pages without displaying their markup', async () => {
    const result = await responseError(502, '<script>unsafe</script>', 'text/html');
    expect(result.message).toContain('HTTP 502');
    expect(result.message).not.toContain('script');
  });
  it('handles malformed error JSON and legacy reason fields', async () => {
    expect((await responseError(422, '{invalid', 'text/plain')).message).toContain('搜索条件无效');
    expect((await responseError(422, { reason: 'Invalid parameter' })).message).toContain('Invalid parameter');
  });
  it('explains a successful response containing an HTML verification page', async () => {
    expect((await responseError(200, '<html>verify</html>', 'text/html')).message).toContain('完成验证');
  });
  it('explains network failures', () => {
    expect(getPostLoadError(new TypeError('Failed to fetch')).message).toContain('网络连接失败');
  });
});
