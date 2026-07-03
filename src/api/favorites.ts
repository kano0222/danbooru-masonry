import { csrfHeaders, getCsrfToken } from '../utils/csrf';
import { fetchJson } from '../utils/fetch';

export async function createFavorite(origin: string, postId: string): Promise<void> {
  assertLoggedIn();
  const url = new URL('/favorites', origin);
  url.searchParams.set('post_id', postId);
  const response = await fetch(url.toString(), {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      ...csrfHeaders(),
    },
  });
  if (response.status === 409) return;
  if (!response.ok) {
    const text = await response.text();
    if (/already\s+favorited/i.test(text)) return;
    throw new Error(favoriteError(response.status, 'favorite failed'));
  }
}

export async function deleteFavorite(origin: string, postId: string): Promise<void> {
  assertLoggedIn();
  const token = getCsrfToken();
  const response = await fetch(new URL(`/favorites/${encodeURIComponent(postId)}`, origin).toString(), {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      ...csrfHeaders(),
    },
    body: new URLSearchParams({
      _method: 'delete',
      authenticity_token: token,
      button: '',
    }).toString(),
  });
  if (!response.ok && response.status !== 404) {
    throw new Error(favoriteError(response.status, 'favorite delete failed'));
  }
}

export async function isPostFavorited(origin: string, postId: string): Promise<boolean> {
  const userId = currentUserId();
  if (!userId) return false;

  const url = new URL('/favorites.json', origin);
  url.searchParams.set('search[post_id]', postId);
  url.searchParams.set('search[user_id]', userId);
  const data = await fetchJson<unknown[]>(url.toString(), {}, 'favorites.json');
  return Array.isArray(data) && data.some((item) => isFavoriteForCurrentUser(item, postId, userId));
}

function favoriteError(status: number, message: string): string {
  if (status === 401 || status === 403) return `HTTP ${status}: ${message}; login or CSRF may be required`;
  if (status === 404) return `HTTP ${status}: ${message}; endpoint or post was not found`;
  return `HTTP ${status}: ${message}`;
}

function assertLoggedIn(): void {
  if (!currentUserId()) throw new Error('未检测到登录状态');
}

function currentUserId(): string {
  const userId = document.body.dataset.currentUserId || '';
  const isAnonymous = document.body.dataset.currentUserIsAnonymous === 'true';
  return !userId || isAnonymous ? '' : userId;
}

function isFavoriteForCurrentUser(raw: unknown, postId: string, userId: string): boolean {
  const item = (raw || {}) as Record<string, unknown>;
  return String(item.post_id ?? item.postId ?? '') === postId && String(item.user_id ?? item.userId ?? '') === userId;
}
