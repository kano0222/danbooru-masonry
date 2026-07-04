import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createFavorite, isPostFavorited } from './favorites';

const origin = 'https://danbooru.donmai.us';

function setCurrentUser(userId: string, isAnonymous = false): void {
  document.body.dataset.currentUserId = userId;
  document.body.dataset.currentUserIsAnonymous = String(isAnonymous);
}

describe('favorites API', () => {
  beforeEach(() => {
    vi.stubGlobal('document', {
      body: {
        innerHTML: '',
        dataset: {},
      },
    });
    document.body.innerHTML = '';
    document.body.dataset.currentUserId = '';
    document.body.dataset.currentUserIsAnonymous = '';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reports false without querying when current user is not logged in', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(isPostFavorited(origin, '100')).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('queries favorites by post ID and current user ID', async () => {
    setCurrentUser('42');
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([{ post_id: 100, user_id: 42 }]), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(isPostFavorited(origin, '100')).resolves.toBe(true);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(
      'https://danbooru.donmai.us/favorites.json?search%5Bpost_id%5D=100&search%5Buser_id%5D=42',
    );
    expect(init.credentials).toBe('same-origin');
    expect(init.headers).toMatchObject({ Accept: 'application/json' });
  });

  it('ignores favorites that belong to a different user', async () => {
    setCurrentUser('42');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify([{ post_id: 100, user_id: 99 }]), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    );

    await expect(isPostFavorited(origin, '100')).resolves.toBe(false);
  });

  it('shows a clear login-state error before creating favorites when logged out', async () => {
    await expect(createFavorite(origin, '100')).rejects.toThrow('未检测到登录状态');
  });
});
