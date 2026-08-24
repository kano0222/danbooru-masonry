import { afterEach, describe, expect, it, vi } from 'vitest';

import { updateBlacklistedTags } from './userSettings';

describe('user settings API', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('updates only the current user blacklisted tags', async () => {
    vi.stubGlobal('document', {
      querySelector: vi.fn().mockReturnValue({ content: 'csrf-token' }),
    });
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await updateBlacklistedTags('https://danbooru.donmai.us', '42', 'scat\nguro');

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://danbooru.donmai.us/users/42.json');
    expect(init).toMatchObject({
      method: 'PATCH',
      credentials: 'same-origin',
      headers: expect.objectContaining({ 'X-CSRF-Token': 'csrf-token' }),
    });
    expect(init.body).toBe('user%5Bblacklisted_tags%5D=scat%0Aguro');
  });

  it('rejects logged-out saves before making a request', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(updateBlacklistedTags('https://danbooru.donmai.us', '', 'scat')).rejects.toThrow(
      '未检测到登录状态',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reports failed updates', async () => {
    vi.stubGlobal('document', { querySelector: vi.fn().mockReturnValue(null) });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 403 })));
    await expect(
      updateBlacklistedTags('https://danbooru.donmai.us', '42', 'scat'),
    ).rejects.toThrow('HTTP 403: 黑名单保存失败');
  });
});
