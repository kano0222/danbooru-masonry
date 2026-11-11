import { describe, expect, it, vi } from 'vitest';
import { TAG_TRANSLATION_URL } from '../src/data/tagTranslation';
import { createPreviewFetch } from './requests';

describe('preview API isolation', () => {
  it('serves translations and popular searches and saves blacklist changes locally', async () => {
    const saveBlacklist = vi.fn();
    const request = createPreviewFetch({
      origin: 'https://preview.example', translations: { sky: '天空' },
      popular: [['sky', 123]], readBlacklist: () => 'spoilers', saveBlacklist,
    });
    expect(await (await request(TAG_TRANSLATION_URL)).json()).toEqual({ sky: '天空' });
    expect(await (await request('https://preview.example/explore/posts/searches.json')).json()).toEqual([['sky', 123]]);
    expect(await (await request('https://preview.example/users/1.json')).json()).toEqual({
      id: 1, blacklisted_tags: 'spoilers',
    });
    await request(new Request('https://preview.example/users/1.json', {
      method: 'PATCH', body: new URLSearchParams({ 'user[blacklisted_tags]': 'flower\nnight' }),
    }));
    expect(saveBlacklist).toHaveBeenCalledExactlyOnceWith('flower\nnight');
  });

  it('rejects real account requests and unknown routes without forwarding them', async () => {
    const saveBlacklist = vi.fn();
    const request = createPreviewFetch({ origin: 'https://preview.example', translations: {}, popular: [], readBlacklist: () => '', saveBlacklist });
    for (const url of ['https://danbooru.donmai.us/users/1.json', 'https://preview.example/users/2.json', 'https://preview.example/unexpected']) {
      await expect(request(url, { method: 'PATCH' })).rejects.toThrow('Unsupported preview request');
    }
    expect(saveBlacklist).not.toHaveBeenCalled();
  });
});
