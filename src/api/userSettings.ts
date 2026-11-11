import { csrfHeaders } from '../utils/csrf';
import { fetchJson } from '../utils/fetch';

export async function fetchBlacklistedTags(origin: string, userId: string): Promise<string> {
  if (!userId) throw new Error('未检测到登录状态');
  const data = await fetchJson<{ id?: unknown; blacklisted_tags?: unknown }>(
    new URL(`/users/${encodeURIComponent(userId)}.json`, origin).toString(),
    { cache: 'no-store' },
    'user blacklist',
  );
  if (!data || String(data.id) !== userId || typeof data.blacklisted_tags !== 'string') {
    throw new SyntaxError('未能读取当前账号的黑名单规则');
  }
  return data.blacklisted_tags;
}

export async function updateBlacklistedTags(
  origin: string,
  userId: string,
  blacklistedTags: string,
): Promise<void> {
  if (!userId) throw new Error('未检测到登录状态');
  const response = await fetch(
    new URL(`/users/${encodeURIComponent(userId)}.json`, origin).toString(),
    {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        ...csrfHeaders(),
      },
      body: new URLSearchParams({ 'user[blacklisted_tags]': blacklistedTags }).toString(),
    },
  );
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: 黑名单保存失败`);
  }
}
