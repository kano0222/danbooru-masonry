import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TAG_TRANSLATION_URL, TagTranslationStore } from './tagTranslation';

describe('tag translation store', () => {
  beforeEach(() => vi.stubGlobal('window', globalThis));

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('revalidates the translation resource and loads it only once', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ cat_girl: '猫娘' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const store = new TagTranslationStore();

    await Promise.all([store.load(), store.load()]);

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(TAG_TRANSLATION_URL);
    expect(init).toMatchObject({
      cache: 'no-cache',
      credentials: 'omit',
      headers: { Accept: 'application/json' },
    });
    expect(store.loaded).toBe(true);
    expect(store.translate('cat girl')).toBe('猫娘');
  });

  it('keeps translations empty when loading fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')));
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const store = new TagTranslationStore();

    await expect(store.load()).resolves.toBe(false);

    expect(store.loaded).toBe(false);
    expect(store.translate('cat_girl')).toBe('');
  });
});
