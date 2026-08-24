import { csrfHeaders } from '../utils/csrf';

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
