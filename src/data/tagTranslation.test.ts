import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createPreviewFetch } from '../../preview/requests';
import { TAG_TRANSLATION_TIMEOUT_MS, TAG_TRANSLATION_URL, TagTranslationStore } from './tagTranslation';

describe('tag translation store', () => {
  beforeEach(() => vi.stubGlobal('window', globalThis));

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
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
    'keeps original tags after a userscript request failure: %s', async (failure) => {
      vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);
      vi.stubGlobal('GM_xmlhttpRequest', (details: Parameters<typeof GM_xmlhttpRequest>[0]) => {
        if (failure === 'http') details.onload({ status: 403, responseText: '{}' });
        else if (failure === 'json') details.onload({ status: 200, responseText: '<html>blocked</html>' });
        else if (failure === 'error') details.onerror();
        else if (failure === 'timeout') details.ontimeout();
        else if (failure === 'abort') details.onabort();
        else throw new Error('Request unavailable');
      });
      const store = new TagTranslationStore();

      await expect(store.load()).resolves.toBe(false);

      expect(store.loaded).toBe(false);
      expect(store.format('cat_girl')).toBe('cat_girl');
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it('loads local preview translations without a userscript manager', async () => {
    vi.stubGlobal('GM_xmlhttpRequest', undefined);
    vi.stubGlobal('fetch', createPreviewFetch({
      origin: 'https://preview.example', translations: { cat_girl: '猫娘' },
      popular: [], saveBlacklist: vi.fn(),
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
