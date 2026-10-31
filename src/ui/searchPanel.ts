import { byId } from '../utils/dom';

export function showSearchPanel(mode: 'history' | 'suggestions'): void {
  const panel = byId('dmh-search-panel');
  const history = byId('dmh-search-library');
  const suggestions = byId('dmh-ac');
  if (panel) panel.hidden = false;
  if (history) history.hidden = mode !== 'history';
  if (suggestions) {
    suggestions.hidden = mode !== 'suggestions';
    suggestions.setAttribute('aria-hidden', String(mode !== 'suggestions'));
  }
  byId('dmh-tags')?.setAttribute('aria-expanded', 'true');
}

export function closeSearchPanel(): void {
  for (const id of ['dmh-search-panel', 'dmh-search-library', 'dmh-ac']) {
    const element = byId(id);
    if (element) element.hidden = true;
  }
  byId('dmh-tags')?.setAttribute('aria-expanded', 'false');
}
