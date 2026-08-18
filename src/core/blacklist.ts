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

export function captureBlacklistConfig(root: Document): BlacklistConfig {
  const box = root.querySelector<HTMLElement>('#blacklist-box');
  if (!box) return { enabled: false, rules: [] };

  const enabledInput = box.querySelector<HTMLInputElement>('input[x-model="blacklist.enabled"]');
  const blurInput = box.querySelector<HTMLInputElement>('input[x-model="blacklist.blurImages"]');
  const enabled = Boolean(enabledInput && (enabledInput.checked || enabledInput.indeterminate));
  const ruleInputs = Array.from(
    box.querySelectorAll<HTMLElement>('[x-data*="blacklist.rules"]'),
  ).map((row) => {
      const input = row.querySelector<HTMLInputElement>('input[type="checkbox"]');
      return {
        source: row.querySelector<HTMLAnchorElement>('a[title]')?.title.trim() || '',
        enabled: input ? input.checked : row.dataset.enabled === 'true',
      };
    });

  return createBlacklistConfig(enabled, Boolean(blurInput?.checked), ruleInputs);
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
