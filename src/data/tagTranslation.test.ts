import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createPreviewFetch } from '../../preview/requests';
import { setLanguage } from '../ui/i18n';
import { TAG_TRANSLATION_TIMEOUT_MS, TAG_TRANSLATION_URL, TagTranslationStore } from './tagTranslation';

describe('tag translation store', () => {
  beforeEach(() => vi.stubGlobal('window', globalThis));

  afterEach(() => {
    setLanguage('zh-CN');
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('does not request translations in English and restores them when switching back', async () => {
    const request = vi.fn((details: Parameters<typeof GM_xmlhttpRequest>[0]) => {
      details.onload({ status: 200, responseText: '{"cat_girl":"猫娘"}' });
    });
    vi.stubGlobal('GM_xmlhttpRequest', request);
    const store = new TagTranslationStore();
    setLanguage('en');
    expect(await store.load()).toBe(false);
    expect(request).not.toHaveBeenCalled();
    setLanguage('zh-CN');
    expect(await store.load()).toBe(true);
    expect(store.translate('cat_girl')).toBe('猫娘');
    setLanguage('en');
    expect(store.format('cat_girl')).toBe('cat_girl');
    setLanguage('zh-CN');
    expect(await store.load()).toBe(true);
    expect(store.translate('cat_girl')).toBe('猫娘');
    expect(request).toHaveBeenCalledOnce();
  });

  it('does not expose translations when an in-flight Chinese request completes in English', async () => {
    let complete!: Parameters<typeof GM_xmlhttpRequest>[0]['onload'];
    vi.stubGlobal('GM_xmlhttpRequest', (details: Parameters<typeof GM_xmlhttpRequest>[0]) => {
      complete = details.onload;
    });
    const store = new TagTranslationStore();
    const loading = store.load();
    setLanguage('en');
    complete({ status: 200, responseText: '{"cat":"猫"}' });
    await loading;
    expect(store.translate('cat')).toBe('');
    setLanguage('zh-CN');
    expect(store.translate('cat')).toBe('猫');
  });

  it('loads once through the userscript manager when page fetch is blocked', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Blocked by CSP'));
    vi.stubGlobal('fetch', fetchMock);
    const request = vi.fn((details: Parameters<typeof GM_xmlhttpRequest>[0]) => {
      details.onload({ status: 200, responseText: JSON.stringify({ cat_girl: '猫娘' }) });
    });
    vi.stubGlobal('GM_xmlhttpRequest', request);
    const store = new TagTranslationStore();

    await expect(Promise.all([store.load(), store.load()])).resolves.toEqual([true, true]);

    expect(request).toHaveBeenCalledOnce();
    expect(request.mock.calls[0][0]).toMatchObject({
      method: 'GET', url: TAG_TRANSLATION_URL, timeout: TAG_TRANSLATION_TIMEOUT_MS,
      anonymous: true, headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(store.loaded).toBe(true);
    expect(store.translate('cat girl')).toBe('猫娘');
  });

  it.each(['http', 'json', 'error', 'timeout', 'abort', 'throw'] as const)(
    'retries after switching back to Chinese following a userscript request failure: %s', async (failure) => {
      vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);
      const request = vi.fn<(details: Parameters<typeof GM_xmlhttpRequest>[0]) => void>().mockImplementationOnce((details) => {
        if (failure === 'http') details.onload({ status: 403, responseText: '{}' });
        else if (failure === 'json') details.onload({ status: 200, responseText: '<html>blocked</html>' });
        else if (failure === 'error') details.onerror();
        else if (failure === 'timeout') details.ontimeout();
        else if (failure === 'abort') details.onabort();
        else throw new Error('Request unavailable');
      }).mockImplementation((details) => {
        details.onload({ status: 200, responseText: '{"cat_girl":"猫娘"}' });
      });
      vi.stubGlobal('GM_xmlhttpRequest', request);
      const store = new TagTranslationStore();

      await expect(store.load()).resolves.toBe(false);

      expect(store.loaded).toBe(false);
      expect(store.format('cat_girl')).toBe('cat_girl');
      expect(fetchMock).not.toHaveBeenCalled();
      expect(request).toHaveBeenCalledOnce();

      setLanguage('en');
      await expect(store.load()).resolves.toBe(false);
      expect(request).toHaveBeenCalledOnce();
      setLanguage('zh-CN');
      const retry = store.load();
      expect(store.load()).toBe(retry);
      await expect(retry).resolves.toBe(true);
      expect(store.loaded).toBe(true);
      expect(store.translate('cat_girl')).toBe('猫娘');
      await expect(store.load()).resolves.toBe(true);
      expect(request).toHaveBeenCalledTimes(2);
    },
  );

  it('retries a failed preview fetch while sharing concurrent loads and caching success', async () => {
    vi.stubGlobal('GM_xmlhttpRequest', undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const fetchMock = vi.fn().mockRejectedValueOnce(new Error('network error'))
      .mockImplementation(async () => Response.json({ cat_girl: '猫娘' }));
    vi.stubGlobal('fetch', fetchMock);
    const store = new TagTranslationStore();

    await expect(Promise.all([store.load(), store.load()])).resolves.toEqual([false, false]);
    expect(fetchMock).toHaveBeenCalledOnce();
    setLanguage('en');
    await expect(store.load()).resolves.toBe(false);
    expect(fetchMock).toHaveBeenCalledOnce();
    setLanguage('zh-CN');
    const retry = store.load();
    expect(store.load()).toBe(retry);
    await expect(retry).resolves.toBe(true);
    expect(store.translate('cat_girl')).toBe('猫娘');
    await expect(store.load()).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('loads local preview translations without a userscript manager', async () => {
    vi.stubGlobal('GM_xmlhttpRequest', undefined);
    vi.stubGlobal('fetch', createPreviewFetch({
      origin: 'https://preview.example', translations: { cat_girl: '猫娘' },
      popular: [], readBlacklist: () => '', saveBlacklist: vi.fn(),
    }));
    const store = new TagTranslationStore();

    await expect(store.load()).resolves.toBe(true);
    expect(store.translate('cat girl')).toBe('猫娘');
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
