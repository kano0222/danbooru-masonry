import { consumeMasonryLaunchUrl, shouldSearchInCurrentTab } from './core/viewerTags';
import type { AppState } from './core/state';
import type { BooruAdapter } from './adapters/types';
import {
  createState,
  saveHideNsfw,
  saveAutoEnterMasonry,
  saveTagClickBehavior,
  parseTagClickBehavior,
  saveThemeMode,
  DEFAULT_DOWNLOAD_FILENAME_TEMPLATES,
  DOWNLOAD_FILENAME_TEMPLATE_OPTIONS,
  saveCardWidth,
  saveDownloadFilenameTemplates,
  saveShowThumbnailButtons,
  saveShowThumbnailInfo,
  saveShowScrollbar,
  saveViewerUseOriginal,
  saveViewerPreloadCount,
  saveViewerWheelNavigation,
  type DownloadFilenameTemplates,
} from './core/state';
import { installStyles } from './ui/styles';
import { applyTheme, getNextThemeMode } from './ui/theme';
import { installLaunchButton, renderBlacklistRuleRows, renderShell } from './ui/shell';
import { renderPosts } from './ui/cards';
import {
  applyBlacklistAutocompleteTag,
  applySelectedBlacklistAutocomplete,
  closeBlacklistAutocomplete,
  moveBlacklistAutocompleteSelection,
  openBlacklistAutocomplete,
  scheduleBlacklistAutocomplete,
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
import { getFavoriteSearchTag, getRequestTags, resetSearch } from './core/search';
import {
  addBlacklistRuleSource,
  captureBlacklist,
  createBlacklistConfigFromText,
  filterBlacklistedPosts,
  normalizeBlacklistText,
  getBlacklistRuleSources,
  removeBlacklistRuleSource,
} from './core/blacklist';
import { getPostLoadError } from './api/posts';
import { updateBlacklistedTags } from './api/userSettings';
import { installShortcuts } from './core/shortcuts';
import {
  closeViewer,
  previewDownloadFilenameTemplate,
  validateDownloadFilenameTemplate,
  refreshViewerTags,
  renderViewerBlacklistChoices,
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
  showSnackbar,
  refreshViewerPreload,
  toggleZoomMode,
} from './core/viewer';
import { byId, setText } from './utils/dom';
import {
  bindScrollControls,
  scheduleScrollControlsUpdate,
  updateScrollControls,
} from './core/scrollControls';

interface MasonryHistoryEntry {
  key: string;
  tags: string;
  startPage: number;
  loadedPage: number;
  viewerPostId?: string;
  viewerPage?: number;
}

interface MasonryHistoryState {
  dmh?: MasonryHistoryEntry;
  dmhBase?: true;
}

const MAX_SEARCH_SNAPSHOTS = 8;

export function boot(adapter: BooruAdapter): void {
  const state = createState(adapter);
  state.onViewerShown = (postId) => syncViewerHistory(state, postId);
  state.requestViewerClose = () => closeViewerFromHistory(state);
  window.addEventListener('popstate', (event) =>
    handleHistoryNavigation(state, event as PopStateEvent),
  );
  state.loadMore = () => loadNextPage(state);
  void state.translations.load().then(() => translateOriginalPageTags(state));
  if (canShowLaunchButton(location)) {
    installLaunchButton(() => void startMasonry(state));
    const skipAutoEnter = new URL(location.href).searchParams.get('dmh') === '0';
    const launchUrl = consumeMasonryLaunchUrl(location.href);
    if (launchUrl) {
      history.replaceState(history.state, '', launchUrl);
      void startMasonry(state);
    } else if (skipAutoEnter) {
      const cleanUrl = new URL(location.href);
      cleanUrl.searchParams.delete('dmh');
      history.replaceState(history.state, '', cleanUrl.toString());
    } else if (state.autoEnterMasonry) {
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
    applyTheme(state.themeMode);
    installStyles();
    shellAttempted = true;
    renderShell(state);
    bindShellEvents(state);
    bindScrollControls(state);
    observeMasonryLayout(state);
    state.started = true;
    const initialHistoryEntry = initializeMasonryHistory(state);
    await loadNextPage(state);
    if (initialHistoryEntry?.viewerPostId) {
      history.replaceState(
        createMasonryHistoryState(
          state, initialHistoryEntry.viewerPostId, initialHistoryEntry.viewerPage,
        ),
        '',
        location.href,
      );
      if (!restoreViewerFromHistory(state, initialHistoryEntry.viewerPostId)) {
        history.replaceState(createMasonryHistoryState(state), '', location.href);
      }
    }
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
    restartCurrentSearch(state);
    window.scrollTo({ top: 0, behavior: 'instant' });
    void loadNextPage(state);
  });
  byId('dmh-auto-enter-masonry')?.addEventListener('change', (event) => {
    state.autoEnterMasonry = (event.target as HTMLInputElement).checked;
    saveAutoEnterMasonry(state.autoEnterMasonry);
  });
  byId('dmh-tag-click-behavior')?.addEventListener('change', (event) => {
    state.tagClickBehavior = parseTagClickBehavior((event.target as HTMLSelectElement).value);
    saveTagClickBehavior(state.tagClickBehavior);
    refreshViewerTags(state);
  });
  byId('dmh-theme-toggle')?.addEventListener('click', () => {
    state.themeMode = getNextThemeMode(state.themeMode);
    saveThemeMode(state.themeMode);
    applyTheme(state.themeMode);
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
    beginSearch(state, link.dataset.viewerTag || '');
    window.scrollTo({ top: 0, behavior: 'instant' });
    void loadNextPage(state);
  });
  const searchTags = (tags: string) => {
    closeAutocomplete(state);
    const input = byId<HTMLInputElement>('dmh-tags');
    input?.blur();
    beginSearch(state, tags.trim());
    window.scrollTo({ top: 0, behavior: 'instant' });
    void loadNextPage(state);
  };
  byId('dmh-search')?.addEventListener('submit', (event) => {
    event.preventDefault();
    searchTags(byId<HTMLInputElement>('dmh-tags')?.value || '');
  });
  byId('dmh-hot-search')?.addEventListener('click', () => searchTags('order:rank'));
  byId('dmh-favorites-search')?.addEventListener('click', () => {
    const tag = getFavoriteSearchTag(
      currentUserId(),
      document.body.dataset.currentUserName || '',
      document.body.dataset.currentUserIsAnonymous === 'true',
    );
    if (tag) searchTags(tag);
  });
  byId('dmh-title-exit')?.addEventListener('click', () => exitMasonry());
  byId('dmh-exit')?.addEventListener('click', () => exitMasonry());
  byId('dmh-settings-toggle')?.addEventListener('click', () => openSettingsPanel());
  byId('dmh-settings-overlay')?.addEventListener('click', () => closeSettingsPanel());
  byId('dmh-settings-close')?.addEventListener('click', () => closeSettingsPanel());
  byId('dmh-blacklist-save')?.addEventListener('click', () => void saveBlacklist(state));
  const viewerBlacklistSelection = new Set<string>();
  byId('dmh-viewer-blacklist')?.addEventListener('click', () => {
    const choices = byId('dmh-viewer-blacklist-choices');
    const dialog = byId<HTMLDialogElement>('dmh-viewer-blacklist-dialog');
    if (!choices || !dialog) return;
    viewerBlacklistSelection.clear();
    choices.innerHTML = renderViewerBlacklistChoices(state);
    setText('dmh-viewer-blacklist-status', '');
    const confirm = byId<HTMLButtonElement>('dmh-viewer-blacklist-confirm');
    if (confirm) {
      confirm.disabled = true;
      confirm.textContent = '确认加入';
    }
    dialog.showModal();
  });
  byId('dmh-viewer-blacklist-choices')?.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>(
      'button[data-blacklist-choice]',
    );
    const tag = button?.dataset.blacklistChoice;
    if (!button || !tag) return;
    if (viewerBlacklistSelection.has(tag)) viewerBlacklistSelection.delete(tag);
    else viewerBlacklistSelection.add(tag);
    const selected = viewerBlacklistSelection.has(tag);
    button.classList.toggle('dmh-selected', selected);
    button.setAttribute('aria-pressed', String(selected));
    const confirm = byId<HTMLButtonElement>('dmh-viewer-blacklist-confirm');
    if (confirm) {
      confirm.disabled = viewerBlacklistSelection.size === 0;
      confirm.textContent = viewerBlacklistSelection.size
        ? `确认加入（${viewerBlacklistSelection.size}）` : '确认加入';
    }
  });
  const closeViewerBlacklistDialog = () =>
    byId<HTMLDialogElement>('dmh-viewer-blacklist-dialog')?.close();
  byId('dmh-viewer-blacklist-close')?.addEventListener('click', closeViewerBlacklistDialog);
  byId('dmh-viewer-blacklist-cancel')?.addEventListener('click', closeViewerBlacklistDialog);
  byId('dmh-viewer-blacklist-confirm')?.addEventListener('click', () =>
    void addTagsToBlacklist(state, [...viewerBlacklistSelection]),
  );
  const blacklistRuleInput = byId<HTMLInputElement>('dmh-blacklist-new-rule');
  const blacklistComposer = byId('dmh-blacklist-composer');
  blacklistRuleInput?.addEventListener('input', (event) => {
    scheduleBlacklistAutocomplete(state, (event.currentTarget as HTMLInputElement).value);
  });
  blacklistRuleInput?.addEventListener('focus', (event) => {
    openBlacklistAutocomplete(state, (event.currentTarget as HTMLInputElement).value);
  });
  blacklistRuleInput?.addEventListener('click', (event) => {
    openBlacklistAutocomplete(state, (event.currentTarget as HTMLInputElement).value);
  });
  blacklistRuleInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closeBlacklistAutocomplete(state);
      return;
    }
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const autocompleteOpen = byId('dmh-blacklist-ac')?.classList.contains('dmh-open');
    if (autocompleteOpen && event.key === 'ArrowDown') {
      event.preventDefault();
      moveBlacklistAutocompleteSelection(state, 1);
      return;
    }
    if (autocompleteOpen && event.key === 'ArrowUp') {
      event.preventDefault();
      moveBlacklistAutocompleteSelection(state, -1);
      return;
    }
    if (
      autocompleteOpen
      && event.key === 'Enter'
      && applySelectedBlacklistAutocomplete(state)
    ) {
      event.preventDefault();
    }
  });
  blacklistComposer?.addEventListener('focusout', (event) => {
    if (event.relatedTarget && blacklistComposer.contains(event.relatedTarget as Node)) return;
    queueMicrotask(() => {
      if (!blacklistComposer.contains(document.activeElement)) {
        closeBlacklistAutocomplete(state);
      }
    });
  });
  byId('dmh-blacklist-ac')?.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-tag]');
    if (button) applyBlacklistAutocompleteTag(state, button.dataset.tag || '');
  });
  blacklistComposer?.addEventListener('submit', (event) => {
    event.preventDefault();
    closeBlacklistAutocomplete(state);
    addBlacklistDraftRule();
  });
  let pendingBlacklistRemoveIndex: number | null = null;
  const closeBlacklistRemoveConfirmation = () => {
    pendingBlacklistRemoveIndex = null;
    const confirmation = byId('dmh-blacklist-remove-confirm');
    if (confirmation) confirmation.hidden = true;
    setText('dmh-blacklist-remove-rule', '');
  };
  byId('dmh-blacklist-rule-list')?.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>(
      'button[data-blacklist-remove]',
    );
    if (!button || state.blacklistSaving) return;
    const index = Number(button.dataset.blacklistRemove);
    const input = byId<HTMLTextAreaElement>('dmh-blacklist-rules');
    const rule = input ? getBlacklistRuleSources(input.value)[index] : '';
    if (!Number.isInteger(index) || !rule) return;
    pendingBlacklistRemoveIndex = index;
    setText('dmh-blacklist-remove-rule', rule);
    const confirmation = byId('dmh-blacklist-remove-confirm');
    if (confirmation) confirmation.hidden = false;
    byId<HTMLButtonElement>('dmh-blacklist-remove-confirm-button')?.focus();
  });
  byId('dmh-blacklist-remove-cancel')?.addEventListener(
    'click',
    closeBlacklistRemoveConfirmation,
  );
  byId('dmh-blacklist-remove-confirm-button')?.addEventListener('click', () => {
    if (pendingBlacklistRemoveIndex === null || state.blacklistSaving) return;
    removeBlacklistDraftRule(pendingBlacklistRemoveIndex);
    closeBlacklistRemoveConfirmation();
  });
  byId('dmh-blacklist-rules')?.addEventListener('input', () => {
    renderBlacklistDraftRules();
    markBlacklistDraftChanged();
  });

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
  byId<HTMLSelectElement>('dmh-viewer-preload-count')?.addEventListener('change', (event) => {
    state.viewerPreloadCount = Number((event.currentTarget as HTMLSelectElement).value);
    saveViewerPreloadCount(state.viewerPreloadCount);
    if (isViewerOpen()) refreshViewerPreload(state);
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
    if (!target.closest('.dmh-blacklist-composer')) closeBlacklistAutocomplete(state);
  });
  byId('dmh-viewer')?.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).id === 'dmh-viewer') closeViewerFromHistory(state);
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
  byId('dmh-close')?.addEventListener('click', () => closeViewerFromHistory(state));
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
      for (const post of result.posts) {
        state.postPages.set(post.id, loadedPage);
      }
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
    state.loadedPage = loadedPage;
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
  const input = byId<HTMLTextAreaElement>('dmh-blacklist-rules');
  if (!input) return;
  if (await persistBlacklist(state, input.value, true)) {
    byId<HTMLDialogElement>('dmh-blacklist-editor')?.close();
  }
}

async function addTagsToBlacklist(state: AppState, tags: string[]): Promise<void> {
  if (state.blacklistSaving) {
    setText('dmh-viewer-blacklist-status', '黑名单正在保存，请稍后重试');
    return;
  }
  if (!tags.length) return;
  const previousText = normalizeBlacklistText(state.blacklistText);
  let nextText = previousText;
  let addedCount = 0;
  for (const tag of tags) {
    const addedText = addBlacklistRuleSource(nextText, tag);
    if (addedText !== nextText) addedCount += 1;
    nextText = addedText;
  }
  if (!addedCount) {
    setText('dmh-viewer-blacklist-status', '所选标签已在黑名单中');
    return;
  }
  if (!await persistBlacklist(state, nextText, false)) return;
  byId<HTMLDialogElement>('dmh-viewer-blacklist-dialog')?.close();
  showSnackbar(`已将 ${addedCount} 个标签加入黑名单`);
}

async function persistBlacklist(
  state: AppState,
  value: string,
  fromEditor: boolean,
): Promise<boolean> {
  if (state.blacklistSaving || !state.blacklistAvailable) return false;
  const userId = currentUserId();
  if (!userId) return false;
  const text = normalizeBlacklistText(value);
  const status = byId('dmh-blacklist-status');
  state.blacklistSaving = true;
  setBlacklistControlsDisabled(true);
  status?.classList.remove('dmh-error');
  if (fromEditor && status) status.textContent = '保存中...';
  try {
    await updateBlacklistedTags(state.adapter.origin, userId, text);
    state.blacklistText = text;
    state.blacklist = createBlacklistConfigFromText(text);
    const input = byId<HTMLTextAreaElement>('dmh-blacklist-rules');
    if (input) input.value = text;
    renderBlacklistDraftRules();
    refreshPostsForBlacklist(state);
    if (fromEditor && status) status.textContent = '已保存';
    return true;
  } catch (error) {
    const message = error instanceof TypeError
      ? '网络连接失败，请检查网络后重新保存。'
      : error instanceof Error ? error.message : '保存失败，请稍后重试。';
    if (fromEditor && status) {
      status.classList.add('dmh-error');
      status.textContent = message;
    } else {
      showSnackbar(message);
    }
    return false;
  } finally {
    state.blacklistSaving = false;
    setBlacklistControlsDisabled(false);
  }
}

function setBlacklistControlsDisabled(disabled: boolean): void {
  const input = byId<HTMLTextAreaElement>('dmh-blacklist-rules');
  if (input) input.readOnly = disabled;
  for (const id of [
    'dmh-blacklist-save',
    'dmh-blacklist-cancel',
    'dmh-blacklist-editor-close',
    'dmh-blacklist-new-rule',
    'dmh-blacklist-remove-cancel',
    'dmh-blacklist-remove-confirm-button',
    'dmh-viewer-blacklist',
    'dmh-viewer-blacklist-confirm',
  ]) {
    const control = byId<HTMLInputElement | HTMLButtonElement>(id);
    if (control) control.disabled = disabled;
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
    replaceViewerHistoryWithMasonry(state);
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
  const viewerPostId = isViewerOpen() ? state.posts[state.viewerIndex]?.id : undefined;
  history.replaceState(
    createMasonryHistoryState(state, viewerPostId), '', url.toString(),
  );
  cacheCurrentSearch(state);
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
  beginSearch(state, state.tags, page);
  void loadNextPage(state);
}

function initializeMasonryHistory(state: AppState): MasonryHistoryEntry | null {
  const existing = getMasonryHistoryEntry(history.state);
  if (existing) {
    state.historyKey = existing.key;
    state.searchStartPage = existing.startPage;
    state.loadedPage = existing.loadedPage;
    if (existing.viewerPostId && Number.isInteger(existing.viewerPage)) {
      state.page = Math.max(1, existing.viewerPage || 1);
    }
    return existing;
  }

  const currentUrl = new URL(state.adapter.getPostsPageUrl(state.tags, state.page));
  const exitUrl = new URL(currentUrl);
  exitUrl.searchParams.set('dmh', '0');
  const baseState =
    history.state && typeof history.state === 'object' ? history.state : {};
  history.replaceState({ ...baseState, dmhBase: true }, '', exitUrl.toString());
  state.historyKey = nextHistoryKey(state);
  history.pushState(createMasonryHistoryState(state), '', currentUrl.toString());
  return null;
}

function beginSearch(state: AppState, tags: string, page = 1): void {
  cacheCurrentSearch(state);
  resetSearch(state, tags, page);
  state.searchStartPage = page;
  state.loadedPage = page - 1;
  state.historyKey = nextHistoryKey(state);
  history.pushState(
    createMasonryHistoryState(state),
    '',
    state.adapter.getPostsPageUrl(state.tags, page),
  );
}

function restartCurrentSearch(state: AppState): void {
  resetSearch(state, state.tags);
  state.searchStartPage = 1;
  state.loadedPage = 0;
  state.searchSnapshots.delete(state.historyKey);
  history.replaceState(
    createMasonryHistoryState(state),
    '',
    state.adapter.getPostsPageUrl(state.tags, 1),
  );
}

function handleHistoryNavigation(state: AppState, event: PopStateEvent): void {
  const target = getMasonryHistoryEntry(event.state);
  if (!state.started) {
    if (target) location.reload();
    return;
  }
  if (!target) {
    if (isMasonryBaseState(event.state)) location.reload();
    return;
  }

  cacheCurrentSearch(state);
  closeViewer(state);
  closeAutocomplete(state);
  const snapshot = state.searchSnapshots.get(target.key);
  state.historyKey = target.key;
  if (!snapshot) {
    const fallbackPage = Math.max(1, target.viewerPage || target.loadedPage || target.startPage);
    resetSearch(state, target.tags, fallbackPage);
    state.searchStartPage = fallbackPage;
    state.loadedPage = fallbackPage - 1;
    window.scrollTo({ top: 0, behavior: 'instant' });
    void loadNextPage(state).then(() => {
      restoreViewerFromHistory(state, target.viewerPostId);
    });
    return;
  }

  state.requestToken += 1;
  state.loading = false;
  state.tags = snapshot.tags;
  state.searchStartPage = snapshot.startPage;
  state.loadedPage = snapshot.loadedPage;
  state.page = snapshot.nextPage;
  state.posts = [...snapshot.posts];
  state.sourcePosts = [...snapshot.sourcePosts];
  state.postPages = new Map(snapshot.postPages);
  state.done = snapshot.done;
  state.viewerIndex = -1;
  const tagsInput = byId<HTMLInputElement>('dmh-tags');
  if (tagsInput) tagsInput.value = state.tags;
  setPageInputValue(state.loadedPage || state.searchStartPage);
  const grid = byId('dmh-grid');
  if (grid) {
    grid.innerHTML = '';
    grid.style.height = '0px';
  }
  renderPosts(state, state.posts, 0, (index) => showViewer(state, index));
  layoutMasonry(state);
  scheduleScrollControlsUpdate(state);
  setMasonryLoading(false);
  setText('dmh-status', `已加载 ${state.posts.length} 张`);
  setText(
    'dmh-message',
    state.done
      ? state.posts.length ? '已经到底了，没有更多图片。' : '没有找到符合条件的图片。'
      : '',
  );
  window.scrollTo({ top: snapshot.scrollY, behavior: 'instant' });
  restoreViewerFromHistory(state, target.viewerPostId);
}

function cacheCurrentSearch(state: AppState): void {
  if (!state.historyKey) return;
  state.searchSnapshots.delete(state.historyKey);
  state.searchSnapshots.set(state.historyKey, {
    tags: state.tags,
    startPage: state.searchStartPage,
    loadedPage: state.loadedPage,
    nextPage: state.page,
    posts: [...state.posts],
    sourcePosts: [...state.sourcePosts],
    done: state.done,
    postPages: new Map(state.postPages),
    scrollY: window.scrollY,
  });
  while (state.searchSnapshots.size > MAX_SEARCH_SNAPSHOTS) {
    const oldestKey = state.searchSnapshots.keys().next().value as string | undefined;
    if (!oldestKey) break;
    state.searchSnapshots.delete(oldestKey);
  }
}

function createMasonryHistoryState(
  state: AppState,
  viewerPostId?: string,
  viewerPage = viewerPostId ? state.postPages.get(viewerPostId) : undefined,
): MasonryHistoryState {
  return {
    dmh: {
      key: state.historyKey,
      tags: state.tags,
      startPage: state.searchStartPage,
      loadedPage: state.loadedPage,
      viewerPostId,
      viewerPage,
    },
  };
}


function syncViewerHistory(state: AppState, postId: string): void {
  const current = getMasonryHistoryEntry(history.state);
  const viewerPage = state.postPages.get(postId) ?? current?.viewerPage;
  const nextState = createMasonryHistoryState(
    state, postId, viewerPage,
  );
  if (current?.viewerPostId && current.key === state.historyKey) {
    history.replaceState(nextState, '', location.href);
    return;
  }
  cacheCurrentSearch(state);
  history.pushState(nextState, '', location.href);
}

function closeViewerFromHistory(state: AppState): void {
  const current = getMasonryHistoryEntry(history.state);
  if (current?.viewerPostId && current.key === state.historyKey) {
    history.back();
    return;
  }
  closeViewer(state);
}

function replaceViewerHistoryWithMasonry(state: AppState): void {
  const current = getMasonryHistoryEntry(history.state);
  if (!current?.viewerPostId || current.key !== state.historyKey) return;
  history.replaceState(createMasonryHistoryState(state), '', location.href);
}

function restoreViewerFromHistory(state: AppState, postId?: string): boolean {
  if (!postId) return false;
  const index = state.posts.findIndex((post) => post.id === postId);
  if (index < 0) return false;
  showViewer(state, index);
  return true;
}
function getMasonryHistoryEntry(value: unknown): MasonryHistoryEntry | null {
  if (!value || typeof value !== 'object') return null;
  const entry = (value as MasonryHistoryState).dmh;
  return entry && typeof entry.key === 'string' && typeof entry.tags === 'string'
    ? entry
    : null;
}

function isMasonryBaseState(value: unknown): boolean {
  return Boolean(value && typeof value === 'object' && (value as MasonryHistoryState).dmhBase);
}

function nextHistoryKey(state: AppState): string {
  state.historySequence += 1;
  return `${Date.now()}-${state.historySequence}`;
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

function exitMasonry(): void {
  const url = new URL(location.href);
  url.searchParams.set('dmh', '0');
  location.assign(url.toString());
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
  closeBlacklistAutocomplete(state);
  const input = byId<HTMLTextAreaElement>('dmh-blacklist-rules');
  if (input) input.value = state.blacklistText;
  const newRule = byId<HTMLInputElement>('dmh-blacklist-new-rule');
  if (newRule) newRule.value = '';
  renderBlacklistDraftRules();
  const status = byId('dmh-blacklist-status');
  if (!status) return;
  status.classList.remove('dmh-error');
  status.textContent = !state.blacklistAvailable
    ? '未能读取原站黑名单，请刷新原站后重试'
    : currentUserId() ? '' : '登录 Danbooru 后可修改';
}

function renderBlacklistDraftRules(): void {
  const input = byId<HTMLTextAreaElement>('dmh-blacklist-rules');
  const list = byId('dmh-blacklist-rule-list');
  if (input && list) list.innerHTML = renderBlacklistRuleRows(input.value);
  const confirmation = byId('dmh-blacklist-remove-confirm');
  if (confirmation) confirmation.hidden = true;
  setText('dmh-blacklist-remove-rule', '');
}

function addBlacklistDraftRule(): void {
  const input = byId<HTMLTextAreaElement>('dmh-blacklist-rules');
  const newRule = byId<HTMLInputElement>('dmh-blacklist-new-rule');
  if (!input || !newRule) return;
  const nextText = addBlacklistRuleSource(input.value, newRule.value);
  if (nextText === normalizeBlacklistText(input.value)) {
    setText('dmh-blacklist-status', newRule.value.trim() ? '规则已存在' : '请输入规则');
    return;
  }
  input.value = nextText;
  newRule.value = '';
  renderBlacklistDraftRules();
  markBlacklistDraftChanged();
  newRule.focus();
}

function removeBlacklistDraftRule(index: number): void {
  const input = byId<HTMLTextAreaElement>('dmh-blacklist-rules');
  if (!input || !Number.isInteger(index)) return;
  input.value = removeBlacklistRuleSource(input.value, index);
  renderBlacklistDraftRules();
  markBlacklistDraftChanged();
}

function markBlacklistDraftChanged(): void {
  const status = byId('dmh-blacklist-status');
  status?.classList.remove('dmh-error');
  if (status) status.textContent = '尚未保存';
}
