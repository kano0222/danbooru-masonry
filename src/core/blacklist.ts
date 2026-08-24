import type { Post } from '../adapters/types';
import type { DanbooruRawPost } from '../types/danbooru';

export interface BlacklistConfig {
  enabled: boolean;
  rules: BlacklistRule[];
}

export interface BlacklistRule {
  source: string;
  terms: BlacklistTerm[];
}

type BlacklistTerm =
  | { type: 'tag'; negative: boolean; pattern: RegExp }
  | { type: 'rating'; negative: boolean; value: string }
  | { type: 'score'; negative: boolean; operator: '=' | '<' | '<=' | '>' | '>='; value: number }
  | { type: 'status'; negative: boolean; value: PostStatus };

type PostStatus = 'deleted' | 'pending' | 'flagged' | 'banned' | 'active';

export interface BlacklistRuleInput {
  source: string;
  enabled: boolean;
}

export interface CapturedBlacklist {
  config: BlacklistConfig;
  text: string;
}

export function captureBlacklistConfig(root: Document): BlacklistConfig {
  return captureBlacklist(root).config;
}

export function captureBlacklist(root: Document): CapturedBlacklist {
  const box = root.querySelector<HTMLElement>('#blacklist-box');
  if (!box) return { config: { enabled: false, rules: [] }, text: '' };

  const enabledInput = box.querySelector<HTMLInputElement>('input[x-model="blacklist.enabled"]');
  const blurInput = box.querySelector<HTMLInputElement>('input[x-model="blacklist.blurImages"]');
  const enabled = Boolean(enabledInput && (enabledInput.checked || enabledInput.indeterminate));
  const rows = Array.from(
    box.querySelectorAll<HTMLElement>('[x-data*="blacklist.rules"]'),
  );
  const sources = rows
    .map((row) => row.querySelector<HTMLAnchorElement>('a[title]')?.title.trim() || '')
    .filter(Boolean);
  const ruleInputs = rows.map((row) => {
      const input = row.querySelector<HTMLInputElement>('input[type="checkbox"]');
      return {
        source: row.querySelector<HTMLAnchorElement>('a[title]')?.title.trim() || '',
        enabled: input ? input.checked : row.dataset.enabled === 'true',
      };
    });

  return {
    config: createBlacklistConfig(enabled, Boolean(blurInput?.checked), ruleInputs),
    text: sources.join('\n'),
  };
}

export function createBlacklistConfigFromText(
  text: string,
  storage: Storage | null = getLocalStorage(),
): BlacklistConfig {
  const sources = blacklistSources(text);
  const ruleInputs = sources.map((source) => ({
    source,
    enabled: readStoredValue(storage, `blacklist.enabled:${source}`, true),
  }));
  const blurImages = sources.some(
    (source) =>
      readStoredValue<string>(storage, `blacklist.hideMethod:${source}`, 'hide') === 'blur',
  );
  return createBlacklistConfig(ruleInputs.some((rule) => rule.enabled), blurImages, ruleInputs);
}

export function normalizeBlacklistText(text: string): string {
  return blacklistSources(text).join('\n');
}

export function filterBlacklistedPosts(posts: Post[], config: BlacklistConfig): Post[] {
  return posts.filter((post) => !isPostBlacklisted(post, config));
}

export function createBlacklistConfig(
  enabled: boolean,
  blurImages: boolean,
  ruleInputs: BlacklistRuleInput[],
): BlacklistConfig {
  if (!enabled || blurImages) return { enabled: false, rules: [] };
  const rules = ruleInputs
    .filter((rule) => rule.enabled)
    .map((rule) => parseBlacklistRule(rule.source))
    .filter((rule): rule is BlacklistRule => Boolean(rule));
  return { enabled: true, rules };
}

export function parseBlacklistRule(source: string): BlacklistRule | null {
  const tokens = source.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return null;
  const terms: BlacklistTerm[] = [];
  for (const token of tokens) {
    const term = parseTerm(token);
    if (!term) return null;
    terms.push(term);
  }
  return { source, terms };
}

export function isPostBlacklisted(post: Post, config: BlacklistConfig): boolean {
  if (!config.enabled) return false;
  return config.rules.some((rule) => rule.terms.every((term) => matchesTerm(post, term)));
}

function parseTerm(token: string): BlacklistTerm | null {
  const negative = token.startsWith('-');
  const value = negative ? token.slice(1) : token;
  if (!value) return null;
  const separator = value.indexOf(':');
  if (separator < 0) {
    return { type: 'tag', negative, pattern: tagPattern(value) };
  }

  const key = value.slice(0, separator).toLowerCase();
  const operand = value.slice(separator + 1).toLowerCase();
  if (!operand) return null;
  if (key === 'rating' && /^[gsqeu]$/.test(operand)) {
    return { type: 'rating', negative, value: operand };
  }
  if (key === 'score') {
    const match = operand.match(/^(<=|>=|<|>)?(-?\d+)$/);
    if (!match) return null;
    const operator = (match[1] || '=') as '=' | '<' | '<=' | '>' | '>=';
    return {
      type: 'score',
      negative,
      operator,
      value: Number(match[2]),
    };
  }
  if (key === 'status' && isPostStatus(operand)) {
    return { type: 'status', negative, value: operand };
  }
  return null;
}

function matchesTerm(post: Post, term: BlacklistTerm): boolean {
  let matches = false;
  if (term.type === 'tag') matches = post.tags.some((tag) => term.pattern.test(tag));
  if (term.type === 'rating') matches = post.rating.toLowerCase() === term.value;
  if (term.type === 'score') matches = compareNumber(post.score, term.operator, term.value);
  if (term.type === 'status') matches = postHasStatus(post.raw as DanbooruRawPost, term.value);
  return term.negative ? !matches : matches;
}

function tagPattern(value: string): RegExp {
  const escaped = value
    .toLowerCase()
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`, 'i');
}

function compareNumber(
  actual: number,
  operator: '=' | '<' | '<=' | '>' | '>=',
  expected: number,
): boolean {
  if (operator === '<') return actual < expected;
  if (operator === '<=') return actual <= expected;
  if (operator === '>') return actual > expected;
  if (operator === '>=') return actual >= expected;
  return actual === expected;
}

function postHasStatus(raw: DanbooruRawPost, status: PostStatus): boolean {
  if (status === 'deleted') return Boolean(raw.is_deleted);
  if (status === 'pending') return Boolean(raw.is_pending);
  if (status === 'flagged') return Boolean(raw.is_flagged);
  if (status === 'banned') return Boolean(raw.is_banned);
  return !raw.is_deleted && !raw.is_pending && !raw.is_flagged && !raw.is_banned;
}

function isPostStatus(value: string): value is PostStatus {
  return ['deleted', 'pending', 'flagged', 'banned', 'active'].includes(value);
}

function blacklistSources(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function getLocalStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readStoredValue<T>(storage: Storage | null, key: string, fallback: T): T {
  try {
    const value = storage?.getItem(key);
    return value === null || value === undefined ? fallback : (JSON.parse(value) as T);
  } catch {
    return fallback;
  }
}
