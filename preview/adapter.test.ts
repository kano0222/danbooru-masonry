import { beforeEach, describe, expect, it } from 'vitest';
import { PreviewAdapter } from './adapter';
import { createPreviewPosts } from './fixtures';

describe('preview browsing', () => {
  let adapter: PreviewAdapter;
  beforeEach(() => {
    adapter = new PreviewAdapter(createPreviewPosts('https://preview.example/demo/'), 'https://preview.example/demo/');
  });

  it('paginates stable local data and reports the matching total', async () => {
    const first = await adapter.getPosts({ tags: '', page: 1 });
    const second = await adapter.getPosts({ tags: '', page: 2 });
    expect(first.posts).toHaveLength(20);
    expect(second.posts).toHaveLength(20);
    expect(new Set([...first.posts, ...second.posts].map((post) => post.id)).size).toBe(40);
    expect(await adapter.getPostCount('')).toBe(60);
    expect((await adapter.getPosts({ tags: '', page: 4 })).hasSourcePosts).toBe(false);
    expect(first.posts[0].fileUrl).toBe('https://preview.example/demo/image/01.jpg');
  });

  it('keeps tag searches, safe filtering, counts and ordering consistent', async () => {
    const query = '( flower -night ) rating:g order:score';
    const { posts } = await adapter.getPosts({ tags: query, page: 1 });
    expect(posts.length).toBeGreaterThan(0);
    expect(posts.every((post) => post.tags.includes('flower') && !post.tags.includes('night') && post.rating === 'g')).toBe(true);
    expect(posts.map((post) => post.score)).toEqual(posts.map((post) => post.score).sort((a, b) => b - a));
    expect(await adapter.getPostCount(query)).toBe(posts.length);
    expect(await adapter.getPostCount('unknown_preview_tag')).toBe(0);
    expect(await adapter.getPostCount('rating:general')).toBe(await adapter.getPostCount('rating:g'));
  });

  it('reflects favorite changes in the personal favorites results', async () => {
    const query = 'ordfav:Preview_User';
    const count = await adapter.getPostCount(query);
    await adapter.createFavorite('9000002');
    expect(await adapter.isFavorited('9000002')).toBe(true);
    expect(await adapter.getPostCount(query)).toBe(count + 1);
    await adapter.deleteFavorite('9000002');
    expect(await adapter.getPostCount(query)).toBe(count);
  });

  it('keeps new-tab searches and post links inside the hosted preview subdirectory', async () => {
    const search = new URL(adapter.getPostsPageUrl('1girl sky', 2));
    expect(search.pathname).toBe('/demo/');
    expect(search.searchParams.get('tags')).toBe('1girl sky');
    const post = new URL(adapter.getPostUrl('9000025'));
    expect(post.pathname).toBe('/demo/');
    expect(post.searchParams.get('page')).toBe('2');
    expect(post.hash).toBe('#post-9000025');
    expect(await adapter.getAutocomplete('hite')).toContainEqual({ value: 'hiten', count: '30', category: 'artist' });
  });
});
