import { consumeMasonryLaunchUrl, shouldSearchInCurrentTab } from './core/viewerTags';
import type { AppState } from './core/state';
import type { BooruAdapter } from './adapters/types';
import {
  createState,
  saveHideNsfw,
  saveShowViewerTags,
  saveTagClickBehavior,
  parseTagClickBehavior,
  DEFAULT_DOWNLOAD_FILENAME_TEMPLATES,
  DOWNLOAD_FILENAME_TEMPLATE_OPTIONS,
  saveCardWidth,
  saveDownloadFilenameTemplates,
  saveShowThumbnailButtons,
  saveShowThumbnailInfo,
  saveShowBackToTop,
  saveShowScrollbar,
  saveViewerUseOriginal,
  saveViewerWheelNavigation,
  type DownloadFilenameTemplates,
} from './core/state';
import { installStyles } from './ui/styles';
import { installLaunchButton, renderShell } from './ui/shell';
import { renderPosts } from './ui/cards';
import {
  applyAutocompleteTag,
  applySelectedAutocomplete,
  closeAutocomplete,
  moveAutocompleteSelection,
  openAutocomplete,
  scheduleAutocomplete,
} from './ui/autocomplete';
import {
  CARD_SIZE_OPTIONS,
  layoutMasonry,
  scheduleLayoutMasonry,
  shouldLoadMore,
} from './core/masonry';
import { getRequestTags, resetSearch } from './core/search';
import {
  captureBlacklist,
  createBlacklistConfigFromText,
  filterBlacklistedPosts,
  normalizeBlacklistText,
} from './core/blacklist';
import { getPostLoadError } from './api/posts';
import { updateBlacklistedTags } from './api/userSettings';
import { installShortcuts } from './core/shortcuts';
import {
  closeViewer,
  previewDownloadFilenameTemplate,
  validateDownloadFilenameTemplate,
  refreshViewerTags,
  setViewerTagsOpen,
  favoriteCurrentPost,
  onViewerImageDoubleClick,
  onViewerMediaClick,
  onViewerWheel,
  onZoomPointerDown,
  onZoomPointerEnd,
  onZoomPointerMove,
  openCurrentPost,
  openCurrentSource,
  downloadCurrentPost,
  showAdjacentViewerPost,
  showViewer,
  toggleZoomMode,
} from './core/viewer';
import { byId, setText } from './utils/dom';
import {
  bindScrollControls,
  scheduleScrollControlsUpdate,
  updateScrollControls,
} from './core/scrollControls';

export function boot(adapter: BooruAdapter): void {
  const state = createState(adapter);
  state.loadMore = () => loadNextPage(state);
  void state.translations.load().then(() => translateOriginalPageTags(state));
  if (canShowLaunchButton(location)) {
    installLaunchButton(() => void startMasonry(state));
    const launchUrl = consumeMasonryLaunchUrl(location.href);
    if (launchUrl) {
      history.replaceState(history.state, '', launchUrl);
      void startMasonry(state);
    }
  }
}

async function startMasonry(state: AppState): Promise<void> {
  if (state.starting || state.started) return;
  const button = byId<HTMLButtonElement>('dmh-launch');
  state.starting = true;
  let shellAttempted = false;
  if (button) {
    button.disabled = true;
    button.textContent = '加载中...';
  }

  try {
    await state.translations.load();
    const capturedBlacklist = captureBlacklist(document);
    state.blacklist = capturedBlacklist.config;
    state.blacklistText = capturedBlacklist.text;
    state.blacklistAvailable = capturedBlacklist.available;
    installStyles();
    shellAttempted = true;
    renderShell(state);
    bindShellEvents(state);
    bindScrollControls(state);
    observeMasonryLayout(state);
    state.started = true;
    await loadNextPage(state);
  } catch (error) {
    console.error('[Danbooru Masonry] start failed:', error);
    state.starting = false;
    state.started = false;
    if (shellAttempted) {
      state.layoutObserver?.disconnect();
      document.documentElement.classList.remove('dmh-no-scroll');
      byId('dmh-app')?.remove();
      byId('dmh-launch')?.remove();
      installLaunchButton(() => {
        const retryUrl = new URL(location.href);
        retryUrl.searchParams.set('dmh', '1');
        location.replace(retryUrl.toString());
      });
      const retry = byId('dmh-launch');
      if (retry) retry.textContent = '启动失败，点击重试';
    }
    if (button) {
      button.disabled = false;
      button.textContent = '瀑布流模式';
    }
  } finally {
    state.starting = false;
  }
}

function bindShellEvents(state: AppState): void {
  bindSettingsEditors(state);
  byId('dmh-show-nsfw')?.addEventListener('change', (event) => {
    const hideNsfw = !(event.target as HTMLInputElement).checked;
    if (state.hideNsfw === hideNsfw) return;
    state.hideNsfw = hideNsfw;
    saveHideNsfw(hideNsfw);
    closeViewer(state);
    closeAutocomplete(state);
    resetSearch(state, state.tags);
    window.scrollTo({ top: 0, behavior: 'instant' });
    void loadNextPage(state);
  });
  byId('dmh-show-viewer-tags')?.addEventListener('change', (event) => {
    state.showViewerTags = (event.target as HTMLInputElement).checked;
    saveShowViewerTags(state.showViewerTags);
    refreshViewerTags(state);
  });
  byId('dmh-tag-click-behavior')?.addEventListener('change', (event) => {
    state.tagClickBehavior = parseTagClickBehavior((event.target as HTMLSelectElement).value);
    saveTagClickBehavior(state.tagClickBehavior);
    refreshViewerTags(state);
  });
  byId('dmh-viewer-tags-toggle')?.addEventListener('click', () =>
    setViewerTagsOpen(state, !state.viewerTagsOpen),
  );
  byId('dmh-viewer-tags-panel')?.addEventListener('wheel', (event) => event.stopPropagation(), {
    passive: true,
  });
  byId('dmh-viewer')?.addEventListener('click', (event) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[data-viewer-tag]');
    if (!link || !shouldSearchInCurrentTab(event, state.tagClickBehavior)) return;
    event.preventDefault();
    closeViewer(state);
    closeAutocomplete(state);
    resetSearch(state, link.dataset.viewerTag || '');
    window.scrollTo({ top: 0, behavior: 'instant' });
    void loadNextPage(state);
  });
  byId('dmh-search')?.addEventListener('submit', (event) => {
    event.preventDefault();
    closeAutocomplete(state);
    const input = byId<HTMLInputElement>('dmh-tags');
    const tags = (input?.value || '').trim();
    input?.blur();
    resetSearch(state, tags);
    void loadNextPage(state);
  });
  byId('dmh-title-exit')?.addEventListener('click', () => location.reload());
  byId('dmh-exit')?.addEventListener('click', () => location.reload());
  byId('dmh-settings-toggle')?.addEventListener('click', () => openSettingsPanel());
  byId('dmh-settings-overlay')?.addEventListener('click', () => closeSettingsPanel());
  byId('dmh-settings-close')?.addEventListener('click', () => closeSettingsPanel());
  byId('dmh-blacklist-save')?.addEventListener('click', () => void saveBlacklist(state));
  byId<HTMLSelectElement>('dmh-card-size')?.addEventListener('change', (event) => {
    setCardSize(state, (event.currentTarget as HTMLSelectElement).value);
  });
  byId('dmh-download-template-reset')?.addEventListener('click', () =>
    resetDownloadFilenameTemplates(),
  );
  byId('dmh-download-cancel')?.addEventListener('click', () =>
    byId<HTMLDialogElement>('dmh-download-editor')?.close(),
  );
  byId('dmh-download-save')?.addEventListener('click', () => saveDownloadTemplateDraft(state));
  document.querySelectorAll<HTMLInputElement>('input[data-download-template]').forEach((input) => {
    input.addEventListener('input', () => {
      updateDownloadTemplatePreview(input);
      setText('dmh-download-template-status', '尚未保存');
    });
  });
  byId<HTMLInputElement>('dmh-viewer-use-original')?.addEventListener('change', (event) => {
    setViewerUseOriginal(state, (event.currentTarget as HTMLInputElement).checked);
  });
  byId<HTMLInputElement>('dmh-show-thumbnail-buttons')?.addEventListener('change', (event) => {
    setShowThumbnailButtons(state, (event.currentTarget as HTMLInputElement).checked);
  });
  byId<HTMLInputElement>('dmh-show-thumbnail-info')?.addEventListener('change', (event) => {
    setShowThumbnailInfo(state, (event.currentTarget as HTMLInputElement).checked);
  });
  byId<HTMLInputElement>('dmh-viewer-wheel-navigation')?.addEventListener('change', (event) => {
    setViewerWheelNavigation(state, (event.currentTarget as HTMLInputElement).checked);
  });
  byId<HTMLInputElement>('dmh-show-scrollbar')?.addEventListener('change', (event) => {
    setShowScrollbar(state, (event.currentTarget as HTMLInputElement).checked);
  });
  byId<HTMLInputElement>('dmh-show-back-to-top')?.addEventListener('change', (event) => {
    setShowBackToTop(state, (event.currentTarget as HTMLInputElement).checked);
  });
  const tagsInput = byId<HTMLInputElement>('dmh-tags');
  const searchForm = byId('dmh-search');
  // Keep logical input focus across window/tab switches, which can re-fire focus.
  let tagsInputFocused = false;
  tagsInput?.addEventListener('input', (event) => {
    scheduleAutocomplete(state, (event.target as HTMLInputElement).value);
  });
  tagsInput?.addEventListener('focus', (event) => {
    if (tagsInputFocused) return;
    tagsInputFocused = true;
    openAutocomplete(state, (event.target as HTMLInputElement).value);
  });
  tagsInput?.addEventListener('blur', () => {
    if (document.hasFocus()) tagsInputFocused = false;
  });
  searchForm?.addEventListener('focusout', (event) => {
    if (event.relatedTarget && searchForm.contains(event.relatedTarget as Node)) return;
    // Wait for focus to settle; moving to a candidate stays inside the component.
    queueMicrotask(() => {
      if (!document.hasFocus() || searchForm.contains(document.activeElement)) return;
      tagsInputFocused = false;
      closeAutocomplete(state);
    });
  });
  tagsInput?.addEventListener('click', (event) => {
    openAutocomplete(state, (event.target as HTMLInputElement).value);
  });
  byId<HTMLInputElement>('dmh-tags')?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      // Suppress search-input clearing and page shortcuts without changing autocomplete.
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const autocompleteOpen = byId('dmh-ac')?.classList.contains('dmh-open');
    if (autocompleteOpen && event.key === 'ArrowDown') {
      event.preventDefault();
      moveAutocompleteSelection(state, 1);
      return;
    }
    if (autocompleteOpen && event.key === 'ArrowUp') {
      event.preventDefault();
      moveAutocompleteSelection(state, -1);
      return;
    }
    if (autocompleteOpen && event.key === 'Enter' && applySelectedAutocomplete(state)) {
      event.preventDefault();
      return;
    }
  });
  byId<HTMLInputElement>('dmh-page')?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      jumpToSearchPage(state);
      return;
    }
    if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === 'ArrowUp' ? -1 : 1;
    turnSearchPage(state, direction);
  });
  byId<HTMLInputElement>('dmh-page')?.addEventListener('input', (event) => {
    const input = event.currentTarget as HTMLInputElement;
    input.value = input.value.replace(/\D+/g, '') || '1';
  });
  byId('dmh-ac')?.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-tag]');
    if (button) applyAutocompleteTag(state, button.dataset.tag || '');
  });
  document.addEventListener('pointerdown', (event) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.dmh-search-form, #dmh-scrollbar')) closeAutocomplete(state);
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
  byId('dmh-prev')?.addEventListener('click', () => void showAdjacentViewerPost(state, -1));
  byId('dmh-next')?.addEventListener('click', () => void showAdjacentViewerPost(state, 1));
  byId('dmh-favorite')?.addEventListener('click', () => void favoriteCurrentPost(state));
  byId('dmh-zoom-toggle')?.addEventListener('click', (event) => toggleZoomMode(state, event));
  byId('dmh-open-post')?.addEventListener('click', () => openCurrentPost(state));
  byId('dmh-download')?.addEventListener('click', (event) =>
    downloadCurrentPost(state, event.currentTarget as HTMLElement),
  );
  byId('dmh-open-source')?.addEventListener('click', () => openCurrentSource(state));
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    if (isViewerOpen() || isSettingsOpen()) return;
    const scrollY = window.scrollY;
    const scrollingDown = scrollY > lastScrollY;
    lastScrollY = scrollY;
    if (state.started && scrollingDown && shouldLoadMore()) void loadNextPage(state);
  });
  window.addEventListener(
    'wheel',
    (event) => {
      if (isViewerOpen() || isSettingsOpen()) return;
      if (state.started && event.deltaY > 0 && shouldLoadMore()) void loadNextPage(state);
    },
    { passive: true },
  );
  window.addEventListener('resize', () => scheduleLayoutMasonry(state));
  installShortcuts(state);
}

async function loadNextPage(state: AppState): Promise<void> {
  if (!state.started || state.loading || state.done) return;
  state.loading = true;
  const requestToken = state.requestToken;
  setText('dmh-status', `已加载 ${state.posts.length} 张 / 加载中...`);
  setText('dmh-message', '加载中...');
  setMasonryLoading(true);

  try {
    const page = state.page;
    let loadedPage = page;
    let posts = [] as AppState['posts'];
    while (true) {
      const result = await state.adapter.getPosts({
        tags: getRequestTags(state.tags, state.hideNsfw),
        page: loadedPage,
        pageUrlSearch: location.search,
      });
      if (requestToken !== state.requestToken) return;
      if (!result.hasSourcePosts) {
        state.done = true;
        setText('dmh-status', `已加载 ${state.posts.length} 张`);
        setText('dmh-message', state.posts.length ? '已经到底了，没有更多图片。' : '没有找到符合条件的图片。');
        return;
      }
      state.sourcePosts.push(...result.posts);
      posts = filterBlacklistedPosts(result.posts, state.blacklist);
      if (posts.length) break;
      loadedPage += 1;
    }
    const startIndex = state.posts.length;
    state.posts.push(...posts);
    renderPosts(state, posts, startIndex, (index) => showViewer(state, index));
    layoutMasonry(state);
    scheduleScrollControlsUpdate(state);
    state.page = loadedPage + 1;
    setPageInputValue(loadedPage);
    updatePageParam(state, loadedPage);
    setText('dmh-status', `已加载 ${state.posts.length} 张`);
    setText('dmh-message', '');
  } catch (error) {
    if (requestToken !== state.requestToken) return;
    const { message, upgrade } = getPostLoadError(error);
    setText('dmh-message', message);
    if (upgrade) {
      const link = document.createElement('a');
      link.href = new URL('/upgrade', state.adapter.origin).toString();
      link.target = '_blank';
      link.rel = 'noreferrer';
      link.textContent = ' 升级账号';
      byId('dmh-message')?.appendChild(link);
    }
    setText('dmh-status', `已加载 ${state.posts.length} 张`);
  } finally {
    if (requestToken === state.requestToken) {
      state.loading = false;
      setMasonryLoading(false);
    }
  }
}

function setMasonryLoading(loading: boolean): void {
  const progress = byId('dmh-loading-progress');
  if (!progress) return;
  progress.hidden = !loading;
  progress.setAttribute('aria-hidden', String(!loading));
}

async function saveBlacklist(state: AppState): Promise<void> {
  if (state.blacklistSaving || !state.blacklistAvailable) return;
  const input = byId<HTMLTextAreaElement>('dmh-blacklist-rules');
  const button = byId<HTMLButtonElement>('dmh-blacklist-save');
  const status = byId('dmh-blacklist-status');
  const userId = currentUserId();
  if (!input || !button || !status || !userId) return;

  const text = normalizeBlacklistText(input.value);
  state.blacklistSaving = true;
  button.disabled = true;
  input.readOnly = true;
  const cancel = byId<HTMLButtonElement>('dmh-blacklist-cancel');
  const close = byId<HTMLButtonElement>('dmh-blacklist-editor-close');
  if (cancel) cancel.disabled = true;
  if (close) close.disabled = true;
  status.classList.remove('dmh-error');
  status.textContent = '保存中...';
  try {
    await updateBlacklistedTags(state.adapter.origin, userId, text);
    state.blacklistText = text;
    state.blacklist = createBlacklistConfigFromText(text);
    input.value = text;
    refreshPostsForBlacklist(state);
    status.textContent = '已保存';
    byId<HTMLDialogElement>('dmh-blacklist-editor')?.close();
  } catch (error) {
    status.classList.add('dmh-error');
    status.textContent = error instanceof TypeError ? '网络连接失败，请检查网络后重新保存。' : error instanceof Error ? error.message : '保存失败，请稍后重试。';
  } finally {
    state.blacklistSaving = false;
    button.disabled = false;
    input.readOnly = false;
    if (cancel) cancel.disabled = false;
    if (close) close.disabled = false;
  }
}

function refreshPostsForBlacklist(state: AppState): void {
  const viewerPostId = isViewerOpen() ? state.posts[state.viewerIndex]?.id || '' : '';
  state.posts = filterBlacklistedPosts(state.sourcePosts, state.blacklist);
  const grid = byId('dmh-grid');
  if (grid) grid.innerHTML = '';
  renderPosts(state, state.posts, 0, (index) => showViewer(state, index));
  layoutMasonry(state);
  scheduleScrollControlsUpdate(state);
  setText('dmh-status', `已加载 ${state.posts.length} 张`);

  if (!viewerPostId) return;
  const viewerIndex = state.posts.findIndex((post) => post.id === viewerPostId);
  if (viewerIndex < 0) {
    closeViewer(state);
  } else {
    showViewer(state, viewerIndex);
  }
}

function currentUserId(): string {
  const userId = document.body.dataset.currentUserId || '';
  return document.body.dataset.currentUserIsAnonymous === 'true' ? '' : userId;
}

function updatePageParam(state: AppState, page: number): void {
  const url = new URL(state.adapter.getPostsPageUrl(state.tags, page));
  history.replaceState(null, '', url.toString());
}

function getSearchPageInput(): number {
  const page = Number(byId<HTMLInputElement>('dmh-page')?.value || '1');
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function turnSearchPage(state: AppState, direction: 1 | -1): void {
  const currentPage = getSearchPageInput();
  const nextPage = Math.max(1, currentPage + direction);
  if (nextPage === currentPage) return;
  setPageInputValue(nextPage);
  loadSearchPage(state, nextPage);
}

function jumpToSearchPage(state: AppState): void {
  loadSearchPage(state, getSearchPageInput());
}

function loadSearchPage(state: AppState, page: number): void {
  closeAutocomplete(state);
  resetSearch(state, state.tags, page);
  void loadNextPage(state);
}

function observeMasonryLayout(state: AppState): void {
  if (!('ResizeObserver' in window)) return;
  const grid = byId('dmh-grid');
  if (!grid) return;
  state.layoutObserver?.disconnect();
  let lastWidth = grid.clientWidth;
  state.layoutObserver = new ResizeObserver((entries) => {
    const width = entries[0]?.contentRect.width ?? grid.clientWidth;
    if (Math.abs(width - lastWidth) < 0.5) return;
    lastWidth = width;
    scheduleLayoutMasonry(state);
  });
  state.layoutObserver.observe(grid);
}

function setPageInputValue(page: number): void {
  const pageInput = byId<HTMLInputElement>('dmh-page');
  if (!pageInput) return;
  pageInput.value = String(page);
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

function isViewerOpen(): boolean {
  return byId('dmh-viewer')?.classList.contains('dmh-open') || false;
}

function isSettingsOpen(): boolean {
  return byId('dmh-settings-panel')?.classList.contains('dmh-open') || false;
}

function openSettingsPanel(): void {
  setSettingsPanelOpen(true);
}

function closeSettingsPanel(): void {
  setSettingsPanelOpen(false);
}

function setSettingsPanelOpen(open: boolean): void {
  const panel = byId('dmh-settings-panel');
  const overlay = byId('dmh-settings-overlay');
  const button = byId<HTMLButtonElement>('dmh-settings-toggle');
  if (!panel || !overlay || !button) return;
  panel.classList.toggle('dmh-open', open);
  overlay.classList.toggle('dmh-open', open);
  panel.setAttribute('aria-hidden', String(!open));
  overlay.setAttribute('aria-hidden', String(!open));
  button.setAttribute('aria-expanded', String(open));
  document.documentElement.classList.toggle('dmh-no-scroll', open || isViewerOpen());
}

function setCardSize(state: AppState, cardSize: string): void {
  const cardSizeOption = CARD_SIZE_OPTIONS.find((option) => option.key === cardSize);
  if (!cardSizeOption) return;
  const cardWidth = cardSizeOption.value;
  if (state.cardWidth === cardWidth) return;
  state.cardWidth = cardWidth;
  saveCardWidth(cardWidth);
  const app = byId('dmh-app');
  if (app) app.dataset.cardSize = cardSizeOption.key;
  const input = byId<HTMLSelectElement>('dmh-card-size');
  if (input) input.value = cardSizeOption.key;
  scheduleLayoutMasonry(state);
}

function setViewerUseOriginal(state: AppState, viewerUseOriginal: boolean): void {
  if (state.viewerUseOriginal === viewerUseOriginal) return;
  state.viewerUseOriginal = viewerUseOriginal;
  saveViewerUseOriginal(viewerUseOriginal);
  const input = byId<HTMLInputElement>('dmh-viewer-use-original');
  if (input) input.checked = viewerUseOriginal;
  if (isViewerOpen() && state.viewerIndex >= 0) showViewer(state, state.viewerIndex);
}

function setShowThumbnailButtons(state: AppState, showThumbnailButtons: boolean): void {
  if (state.showThumbnailButtons === showThumbnailButtons) return;
  state.showThumbnailButtons = showThumbnailButtons;
  saveShowThumbnailButtons(showThumbnailButtons);
  const app = byId('dmh-app');
  if (app) app.dataset.showThumbnailButtons = String(showThumbnailButtons);
  const input = byId<HTMLInputElement>('dmh-show-thumbnail-buttons');
  if (input) input.checked = showThumbnailButtons;
}

function setShowThumbnailInfo(state: AppState, showThumbnailInfo: boolean): void {
  if (state.showThumbnailInfo === showThumbnailInfo) return;
  state.showThumbnailInfo = showThumbnailInfo;
  saveShowThumbnailInfo(showThumbnailInfo);
  const app = byId('dmh-app');
  if (app) app.dataset.showThumbnailInfo = String(showThumbnailInfo);
  const input = byId<HTMLInputElement>('dmh-show-thumbnail-info');
  if (input) input.checked = showThumbnailInfo;
}

function setViewerWheelNavigation(state: AppState, viewerWheelNavigation: boolean): void {
  if (state.viewerWheelNavigation === viewerWheelNavigation) return;
  state.viewerWheelNavigation = viewerWheelNavigation;
  saveViewerWheelNavigation(viewerWheelNavigation);
  const input = byId<HTMLInputElement>('dmh-viewer-wheel-navigation');
  if (input) input.checked = viewerWheelNavigation;
}

function setShowScrollbar(state: AppState, showScrollbar: boolean): void {
  if (state.showScrollbar === showScrollbar) return;
  state.showScrollbar = showScrollbar;
  saveShowScrollbar(showScrollbar);
  const input = byId<HTMLInputElement>('dmh-show-scrollbar');
  if (input) input.checked = showScrollbar;
  updateScrollControls(state);
}

function setShowBackToTop(state: AppState, showBackToTop: boolean): void {
  if (state.showBackToTop === showBackToTop) return;
  state.showBackToTop = showBackToTop;
  saveShowBackToTop(showBackToTop);
  const input = byId<HTMLInputElement>('dmh-show-back-to-top');
  if (input) input.checked = showBackToTop;
  updateScrollControls(state);
}

function resetDownloadFilenameTemplates(): void {
  fillDownloadTemplateDraft(DEFAULT_DOWNLOAD_FILENAME_TEMPLATES);
  setText('dmh-download-template-status', '草稿已恢复默认，保存后生效');
}

function updateDownloadTemplatePreview(input: HTMLInputElement, validate = false): string {
  const error = validate ? validateDownloadFilenameTemplate(input.value.trim()) : '';
  input.setCustomValidity(error);
  setText('dmh-download-preview-' + input.dataset.downloadTemplate,
    error || '示例:' + previewDownloadFilenameTemplate(input.value.trim()));
  return error;
}

function fillDownloadTemplateDraft(templates: DownloadFilenameTemplates): void {
  for (const option of DOWNLOAD_FILENAME_TEMPLATE_OPTIONS) {
    const input = byId<HTMLInputElement>('dmh-download-template-' + option.key);
    if (!input) continue;
    input.value = templates[option.key];
    updateDownloadTemplatePreview(input);
  }
}

function saveDownloadTemplateDraft(state: AppState): void {
  const draft = { ...state.downloadFilenameTemplates };
  let firstInvalid: HTMLInputElement | null = null;
  for (const option of DOWNLOAD_FILENAME_TEMPLATE_OPTIONS) {
    const input = byId<HTMLInputElement>('dmh-download-template-' + option.key);
    if (!input) return;
    const error = updateDownloadTemplatePreview(input, true);
    if (error) firstInvalid ||= input;
    draft[option.key] = input.value.trim();
  }
  if (firstInvalid) {
    setText('dmh-download-template-status', '模板不能为空');
    firstInvalid.focus();
    firstInvalid.reportValidity();
    return;
  }
  state.downloadFilenameTemplates = draft;
  saveDownloadFilenameTemplates(draft);
  byId<HTMLDialogElement>('dmh-download-editor')?.close();
}

function bindSettingsEditors(state: AppState): void {
  for (const name of ['blacklist', 'download']) {
    const dialog = byId<HTMLDialogElement>('dmh-' + name + '-editor');
    const button = byId<HTMLButtonElement>('dmh-' + name + '-editor-open');
    if (!dialog || !button) continue;
    let pressedOnBackdrop = false;
    const isBackdrop = (event: MouseEvent): boolean => {
      if (event.target !== dialog) return false;
      const rect = dialog.getBoundingClientRect();
      return event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom;
    };
    dialog.addEventListener('pointerdown', (event) => {
      pressedOnBackdrop = event.button === 0 && isBackdrop(event);
    });
    dialog.addEventListener('pointercancel', () => { pressedOnBackdrop = false; });
    button.addEventListener('click', () => {
      pressedOnBackdrop = false;
      if (!dialog.open) {
        if (name === 'blacklist') restoreBlacklistDraft(state);
        if (name === 'download') {
          fillDownloadTemplateDraft(state.downloadFilenameTemplates);
          setText('dmh-download-template-status', '');
        }
        dialog.showModal();
      }
    });
    const closeEditor = () => {
      if (name === 'blacklist' && state.blacklistSaving) return;
      dialog.close();
    };
    byId('dmh-' + name + '-editor-close')?.addEventListener('click', closeEditor);
    if (name === 'blacklist') {
      byId('dmh-blacklist-cancel')?.addEventListener('click', closeEditor);
      dialog.addEventListener('cancel', (event) => {
        if (state.blacklistSaving) event.preventDefault();
      });
    }
    dialog.addEventListener('close', () => {
      pressedOnBackdrop = false;
      if (name === 'download') fillDownloadTemplateDraft(state.downloadFilenameTemplates);
      if (name === 'blacklist') restoreBlacklistDraft(state);
      button.focus();
    });
    dialog.addEventListener('keydown', (event) => {
      // Keep viewer shortcuts out of the modal, including arrows in text fields.
      event.stopPropagation();
    });
    dialog.addEventListener('click', (event) => {
      const shouldClose = pressedOnBackdrop && isBackdrop(event);
      pressedOnBackdrop = false;
      if (shouldClose) closeEditor();
    });
  }
}

function restoreBlacklistDraft(state: AppState): void {
  const input = byId<HTMLTextAreaElement>('dmh-blacklist-rules');
  if (input) input.value = state.blacklistText;
  const status = byId('dmh-blacklist-status');
  if (!status) return;
  status.classList.remove('dmh-error');
  status.textContent = !state.blacklistAvailable
    ? '未能读取原站黑名单，请刷新原站后重试'
    : currentUserId() ? '' : '登录 Danbooru 后可修改';
}
