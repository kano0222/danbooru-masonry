import type { Post } from '../src/adapters/types';
import { DanbooruAdapter } from '../src/adapters/danbooru';
import { CARD_SIZE_OPTIONS, layoutMasonry, shouldLoadMore } from '../src/core/masonry';
import { createState } from '../src/core/state';
import {
  closeViewer,
  onViewerImageDoubleClick,
  onViewerMediaClick,
  onViewerWheel,
  onZoomPointerDown,
  onZoomPointerEnd,
  onZoomPointerMove,
  openCurrentSource,
  showAdjacentViewerPost,
  showViewer,
  toggleZoomMode,
} from '../src/core/viewer';
import { installShortcuts } from '../src/core/shortcuts';
import { renderPosts } from '../src/ui/cards';
import { renderShell } from '../src/ui/shell';
import { installStyles } from '../src/ui/styles';
import { applyTheme, getNextThemeMode } from '../src/ui/theme';

const previewImages = [
  {
    file: '01.jpg',
    width: 2048,
    height: 1044,
    author: '白石定規',
    handle: 'jojojojougi',
    statusId: '968691347270991873',
  },
  {
    file: '02.jpg',
    width: 1414,
    height: 1000,
    author: 'Hiten',
    handle: 'HitenKei',
    statusId: '848982747645267968',
  },
  {
    file: '03.jpg',
    width: 2048,
    height: 1348,
    author: 'Hiten',
    handle: 'HitenKei',
    statusId: '1065892245218373633',
  },
  {
    file: '04.jpg',
    width: 1414,
    height: 1000,
    author: 'Hiten',
    handle: 'HitenKei',
    statusId: '1328675184757202945',
  },
  {
    file: '05.jpg',
    width: 849,
    height: 1200,
    author: 'Hiten',
    handle: 'HitenKei',
    statusId: '1473235665156702209',
  },
  {
    file: '06.jpg',
    width: 1200,
    height: 1055,
    author: 'Hiten',
    handle: 'HitenKei',
    statusId: '1591051073133113346',
  },
  {
    file: '07.jpg',
    width: 1500,
    height: 851,
    author: 'アシマ',
    handle: 'roro046',
    statusId: '1867527928780914897',
  },
  {
    file: '08.jpg',
    width: 1500,
    height: 844,
    author: 'アシマ',
    handle: 'roro046',
    statusId: '1952687063825842491',
  },
  {
    file: '09.jpg',
    width: 1920,
    height: 1080,
    author: 'アシマ',
    handle: 'roro046',
    statusId: '2075888896697913466',
  },
  {
    file: '10.jpg',
    width: 3541,
    height: 2508,
    author: 'かみゆう',
    handle: 'KYamiuu49',
    statusId: '2094077692086042729',
  },
] as const;
const PAGE_SIZE = 20;

const state = createState(new DanbooruAdapter());
let visiblePage = state.page;
state.started = true;
state.tags = 'landscape 1girl';
state.cardWidth = CARD_SIZE_OPTIONS.find((option) => option.key === 'big')?.value ?? state.cardWidth;
state.loadMore = loadNextPreviewPage;

applyTheme(state.themeMode);
installStyles();
renderShell(state);
const viewerInfo = document.getElementById('dmh-viewer-info');
if (viewerInfo) viewerInfo.style.display = 'none';
const grid = document.getElementById('dmh-grid');
void loadNextPreviewPage();
bindPreviewControls();

if (grid) new ResizeObserver(() => layoutMasonry(state)).observe(grid);

async function loadNextPreviewPage(): Promise<void> {
  if (state.loading) return;
  state.loading = true;
  try {
    const page = state.page;
    const startIndex = state.posts.length;
    const images = Array.from(
      { length: PAGE_SIZE },
      (_, index) => previewImages[index % previewImages.length],
    );
    for (let index = images.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [images[index], images[randomIndex]] = [images[randomIndex], images[index]];
    }
    const posts = images.map((image, index) =>
      createPreviewPost((page - 1) * PAGE_SIZE + index, image),
    );
    posts.forEach((post) => state.favoriteStateCache.set(post.id, false));
    state.posts.push(...posts);
    state.sourcePosts.push(...posts);
    renderPosts(state, posts, startIndex, (index) => showViewer(state, index));
    layoutMasonry(state);
    visiblePage = page;
    state.page = page + 1;
    const pageInput = document.getElementById('dmh-page') as HTMLInputElement | null;
    if (pageInput) pageInput.value = String(page);
    updatePageParam(page);
    setStatus(`已加载 ${state.posts.length} 张 · 静态预览`);
  } finally {
    state.loading = false;
  }
}

function loadPreviewPage(page: number): void {
  closeViewer(state);
  state.posts = [];
  state.sourcePosts = [];
  state.viewerIndex = -1;
  state.page = page;
  if (grid) {
    grid.replaceChildren();
    grid.style.height = '0px';
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
  void loadNextPreviewPage();
}

function updatePageParam(page: number): void {
  if (location.protocol === 'file:') return;
  const url = new URL(location.href);
  url.searchParams.set('page', String(page));
  history.replaceState(null, '', url);
}

function createPreviewPost(index: number, image: (typeof previewImages)[number]): Post {
  const id = String(9000000 + index + 1);
  const imageUrl = `./image/${image.file}`;
  const source = `https://x.com/${image.handle}/status/${image.statusId}`;
  return {
    id,
    raw: null,
    fileUrl: imageUrl,
    largeUrl: imageUrl,
    sampleUrl: imageUrl,
    previewUrl: imageUrl,
    thumbnailUrl: imageUrl,
    playbackUrl: '',
    listUrl: imageUrl,
    viewerUrl: imageUrl,
    width: image.width,
    height: image.height,
    aspectRatio: image.width / image.height,
    tags: [],
    tagGroups: {
      artist: [],
      copyright: [],
      character: [],
      general: [],
      meta: [],
    },
    rating: 'g',
    score: 0,
    source,
    fileExt: 'jpg',
    isVideo: false,
    isUgoira: false,
    favorited: false,
    available: true,
  };
}

function bindPreviewControls(): void {
  const settingsButton = document.getElementById('dmh-settings-toggle');
  const settingsPanel = document.getElementById('dmh-settings-panel');
  const settingsOverlay = document.getElementById('dmh-settings-overlay');

  const setSettingsOpen = (open: boolean) => {
    settingsPanel?.classList.toggle('dmh-open', open);
    settingsOverlay?.classList.toggle('dmh-open', open);
    settingsPanel?.setAttribute('aria-hidden', String(!open));
    settingsOverlay?.setAttribute('aria-hidden', String(!open));
    settingsButton?.setAttribute('aria-expanded', String(open));
    document.documentElement.classList.toggle('dmh-no-scroll', open);
  };

  settingsButton?.addEventListener('click', () => setSettingsOpen(true));
  document
    .getElementById('dmh-settings-close')
    ?.addEventListener('click', () => setSettingsOpen(false));
  settingsOverlay?.addEventListener('click', () => setSettingsOpen(false));
  bindPreviewViewer();

  const pageInput = document.getElementById('dmh-page') as HTMLInputElement | null;
  pageInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const page = Number(pageInput.value);
      loadPreviewPage(Number.isFinite(page) && page > 0 ? Math.floor(page) : 1);
      return;
    }
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    const page = Math.max(1, visiblePage + (event.key === 'ArrowUp' ? -1 : 1));
    loadPreviewPage(page);
  });
  pageInput?.addEventListener('input', () => {
    pageInput.value = pageInput.value.replace(/\D+/g, '') || '1';
  });

  document.getElementById('dmh-card-size')?.addEventListener('change', (event) => {
    const key = (event.currentTarget as HTMLSelectElement).value;
    const option = CARD_SIZE_OPTIONS.find((item) => item.key === key);
    const app = document.getElementById('dmh-app');
    if (!option || !app) return;
    state.cardWidth = option.value;
    app.dataset.cardSize = option.key;
    layoutMasonry(state);
  });

  document.getElementById('dmh-theme-toggle')?.addEventListener('click', () => {
    state.themeMode = getNextThemeMode(state.themeMode);
    applyTheme(state.themeMode);
  });

  bindDataToggle('dmh-show-thumbnail-buttons', 'showThumbnailButtons');
  bindDataToggle('dmh-show-thumbnail-info', 'showThumbnailInfo');

  document.getElementById('dmh-show-scrollbar')?.addEventListener('change', (event) => {
    const checked = (event.currentTarget as HTMLInputElement).checked;
    document.getElementById('dmh-scrollbar')?.toggleAttribute('hidden', !checked);
  });
  document.getElementById('dmh-show-back-to-top')?.addEventListener('change', (event) => {
    const checked = (event.currentTarget as HTMLInputElement).checked;
    document.getElementById('dmh-back-to-top')?.toggleAttribute('hidden', !checked);
  });

  document.getElementById('dmh-search')?.addEventListener('submit', (event) => {
    event.preventDefault();
    setStatus('静态预览不发起网络搜索');
  });
  for (const id of ['dmh-title-exit', 'dmh-exit']) {
    document.getElementById(id)?.addEventListener('click', () => setStatus('当前为静态预览'));
  }

  grid?.addEventListener(
    'click',
    (event) => {
      const button = (event.target as Element).closest<HTMLButtonElement>('[data-card-action]');
      if (button?.dataset.cardAction !== 'download') return;
      event.preventDefault();
      event.stopImmediatePropagation();
      setStatus('静态预览不提供下载');
    },
    true,
  );

  const backToTop = document.getElementById('dmh-back-to-top');
  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    backToTop?.classList.toggle('dmh-visible', window.scrollY > 320);
    const scrollingDown = window.scrollY > lastScrollY;
    lastScrollY = window.scrollY;
    if (scrollingDown && !isPreviewOverlayOpen() && shouldLoadMore()) void state.loadMore?.();
  }, { passive: true });
  window.addEventListener('wheel', (event) => {
    if (event.deltaY > 0 && !isPreviewOverlayOpen() && shouldLoadMore()) void state.loadMore?.();
  }, { passive: true });
  backToTop?.classList.toggle('dmh-visible', window.scrollY > 320);
}

function isPreviewOverlayOpen(): boolean {
  return !!document.querySelector('#dmh-viewer.dmh-open, #dmh-settings-panel.dmh-open');
}

function bindPreviewViewer(): void {
  document.getElementById('dmh-viewer')?.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).id === 'dmh-viewer') closeViewer(state);
  });
  document
    .getElementById('dmh-viewer')
    ?.addEventListener('wheel', (event) => onViewerWheel(state, event as WheelEvent), {
      passive: false,
    });
  document
    .getElementById('dmh-viewer-img')
    ?.addEventListener('click', (event) => onViewerMediaClick(state, event));
  document
    .getElementById('dmh-viewer-img')
    ?.addEventListener('dblclick', (event) => onViewerImageDoubleClick(state, event));
  document
    .getElementById('dmh-viewer-img')
    ?.addEventListener('pointerdown', (event) => onZoomPointerDown(state, event));
  document
    .getElementById('dmh-viewer-img')
    ?.addEventListener('pointermove', (event) => onZoomPointerMove(state, event));
  document
    .getElementById('dmh-viewer-img')
    ?.addEventListener('pointerup', (event) => onZoomPointerEnd(state, event));
  document
    .getElementById('dmh-viewer-img')
    ?.addEventListener('pointercancel', (event) => onZoomPointerEnd(state, event));
  document.getElementById('dmh-viewer-img')?.addEventListener('dragstart', (event) => {
    if (state.zoomMode) event.preventDefault();
  });
  document.getElementById('dmh-close')?.addEventListener('click', () => closeViewer(state));
  document
    .getElementById('dmh-prev')
    ?.addEventListener('click', () => void showAdjacentViewerPost(state, -1));
  document
    .getElementById('dmh-next')
    ?.addEventListener('click', () => void showAdjacentViewerPost(state, 1));
  document
    .getElementById('dmh-zoom-toggle')
    ?.addEventListener('click', (event) => toggleZoomMode(state, event));
  document
    .getElementById('dmh-open-source')
    ?.addEventListener('click', () => openCurrentSource(state));
  for (const id of ['dmh-favorite', 'dmh-open-post', 'dmh-download']) {
    document
      .getElementById(id)
      ?.addEventListener('click', () => showPreviewMessage('静态预览不提供此操作'));
  }
  installShortcuts(state);
}

function bindDataToggle(
  inputId: string,
  dataKey: 'showThumbnailButtons' | 'showThumbnailInfo',
): void {
  document.getElementById(inputId)?.addEventListener('change', (event) => {
    const checked = (event.currentTarget as HTMLInputElement).checked;
    const app = document.getElementById('dmh-app');
    if (app) app.dataset[dataKey] = String(checked);
  });
}

function setStatus(message: string): void {
  const status = document.getElementById('dmh-status');
  if (status) status.textContent = message;
}

function showPreviewMessage(message: string): void {
  const snackbar = document.getElementById('dmh-snackbar');
  if (!snackbar) return;
  snackbar.textContent = message;
  snackbar.classList.add('dmh-open');
  window.setTimeout(() => snackbar.classList.remove('dmh-open'), 2000);
}
