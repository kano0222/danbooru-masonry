import type { AppState } from './core/state';
import type { BooruAdapter } from './adapters/types';
import { createState } from './core/state';
import { installStyles } from './ui/styles';
import { installLaunchButton, renderShell } from './ui/shell';
import { renderPosts } from './ui/cards';
import {
  applyAutocompleteTag,
  closeAutocomplete,
  scheduleAutocomplete,
} from './ui/autocomplete';
import { layoutMasonry, scheduleLayoutMasonry, shouldFillViewport, shouldLoadMore } from './core/masonry';
import { resetSearch } from './core/search';
import { installShortcuts } from './core/shortcuts';
import {
  closeViewer,
  favoriteCurrentPost,
  onViewerImageDoubleClick,
  onViewerMediaClick,
  onViewerWheel,
  onZoomPointerDown,
  onZoomPointerEnd,
  onZoomPointerMove,
  openCurrentPost,
  openCurrentSource,
  showViewer,
  toggleZoomMode,
} from './core/viewer';
import { byId, setText } from './utils/dom';

export function boot(adapter: BooruAdapter): void {
  const state = createState(adapter);
  void state.translations.load().then(() => translateOriginalPageTags(state));
  if (canShowLaunchButton(location)) {
    installLaunchButton(() => void startMasonry(state));
  }
}

async function startMasonry(state: AppState): Promise<void> {
  if (state.starting || state.started) return;
  const button = byId<HTMLButtonElement>('dmh-launch');
  state.starting = true;
  if (button) {
    button.disabled = true;
    button.textContent = '加载中...';
  }

  try {
    await state.translations.load();
    installStyles();
    renderShell(state);
    bindShellEvents(state);
    state.started = true;
    await loadNextPage(state);
  } catch (error) {
    console.error('[Danbooru Masonry] start failed:', error);
    state.starting = false;
    if (button) {
      button.disabled = false;
      button.textContent = '瀑布流模式';
    }
  } finally {
    state.starting = false;
  }
}

function bindShellEvents(state: AppState): void {
  byId('dmh-search')?.addEventListener('submit', (event) => {
    event.preventDefault();
    closeAutocomplete(state);
    const tags = (byId<HTMLInputElement>('dmh-tags')?.value || '').trim();
    resetSearch(state, tags);
    void loadNextPage(state);
  });
  byId('dmh-exit')?.addEventListener('click', () => location.reload());
  byId<HTMLInputElement>('dmh-tags')?.addEventListener('input', (event) =>
    scheduleAutocomplete(state, (event.target as HTMLInputElement).value),
  );
  byId<HTMLInputElement>('dmh-tags')?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && byId('dmh-ac')?.classList.contains('dmh-open')) {
      closeAutocomplete(state);
      event.stopPropagation();
    }
  });
  byId('dmh-ac')?.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-tag]');
    if (button) applyAutocompleteTag(state, button.dataset.tag || '');
  });
  byId('dmh-viewer')?.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).id === 'dmh-viewer') closeViewer(state);
  });
  byId('dmh-viewer')?.addEventListener('wheel', (event) => onViewerWheel(state, event as WheelEvent), {
    passive: false,
  });
  byId('dmh-viewer-img')?.addEventListener('click', (event) => onViewerMediaClick(state, event));
  byId('dmh-viewer-img')?.addEventListener('dblclick', (event) =>
    onViewerImageDoubleClick(state, event),
  );
  byId('dmh-viewer-img')?.addEventListener('pointerdown', (event) =>
    onZoomPointerDown(state, event),
  );
  byId('dmh-viewer-img')?.addEventListener('pointermove', (event) =>
    onZoomPointerMove(state, event),
  );
  byId('dmh-viewer-img')?.addEventListener('pointerup', (event) => onZoomPointerEnd(state, event));
  byId('dmh-viewer-img')?.addEventListener('pointercancel', (event) =>
    onZoomPointerEnd(state, event),
  );
  byId('dmh-viewer-img')?.addEventListener('dragstart', (event) => {
    if (state.zoomMode) event.preventDefault();
  });
  byId('dmh-viewer-video')?.addEventListener('click', (event) => onViewerMediaClick(state, event));
  byId('dmh-close')?.addEventListener('click', () => closeViewer(state));
  byId('dmh-prev')?.addEventListener('click', () => showViewer(state, state.viewerIndex - 1));
  byId('dmh-next')?.addEventListener('click', () => showViewer(state, state.viewerIndex + 1));
  byId('dmh-favorite')?.addEventListener('click', () => void favoriteCurrentPost(state));
  byId('dmh-zoom-toggle')?.addEventListener('click', (event) => toggleZoomMode(state, event));
  byId('dmh-open-post')?.addEventListener('click', () => openCurrentPost(state));
  byId('dmh-open-source')?.addEventListener('click', () => openCurrentSource(state));
  window.addEventListener('scroll', () => {
    if (state.started && shouldLoadMore()) void loadNextPage(state);
  });
  window.addEventListener('resize', () => scheduleLayoutMasonry(state));
  installShortcuts(state);
}

async function loadNextPage(state: AppState): Promise<void> {
  if (!state.started || state.loading || state.done) return;
  state.loading = true;
  const requestToken = state.requestToken;
  setText('dmh-status', `已加载 ${state.posts.length} 张 / 加载中...`);
  setText('dmh-message', '');

  try {
    const page = state.page;
    const posts = await state.adapter.getPosts({
      tags: state.tags,
      page,
      pageUrlSearch: location.search,
    });
    if (requestToken !== state.requestToken) return;
    if (!posts.length) {
      state.done = true;
      setText('dmh-status', `已加载 ${state.posts.length} 张`);
      setText('dmh-message', state.posts.length ? '下面没有了...' : 'No posts found.');
      return;
    }
    const startIndex = state.posts.length;
    state.posts.push(...posts);
    renderPosts(state, posts, startIndex, (index) => showViewer(state, index));
    layoutMasonry(state);
    state.page = page + 1;
    updatePageParam(state, page);
    setText('dmh-status', `已加载 ${state.posts.length} 张`);
  } catch (error) {
    if (requestToken !== state.requestToken) return;
    const message = error instanceof Error ? error.message : String(error);
    setText('dmh-message', `Failed to load posts: ${message}`);
    setText('dmh-status', `已加载 ${state.posts.length} 张`);
  } finally {
    if (requestToken === state.requestToken) {
      state.loading = false;
      requestAnimationFrame(() => {
        if (state.started && !state.loading && !state.done && shouldFillViewport()) void loadNextPage(state);
      });
    }
  }
}

function updatePageParam(state: AppState, page: number): void {
  const url = new URL(state.adapter.getPostsPageUrl(state.tags, page));
  history.replaceState(null, '', url.toString());
}

function translateOriginalPageTags(state: AppState): void {
  if (!state.translations.loaded) return;
  const links = document.querySelectorAll<HTMLAnchorElement>(
    '.tag-list li a[href*="/posts?tags="], #tag-sidebar li a[href*="/posts?tags="], #tags-table td.name-column a[href*="/posts?tags="]',
  );
  links.forEach((link) => {
    if (link.dataset.dmhTranslated === '1') return;
    const tag = getTagFromLink(state, link);
    const translated = state.translations.translate(tag);
    if (!translated) return;
    const originalText = link.textContent?.trim() || tag;
    link.dataset.dmhTranslated = '1';
    link.title = link.title ? `${link.title} ${translated}` : translated;
    link.textContent = `[${translated}] ${originalText}`;
  });
}

function getTagFromLink(state: AppState, link: HTMLAnchorElement): string {
  try {
    const url = new URL(link.getAttribute('href') || '', state.adapter.origin);
    return (url.searchParams.get('tags') || link.textContent || '').trim().replace(/\s+/g, '_');
  } catch {
    return (link.textContent || '').trim().replace(/\s+/g, '_');
  }
}

function canShowLaunchButton(currentLocation: Location): boolean {
  return (
    currentLocation.pathname === '/' ||
    currentLocation.pathname === '/posts' ||
    currentLocation.pathname === '/posts/'
  );
}
