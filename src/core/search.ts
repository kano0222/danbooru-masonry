import type { AppState } from './state';
import { setText } from '../utils/dom';

export function resetSearch(state: AppState, tags: string, page = 1): void {
  state.tags = tags.trim();
  state.page = page;
  state.posts = [];
  state.done = false;
  state.loading = false;
  state.viewerIndex = -1;
  state.requestToken += 1;
  const input = document.getElementById('dmh-tags') as HTMLInputElement | null;
  if (input) input.value = state.tags;
  const pageInput = document.getElementById('dmh-page') as HTMLInputElement | null;
  if (pageInput) pageInput.value = String(state.page);
  const grid = document.getElementById('dmh-grid');
  if (grid) {
    grid.innerHTML = '';
    grid.style.height = '0px';
  }
  setText('dmh-message', '');
  history.pushState(null, '', state.adapter.getPostsPageUrl(state.tags, state.page));
}
