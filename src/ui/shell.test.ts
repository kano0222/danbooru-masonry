import { afterEach, describe, expect, it, vi } from 'vitest';
import { DanbooruAdapter } from '../adapters/danbooru';
import { createState } from '../core/state';
import { renderBlacklistRuleRows, renderShell } from './shell';

afterEach(() => vi.unstubAllGlobals());

function renderWithUser(
  dataset: Record<string, string>,
  settings = new Map<string, unknown>(),
): string {
  const body = { dataset, innerHTML: '' };
  vi.stubGlobal('location', { search: '' });
  vi.stubGlobal('GM_getValue', (key: string, fallback: unknown) =>
    settings.has(key) ? settings.get(key) : fallback,
  );
  vi.stubGlobal('document', { body, title: '' });
  renderShell(createState(new DanbooruAdapter()));
  return body.innerHTML;
}

describe('theme settings', () => {
  it('renders a toolbar action for the saved theme', () => {
    const html = renderWithUser(
      {},
      new Map([['danbooru-masonry.themeMode', 'dark']]),
    );
    expect(html).toMatch(/id="dmh-theme-toggle"[^>]*data-dmh-tooltip="切换到浅色模式"/);
    expect(html).not.toContain('id="dmh-theme-mode"');
  });
});

describe('search shortcuts', () => {
  it('places Hot and favorites to the right of the search button', () => {
    const html = renderWithUser({ currentUserId: '42', currentUserName: 'My_Name' });
    expect(html.indexOf('aria-label="搜索"')).toBeLessThan(html.indexOf('id="dmh-hot-search"'));
    expect(html.indexOf('id="dmh-hot-search"')).toBeLessThan(html.indexOf('id="dmh-favorites-search"'));
    expect(html).toMatch(/id="dmh-favorites-search"[^>]*aria-label="我的收藏"[^>]*><svg/);
  });
  it('disables favorites without a signed-in username', () => {
    const html = renderWithUser({ currentUserIsAnonymous: 'true' });
    expect(html).toMatch(/id="dmh-favorites-search"[^>]*disabled/);
  });
});

describe('blacklist editor', () => {
  it('renders structured controls with batch editing as a secondary option', () => {
    const html = renderWithUser({ currentUserId: '42' });
    expect(html).toContain('id="dmh-blacklist-composer"');
    expect(html).toContain('id="dmh-blacklist-ac"');
    expect(html).toContain('id="dmh-blacklist-rule-list"');
    expect(html).toContain('id="dmh-blacklist-remove-confirm"');
    expect(html).toContain('<summary>批量编辑</summary>');
  });
  it('renders one viewer blacklist entry with an explicit confirmation dialog', () => {
    const html = renderWithUser({ currentUserId: '42' });
    expect(html.match(/id="dmh-viewer-blacklist"/g)).toHaveLength(1);
    expect(html).toContain('id="dmh-viewer-blacklist-dialog"');
    expect(html).toContain('id="dmh-viewer-blacklist-confirm"');
  });


  it('escapes rules and gives each row a remove action', () => {
    const html = renderBlacklistRuleRows('cat\n<script>');
    expect(html).toContain('data-blacklist-remove="1"');
    expect(html).toContain('&lt;script&gt;');
  });
});
