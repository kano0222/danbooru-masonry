import { describe, expect, it } from 'vitest';

import type { Post } from '../adapters/types';
import {
  createBlacklistConfig,
  isPostBlacklisted,
  parseBlacklistRule,
} from './blacklist';

function post(overrides: Partial<Post> = {}): Post {
  return {
    id: '1',
    raw: {},
    tags: ['cat_girl', 'solo'],
    rating: 'e',
    score: 12,
    ...overrides,
  } as Post;
}

function config(...sources: string[]) {
  return createBlacklistConfig(
    true,
    false,
    sources.map((source) => ({ source, enabled: true })),
  );
}

describe('Danbooru blacklist', () => {
  it('uses AND within a rule and OR between rules', () => {
    expect(isPostBlacklisted(post(), config('cat* -1boy', 'dog rating:g'))).toBe(true);
    expect(isPostBlacklisted(post(), config('cat* 1boy', 'dog rating:g'))).toBe(false);
  });

  it('matches rating and score comparisons, including negative terms', () => {
    expect(isPostBlacklisted(post(), config('rating:e score:>=10'))).toBe(true);
    expect(isPostBlacklisted(post(), config('-rating:e'))).toBe(false);
    expect(isPostBlacklisted(post(), config('score:<12'))).toBe(false);
    expect(isPostBlacklisted(post(), config('score:12'))).toBe(true);
  });

  it.each([
    ['deleted', { is_deleted: true }],
    ['pending', { is_pending: true }],
    ['flagged', { is_flagged: true }],
    ['banned', { is_banned: true }],
    ['active', {}],
  ])('matches status:%s', (status, raw) => {
    expect(isPostBlacklisted(post({ raw }), config(`status:${status}`))).toBe(true);
  });

  it('skips disabled, malformed, and unsupported rules without partial matching', () => {
    const value = createBlacklistConfig(true, false, [
      { source: 'cat* user:someone', enabled: true },
      { source: 'cat*', enabled: false },
      { source: 'score:nope', enabled: true },
    ]);
    expect(value.rules).toEqual([]);
    expect(parseBlacklistRule('cat* user:someone')).toBeNull();
    expect(isPostBlacklisted(post(), value)).toBe(false);
  });

  it('does not hide posts when disabled or configured to blur images', () => {
    const rule = [{ source: 'cat*', enabled: true }];
    expect(isPostBlacklisted(post(), createBlacklistConfig(false, false, rule))).toBe(false);
    expect(isPostBlacklisted(post(), createBlacklistConfig(true, true, rule))).toBe(false);
  });
});
