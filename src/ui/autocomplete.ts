import type { AutocompleteItem } from '../adapters/types';
import type { AppState } from '../core/state';
import { escapeAttr, escapeHtml } from '../utils/escape';

export const AUTOCOMPLETE_DEBOUNCE_MS = 200;

const DEFAULT_AUTOCOMPLETE_ITEMS: AutocompleteItem[] = [
  { value: 'order:rank', count: '', category: 'meta' },
  { value: 'order:score', count: '', category: 'meta' },
  { value: 'order:favcount', count: '', category: 'meta' },
  { value: 'order:none', count: '', category: 'meta' },
  { value: 'order:upvotes', count: '', category: 'meta' },
  { value: 'rating:general', count: '', category: 'meta' },
  { value: 'rating:questionable', count: '', category: 'meta' },
  { value: 'rating:explicit', count: '', category: 'meta' },
  { value: 'rating:sensitive', count: '', category: 'meta' },
  { value: 'order:landscape', count: '', category: 'meta' },
  { value: 'order:portrait', count: '', category: 'meta' },
  { value: 'order:mpixels', count: '', category: 'meta' },
];

const DEFAULT_AUTOCOMPLETE_LABELS: Record<string, string> = {
  'order:rank': '排序：综合排名',
  'order:score': '排序：分数',
  'order:favcount': '排序：收藏数',
  'order:none': '排序：默认',
  'order:upvotes': '排序：赞同数',
  'rating:general': '分级：全年龄',
  'rating:questionable': '分级：可疑',
  'rating:explicit': '分级：限制级',
  'rating:sensitive': '分级：敏感',
  'order:landscape': '排序：横图',
  'order:portrait': '排序：竖图',
  'order:mpixels': '排序：像素数',
};

export function scheduleAutocomplete(state: AppState, value: string): void {
  window.clearTimeout(state.autocompleteTimer);
  const fragment = getLastTagFragment(value);
  if (!fragment) {
    state.autocompleteToken += 1;
    renderAutocomplete(state, DEFAULT_AUTOCOMPLETE_ITEMS);
    return;
  }
  state.autocompleteTimer = window.setTimeout(() => {
    void requestAutocomplete(state, fragment);
  }, AUTOCOMPLETE_DEBOUNCE_MS);
}

export function openAutocomplete(state: AppState, value: string): void {
  window.clearTimeout(state.autocompleteTimer);
  const fragment = getLastTagFragment(value);
  if (!fragment) {
    state.autocompleteToken += 1;
    renderAutocomplete(state, DEFAULT_AUTOCOMPLETE_ITEMS);
    return;
  }
  void requestAutocomplete(state, fragment);
}

export function closeAutocomplete(state: AppState): void {
  window.clearTimeout(state.autocompleteTimer);
  state.autocompleteToken += 1;
  const container = document.getElementById('dmh-ac');
  if (!container) return;
  state.autocompleteIndex = -1;
  container.classList.remove('dmh-open');
  container.setAttribute('aria-hidden', 'true');
}

export function applyAutocompleteTag(state: AppState, tag: string): void {
  const input = document.getElementById('dmh-tags') as HTMLInputElement | null;
  if (!input || !tag) return;
  const value = input.value;
  const match = /\S*$/.exec(value);
  const start = match?.index ?? value.length;
  input.setRangeText(tag, start, value.length, 'end');
  input.focus();
  closeAutocomplete(state);
}

export function renderAutocomplete(state: AppState, items: AutocompleteItem[]): void {
  const container = document.getElementById('dmh-ac');
  if (!container || !items.length) {
    closeAutocomplete(state);
    return;
  }
  container.innerHTML = items
    .map((item, index) => {
      const cn = state.translations.translate(item.value) || DEFAULT_AUTOCOMPLETE_LABELS[item.value] || '';
      return `
        <button class="dmh-ac-item" type="button" data-tag="${escapeAttr(item.value)}" data-index="${index}">
          <span class="dmh-ac-name">${escapeHtml(item.value)}${cn ? ` <span class="dmh-ac-cn">${escapeHtml(cn)}</span>` : ''}</span>
        </button>`;
    })
    .join('');
  state.autocompleteIndex = -1;
  container.classList.add('dmh-open');
  container.setAttribute('aria-hidden', 'false');
  updateAutocompleteSelection(state);
}

export function moveAutocompleteSelection(state: AppState, direction: 1 | -1): void {
  const items = autocompleteButtons();
  if (!items.length) return;
  if (state.autocompleteIndex < 0) {
    state.autocompleteIndex = direction === 1 ? 0 : items.length - 1;
    updateAutocompleteSelection(state);
    return;
  }
  state.autocompleteIndex = (state.autocompleteIndex + direction + items.length) % items.length;
  updateAutocompleteSelection(state);
}

export function applySelectedAutocomplete(state: AppState): boolean {
  const items = autocompleteButtons();
  if (!items.length || state.autocompleteIndex < 0) return false;
  const item = items[state.autocompleteIndex];
  if (!item) return false;
  applyAutocompleteTag(state, item.dataset.tag || '');
  return true;
}

function updateAutocompleteSelection(state: AppState): void {
  const items = autocompleteButtons();
  items.forEach((item, index) => {
    const selected = index === state.autocompleteIndex;
    item.classList.toggle('dmh-selected', selected);
    if (selected) item.scrollIntoView({ block: 'nearest' });
  });
}

function autocompleteButtons(): HTMLButtonElement[] {
  const container = document.getElementById('dmh-ac');
  if (!container?.classList.contains('dmh-open')) return [];
  return Array.from(container.querySelectorAll<HTMLButtonElement>('.dmh-ac-item'));
}

function getLastTagFragment(value: string): string {
  const parts = value.split(/\s+/);
  return (parts[parts.length - 1] || '').trim();
}

async function requestAutocomplete(state: AppState, fragment: string): Promise<void> {
  const token = ++state.autocompleteToken;
  try {
    const items = await state.adapter.getAutocomplete(fragment);
    if (token === state.autocompleteToken) renderAutocomplete(state, items);
  } catch (error) {
    if (token === state.autocompleteToken) closeAutocomplete(state);
    console.warn('[Danbooru Masonry] autocomplete failed:', error);
  }
}
