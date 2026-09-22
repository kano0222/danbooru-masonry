import { afterEach, describe, expect, it, vi } from 'vitest';
import { DanbooruAdapter } from '../adapters/danbooru';
import { createState } from '../core/state';
import { renderShell } from './shell';

afterEach(() => vi.unstubAllGlobals());

function renderWithUser(dataset: Record<string, string>): string {
  const body = { dataset, innerHTML: '' };
  vi.stubGlobal('location', { search: '' });
  vi.stubGlobal('GM_getValue', (_key: string, fallback: unknown) => fallback);
  vi.stubGlobal('document', { body, title: '' });
  renderShell(createState(new DanbooruAdapter()));
  return body.innerHTML;
}

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
