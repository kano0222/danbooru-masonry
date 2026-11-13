import { afterEach, describe, expect, it, vi } from 'vitest';
import { DanbooruAdapter } from '../adapters/danbooru';
import { createState } from '../core/state';
import { ApiError } from '../utils/fetch';
import { getPostLoadError } from '../api/posts';
import { renderShell, renderBlacklistRuleRows } from './shell';
import { english, getLanguage, initializeLanguage, localizeText, refreshLocalizedDom, setLanguage, t } from './i18n';

afterEach(() => {
  setLanguage('zh-CN');
  vi.unstubAllGlobals();
});

describe('interface language', () => {
  it('defaults to Chinese, validates storage, and remembers an explicit choice', () => {
    const saved = new Map<string, unknown>();
    vi.stubGlobal('GM_getValue', (key: string) => saved.get(key));
    vi.stubGlobal('GM_setValue', (key: string, value: unknown) => saved.set(key, value));
    initializeLanguage();
    expect(getLanguage()).toBe('zh-CN');
    setLanguage('en');
    initializeLanguage();
    expect(getLanguage()).toBe('en');
    saved.set('danbooru-masonry.language', 'invalid');
    initializeLanguage();
    expect(getLanguage()).toBe('zh-CN');
  });

  it('keeps switching usable when storage is blocked', () => {
    vi.stubGlobal('GM_getValue', () => { throw new Error('blocked'); });
    vi.stubGlobal('GM_setValue', () => { throw new Error('blocked'); });
    initializeLanguage();
    setLanguage('en');
    expect(t('设置')).toBe('Settings');
  });

  it('covers every declared parameterized message without changing inserted values', () => {
    setLanguage('en');
    for (const [source, translated] of Object.entries(english)) {
      const fill = (value: string) => value.replace(/\{\w+\}/g, '用户原文$&');
      // Parameter values are opaque, including Chinese and replacement syntax.
      expect(t(fill(source))).toBe(fill(translated));
    }
    expect(t('自定义搜索词')).toBe('自定义搜索词');
  });

  it('localizes composed HTTP errors and retains server details verbatim', () => {
    setLanguage('en');
    const error = new ApiError(422, 'InvalidQuery', '保留服务器原文', 'posts.json');
    const message = getPostLoadError(error).message;
    expect(t(message)).toContain('Invalid query.');
    expect(t(message)).toContain('(HTTP 422) Server message: 保留服务器原文');
    expect(t('收藏操作失败：网络连接失败，请检查网络后重试。')).toBe(
      'Could not update favorites: Network connection failed. Check your connection and try again.',
    );
  });

  it('renders all shell copy in English while leaving user templates and rules intact', () => {
    setLanguage('en');
    const body = { dataset: {}, innerHTML: '' };
    vi.stubGlobal('document', { body, title: '' });
    vi.stubGlobal('location', { search: '' });
    const state = createState(new DanbooruAdapter());
    state.downloadFilenameTemplates.danbooru = '我的文件_{postid}';
    renderShell(state);
    const text = body.innerHTML.replace(/<[^>]*>/g, '').replace('中文', '');
    expect(text).not.toMatch(/\p{Script=Han}/u);
    expect(body.innerHTML).toContain('value="我的文件_{postid}"');
    expect(body.innerHTML).toContain('lang="en"');
    expect(body.innerHTML).not.toContain('${');
    expect(body.innerHTML.indexOf('id="dmh-theme-toggle"')).toBeLessThan(body.innerHTML.indexOf('id="dmh-language-toggle"'));
    expect(body.innerHTML.indexOf('id="dmh-language-toggle"')).toBeLessThan(body.innerHTML.indexOf('id="dmh-settings-toggle"'));
    expect(renderBlacklistRuleRows('我的规则')).toContain('<code>我的规则</code>');
    expect(renderBlacklistRuleRows('我的规则')).toContain('aria-label="Remove rule 我的规则"');
  });

  it('updates only marked text in place and preserves an appended control', () => {
    const control = {};
    const text = { nodeType: 3, textContent: '' };
    const element = {
      dataset: {}, textContent: '', firstChild: text, children: [control],
      getAttribute: () => null, querySelectorAll: () => [], lang: '',
    } as unknown as HTMLElement;
    localizeText(element, '已加载 21 张');
    setLanguage('en');
    refreshLocalizedDom(element);
    expect(text.textContent).toBe('21 posts loaded');
    expect(element.children[0]).toBe(control);
    setLanguage('zh-CN');
    refreshLocalizedDom(element);
    expect(text.textContent).toBe('已加载 21 张');
  });
});
