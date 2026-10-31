import { SearchLibrary, type SearchLibraryData } from '../core/searchLibrary';
import type { PopularSearch } from '../api/popularSearches';
import { escapeAttr, escapeHtml } from '../utils/escape';
import { byId } from '../utils/dom';
import { icons } from './icons';
import { closeSearchPanel, showSearchPanel } from './searchPanel';

type Translate = (tag: string) => string;
const POPULAR_CACHE_MS = 5 * 60 * 1000;

export function translateSearchQuery(query: string, translate: Translate): string {
  const labels = queryTokens(query).flatMap((token) => {
    if (/^[~-]?[a-z_]+:/i.test(token) || /^(?:and|or|not|\(|\))$/i.test(token)) return [];
    const prefix = /^[~-]/.test(token) ? token[0] : '';
    const tag = prefix ? token.slice(1) : token;
    const cn = translate(tag);
    return cn && cn !== tag ? [`${prefix}${cn}`] : [];
  });
  return [...new Set(labels)].join(' · ');
}

function queryTokens(query: string): string[] {
  return query.match(/(?:[^\s"]+|"(?:\\.|[^"\\])*")+/g) || [];
}

function queryLabel(query: string, translate: Translate, inline = false): string {
  const cn = translateSearchQuery(query, translate);
  return `<span class="dmh-search-label${inline ? ' dmh-search-label-inline' : ''}"><span class="dmh-search-query-original">${escapeHtml(query)}</span>${cn ? `<span class="dmh-search-query-cn">${escapeHtml(cn)}</span>` : ''}</span>`;
}

function queryTitle(query: string, translate: Translate): string {
  const cn = translateSearchQuery(query, translate);
  return escapeAttr(cn ? `${query}\n${cn}` : query);
}

export function renderSearchLists(data: SearchLibraryData, translate: Translate, expanded = false, hidePopular = false): string {
  const queries = [...data.pinned, ...data.recent];
  const collapsedCount = hidePopular ? 16 : 8;
  const visibleQueries = expanded ? queries : queries.slice(0, collapsedCount);
  return `<section aria-labelledby="dmh-search-history-title">
    <div class="dmh-search-history-heading">
      <h3 id="dmh-search-history-title">搜索历史</h3>
    </div>
    <div class="dmh-search-chips" id="dmh-search-history-items">${visibleQueries.length ? visibleQueries.map((query) => {
      const pinned = data.pinned.includes(query);
      return `<div class="dmh-search-entry${pinned ? ' dmh-search-entry-pinned' : ''}">
        <button type="button" class="dmh-search-query" data-search-action="search" data-query="${escapeAttr(query)}" title="${queryTitle(query, translate)}">${queryLabel(query, translate)}</button>
        <button type="button" class="dmh-search-pin" data-search-action="pin" data-query="${escapeAttr(query)}" aria-pressed="${pinned}" aria-label="${pinned ? '取消固定' : '固定'}：${escapeAttr(query)}" title="${pinned ? '取消固定' : '固定'}">${icons.pin}</button>
        ${pinned ? '' : `<button type="button" class="dmh-search-remove" data-search-action="remove" data-query="${escapeAttr(query)}" aria-label="删除搜索：${escapeAttr(query)}" title="删除">${icons.close}</button>`}
      </div>`;
    }).join('') : '<p class="dmh-search-empty">尚无搜索历史</p>'}</div>
    ${queries.length > collapsedCount ? `<button type="button" id="dmh-search-history-toggle" data-search-action="expand" aria-expanded="${expanded}" aria-controls="dmh-search-history-items">${expanded ? '收起' : '展开更多'}${icons.foldArrow}</button>` : ''}
  </section>`;
}

export function renderPopularSearches(items: PopularSearch[], translate: Translate): string {
  if (!items.length) return '';
  return `<section aria-labelledby="dmh-search-popular-title">
    <h3 id="dmh-search-popular-title">热门搜索</h3>
    <div class="dmh-search-popular-grid">${items.map(({ query, count }, index) => `
      <button type="button" data-search-action="search" data-query="${escapeAttr(query)}" title="${queryTitle(query, translate)} · ${count} 次搜索">
        <span class="dmh-search-rank">${index + 1}</span><span class="dmh-search-popular-query">${queryLabel(query, translate, true)}</span>
      </button>`).join('')}</div>
  </section>`;
}

interface SearchLibraryOptions {
  onSearch: (query: string) => void;
  onClose: (preservePanel?: boolean) => void;
  translate: Translate;
  loadPopular: () => Promise<PopularSearch[]>;
  hidePopular?: boolean;
}

export function bindSearchLibrary(options: SearchLibraryOptions) {
  const library = new SearchLibrary();
  const panel = byId('dmh-search-panel');
  const lists = byId('dmh-search-lists');
  const popularContainer = byId('dmh-search-popular');
  const input = byId<HTMLInputElement>('dmh-tags');
  let popular: PopularSearch[] = [];
  let pending = false;
  let lastFetch = -Infinity;
  let expanded = false;
  let hidePopular = options.hidePopular ?? false;

  function close(restoreFocus = false): void {
    if (restoreFocus) input?.focus();
    options.onClose();
    closeSearchPanel();
    expanded = false;
    if (panel) panel.scrollTop = 0;
  }

  function render(): void {
    if (lists) lists.innerHTML = renderSearchLists(library.data, options.translate, expanded, hidePopular);
  }

  function renderPopular(): void {
    if (!popularContainer) return;
    popularContainer.innerHTML = renderPopularSearches(popular, options.translate);
    popularContainer.hidden = hidePopular || !popular.length;
  }

  function loadPopular(): void {
    if (hidePopular || pending || Date.now() - lastFetch < POPULAR_CACHE_MS) return;
    pending = true;
    void (async () => {
      try {
        popular = await options.loadPopular();
      } catch {
        popular = [];
      } finally {
        pending = false;
        lastFetch = Date.now();
        renderPopular();
      }
    })();
  }

  function record(query: string): void {
    library.record(query);
    render();
  }

  function setHidePopular(hidden: boolean): void {
    hidePopular = hidden;
    expanded = false;
    render();
    renderPopular();
    if (panel) panel.scrollTop = 0;
    if (!panel?.hidden && !byId('dmh-search-library')?.hidden) loadPopular();
  }

  function open(): void {
    options.onClose(true);
    library.refresh();
    render();
    renderPopular();
    showSearchPanel('history');
    loadPopular();
  }

  byId('dmh-search-library')?.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('button[data-search-action]');
    if (!button) return;
    if (button.dataset.searchAction === 'expand') {
      expanded = !expanded;
      render();
      if (!expanded && panel) panel.scrollTop = 0;
      byId<HTMLButtonElement>('dmh-search-history-toggle')?.focus({ preventScroll: true });
      return;
    }
    const query = button.dataset.query || '';
    if (button.dataset.searchAction === 'search') {
      record(query);
      close();
      options.onSearch(query);
      return;
    }
    const action = button.dataset.searchAction;
    if (action === 'pin') library.togglePinned(query);
    else if (action === 'remove') library.remove(query);
    else return;
    const buttons = Array.from(lists?.querySelectorAll<HTMLButtonElement>('button') || []);
    const focusIndex = buttons.indexOf(button);
    render();
    const nextButtons = Array.from(lists?.querySelectorAll<HTMLButtonElement>('button') || []);
    const pin = nextButtons.find((item) => item.dataset.query === query && item.dataset.searchAction === 'pin');
    (pin || nextButtons[Math.min(focusIndex, nextButtons.length - 1)] || input)?.focus();
  });
  document.addEventListener('pointerdown', (event) => {
    if (!(event.target as Element).closest('.dmh-search, #dmh-scrollbar')) close();
  });
  document.addEventListener('focusin', (event) => {
    if (!(event.target as Element).closest('.dmh-search')) close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !panel || panel.hidden) return;
    event.preventDefault();
    event.stopPropagation();
    close(true);
  });
  window.addEventListener('popstate', () => close());
  render();
  return { record, close, open, setHidePopular };
}
