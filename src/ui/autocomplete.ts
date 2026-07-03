import type { AutocompleteItem } from '../adapters/types';
import type { AppState } from '../core/state';
import { escapeAttr, escapeHtml } from '../utils/escape';

export const AUTOCOMPLETE_DEBOUNCE_MS = 200;

export function scheduleAutocomplete(state: AppState, value: string): void {
  window.clearTimeout(state.autocompleteTimer);
  const fragment = getLastTagFragment(value);
  if (!fragment) {
    closeAutocomplete(state);
    return;
  }
  state.autocompleteTimer = window.setTimeout(() => {
    void requestAutocomplete(state, fragment);
  }, AUTOCOMPLETE_DEBOUNCE_MS);
}

export function closeAutocomplete(state: AppState): void {
  window.clearTimeout(state.autocompleteTimer);
  state.autocompleteToken += 1;
  const container = document.getElementById('dmh-ac');
  if (!container) return;
  container.classList.remove('dmh-open');
  container.innerHTML = '';
}

export function applyAutocompleteTag(state: AppState, tag: string): void {
  const input = document.getElementById('dmh-tags') as HTMLInputElement | null;
  if (!input || !tag) return;
  const parts = input.value.split(/\s+/);
  parts[parts.length - 1] = tag;
  input.value = parts.filter(Boolean).join(' ');
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
    .map((item) => {
      const cn = state.translations.translate(item.value);
      return `
        <button class="dmh-ac-item" type="button" data-tag="${escapeAttr(item.value)}">
          <span class="dmh-ac-name">${escapeHtml(item.value)}${cn ? ` <span class="dmh-ac-cn">${escapeHtml(cn)}</span>` : ''}</span>
          <span class="dmh-ac-count">${escapeHtml(item.count)}</span>
          <span class="dmh-ac-category">${escapeHtml(item.category)}</span>
        </button>`;
    })
    .join('');
  container.classList.add('dmh-open');
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
