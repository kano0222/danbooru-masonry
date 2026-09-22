import type { AppState } from './state';
import { setText } from '../utils/dom';

export function resetSearch(state: AppState, tags: string, page = 1): void {
  state.tags = tags.trim();
  state.page = page;
  state.visiblePage = page;
  state.posts = [];
  state.sourcePosts = [];
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

export function getRequestTags(tags: string, hideNsfw: boolean): string {
  if (!hideNsfw) return tags;
  const query = tags.trim();
  return query ? '( ' + query + ' ) rating:g' : 'rating:g';
}

export function getFavoriteSearchTag(userId: string, username: string, isAnonymous: boolean): string {
  if (!userId || isAnonymous || !username.trim()) return '';
  return `ordfav:${username.trim().replace(/\s+/g, '_')}`;
}
