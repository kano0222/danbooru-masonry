import type { Post } from '../adapters/types';
import type { AppState } from './state';
import { escapeAttr, escapeHtml } from '../utils/escape';
import { byId, openInTab } from '../utils/dom';
import { isHttpUrl } from '../utils/url';

export function showViewer(state: AppState, index: number): void {
  if (index < 0 || index >= state.posts.length) return;
  const post = state.posts[index];
  state.viewerIndex = index;
  const viewer = byId('dmh-viewer');
  const img = byId<HTMLImageElement>('dmh-viewer-img');
  const video = byId<HTMLVideoElement>('dmh-viewer-video');
  const loading = byId('dmh-viewer-loading');
  const info = byId('dmh-viewer-info');
  if (!viewer || !img || !video || !loading || !info) return;

  setZoomMode(state, false);
  if (post.isVideo) {
    hideImageLoading(loading);
    img.hidden = true;
    img.src = '';
    video.hidden = false;
    video.poster = post.previewUrl || '';
    video.src = post.viewerUrl || post.fileUrl || '';
    video.load();
    void video.play().catch((error) => console.warn('[Danbooru Masonry] video autoplay failed:', error));
  } else {
    video.pause();
    video.hidden = true;
    video.removeAttribute('src');
    video.removeAttribute('poster');
    video.load();
    const imageUrl = post.viewerUrl || post.fileUrl || post.previewUrl || '';
    img.hidden = true;
    showImageLoading(loading);
    const showIfCurrentImage = () => {
      if (img.src !== imageUrl && img.currentSrc !== imageUrl) return;
      if (!img.naturalWidth) {
        showImageError(loading);
        return;
      }
      img.hidden = false;
      hideImageLoading(loading);
    };
    const showErrorIfCurrentImage = () => {
      if (img.src !== imageUrl && img.currentSrc !== imageUrl) return;
      img.hidden = true;
      showImageError(loading);
    };
    img.onload = showIfCurrentImage;
    img.onerror = showErrorIfCurrentImage;
    img.src = imageUrl;
    if (img.complete && img.naturalWidth) window.requestAnimationFrame(showIfCurrentImage);
  }

  info.innerHTML = renderViewerInfo(state, post);
  if (post.favorited) {
    state.favoritePostIds.add(post.id);
  } else {
    state.favoritePostIds.delete(post.id);
  }
  updateFavoriteButton(state, post);
  void refreshFavoriteState(state, post);
  setButtonEnabled('dmh-open-source', isHttpUrl(post.source));
  updateButtonTooltip('dmh-open-source', `来源 ${post.source || ''}`.trim());
  updateZoomMode(state);
  updateViewerChromeVisibility(state);
  viewer.classList.add('dmh-open');
  viewer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('dmh-no-scroll');
}

export function closeViewer(state: AppState): void {
  const viewer = byId('dmh-viewer');
  const img = byId<HTMLImageElement>('dmh-viewer-img');
  const video = byId<HTMLVideoElement>('dmh-viewer-video');
  const loading = byId('dmh-viewer-loading');
  if (!viewer || !img || !video || !loading) return;
  viewer.classList.remove('dmh-open');
  viewer.setAttribute('aria-hidden', 'true');
  setZoomMode(state, false);
  hideImageLoading(loading);
  img.onload = null;
  img.onerror = null;
  img.src = '';
  video.pause();
  video.hidden = true;
  video.removeAttribute('src');
  video.removeAttribute('poster');
  video.load();
  document.body.classList.remove('dmh-no-scroll');
}

export async function favoriteCurrentPost(state: AppState): Promise<void> {
  const post = state.posts[state.viewerIndex];
  if (!post || state.favoriteLoading) return;
  state.favoriteLoading = true;
  const isFavorited = state.favoritePostIds.has(post.id);
  updateFavoriteButton(state, post, isFavorited ? '取消收藏中...' : '收藏中...');
  try {
    if (isFavorited) {
      await state.adapter.deleteFavorite(post.id);
      state.favoritePostIds.delete(post.id);
      post.favorited = false;
    } else {
      await state.adapter.createFavorite(post.id);
      state.favoritePostIds.add(post.id);
      post.favorited = true;
    }
    updateFavoriteButton(state, post);
  } catch (error) {
    console.warn('[Danbooru Masonry] favorite toggle failed:', error);
    const errorMessage = error instanceof Error ? error.message : String(error || '');
    const message = `\u6536\u85cf\u5931\u8d25: ${errorMessage || '\u672a\u68c0\u6d4b\u5230danbooru\u7684\u767b\u9646\u72b6\u6001'}`;
    showSnackbar(message);
    updateFavoriteButton(state, post, message);
    window.setTimeout(() => {
      if (state.posts[state.viewerIndex]?.id === post.id) updateFavoriteButton(state, post);
    }, 1600);
  } finally {
    state.favoriteLoading = false;
    if (state.posts[state.viewerIndex]?.id === post.id) updateFavoriteButton(state, post);
  }
}

export function openCurrentPost(state: AppState): void {
  const post = state.posts[state.viewerIndex];
  if (post) openInTab(state.adapter.getPostUrl(post.id, state.tags));
}

export function openCurrentSource(state: AppState): void {
  const post = state.posts[state.viewerIndex];
  if (post?.source && isHttpUrl(post.source)) openInTab(post.source);
}

export function onViewerMediaClick(state: AppState, event: Event): void {
  event.stopPropagation();
  if (state.zoomMoved) {
    state.zoomMoved = false;
    return;
  }
  if (state.zoomMode) return;
  state.viewerChromeHidden = !state.viewerChromeHidden;
  updateViewerChromeVisibility(state);
}

export function toggleZoomMode(state: AppState, event?: Event): void {
  event?.stopPropagation();
  setZoomMode(state, !state.zoomMode);
}

export function setZoomMode(state: AppState, enabled: boolean): void {
  state.zoomMode = enabled;
  state.zoomScale = 1;
  state.zoomX = 0;
  state.zoomY = 0;
  state.zoomDragging = false;
  state.zoomMoved = false;
  updateZoomMode(state);
}

export function onViewerImageDoubleClick(state: AppState, event: Event): void {
  event.stopPropagation();
  if (state.zoomMode) setZoomMode(state, true);
}

export function onZoomPointerDown(state: AppState, event: PointerEvent): void {
  if (!state.zoomMode || event.button !== 0) return;
  event.preventDefault();
  event.stopPropagation();
  state.zoomDragging = true;
  state.zoomMoved = false;
  state.zoomStartX = event.clientX;
  state.zoomStartY = event.clientY;
  state.zoomBaseX = state.zoomX;
  state.zoomBaseY = state.zoomY;
  (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
  updateZoomMode(state);
}

export function onZoomPointerMove(state: AppState, event: PointerEvent): void {
  if (!state.zoomMode || !state.zoomDragging) return;
  event.preventDefault();
  const dx = event.clientX - state.zoomStartX;
  const dy = event.clientY - state.zoomStartY;
  if (Math.abs(dx) > 2 || Math.abs(dy) > 2) state.zoomMoved = true;
  state.zoomX = state.zoomBaseX + dx;
  state.zoomY = state.zoomBaseY + dy;
  updateZoomTransform(state);
}

export function onZoomPointerEnd(state: AppState, event: PointerEvent): void {
  if (!state.zoomDragging) return;
  state.zoomDragging = false;
  (event.currentTarget as HTMLElement).releasePointerCapture?.(event.pointerId);
  updateZoomMode(state);
}

export function onViewerWheel(state: AppState, event: WheelEvent): void {
  const isOpen = byId('dmh-viewer')?.classList.contains('dmh-open');
  if (!isOpen || !event.deltaY) return;
  event.preventDefault();
  event.stopPropagation();
  if (state.zoomMode) {
    zoomViewerImage(state, event);
    return;
  }
  const now = Date.now();
  if (now - state.lastViewerWheelAt < 300) return;
  state.lastViewerWheelAt = now;
  showViewer(state, state.viewerIndex + (event.deltaY > 0 ? 1 : -1));
}

export function onViewerKeydown(state: AppState, event: KeyboardEvent): void {
  const isOpen = byId('dmh-viewer')?.classList.contains('dmh-open');
  if (!isOpen) return;
  if (event.key === 'Escape') closeViewer(state);
  if (event.key === 'ArrowLeft') showViewer(state, state.viewerIndex - 1);
  if (event.key === 'ArrowRight') showViewer(state, state.viewerIndex + 1);
  if (event.key.toLowerCase() === 'e' && !state.posts[state.viewerIndex]?.isVideo) toggleZoomMode(state);
}

function updateViewerChromeVisibility(state: AppState): void {
  byId('dmh-viewer')?.classList.toggle('dmh-chrome-hidden', state.viewerChromeHidden);
}

function updateZoomMode(state: AppState): void {
  const viewer = byId('dmh-viewer');
  const img = byId<HTMLImageElement>('dmh-viewer-img');
  const button = byId<HTMLButtonElement>('dmh-zoom-toggle');
  viewer?.classList.toggle('dmh-zoom-mode', state.zoomMode);
  if (img) {
    img.draggable = !state.zoomMode;
    img.classList.toggle('dmh-dragging', state.zoomDragging);
  }
  if (button) {
    button.classList.toggle('dmh-active', state.zoomMode);
    updateButtonTooltip('dmh-zoom-toggle', state.zoomMode ? '退出原图模式' : '查看大图');
    button.hidden = state.posts[state.viewerIndex]?.isVideo || false;
  }
  updateZoomTransform(state);
}

function updateZoomTransform(state: AppState): void {
  const img = byId<HTMLImageElement>('dmh-viewer-img');
  if (!img) return;
  img.style.transform = state.zoomMode
    ? `translate(${state.zoomX}px, ${state.zoomY}px) scale(${state.zoomScale})`
    : '';
}

function zoomViewerImage(state: AppState, event: WheelEvent): void {
  const oldScale = state.zoomScale;
  const nextScale = Math.min(5, Math.max(0.25, oldScale * (event.deltaY < 0 ? 1.12 : 0.88)));
  if (nextScale === oldScale) return;
  const img = byId<HTMLImageElement>('dmh-viewer-img');
  if (!img) return;
  const rect = img.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const factor = nextScale / oldScale - 1;
  state.zoomX -= (event.clientX - centerX) * factor;
  state.zoomY -= (event.clientY - centerY) * factor;
  state.zoomScale = nextScale;
  updateZoomTransform(state);
}

function updateFavoriteButton(state: AppState, post: Post, title = '收藏'): void {
  const button = byId<HTMLButtonElement>('dmh-favorite');
  if (!button) return;
  const favorited = state.favoritePostIds.has(post.id) || post.favorited;
  button.classList.toggle('dmh-favorited', favorited);
  button.disabled = state.favoriteLoading;
  const label = normalizeFavoriteLabel(title, favorited);
  button.dataset.dmhTooltip = label;
  button.setAttribute('aria-label', label);
  button.removeAttribute('title');
}

async function refreshFavoriteState(state: AppState, post: Post): Promise<void> {
  if (!state.adapter.isFavorited) return;
  try {
    const favorited = await state.adapter.isFavorited(post.id);
    if (state.posts[state.viewerIndex]?.id !== post.id) return;
    post.favorited = favorited;
    if (favorited) {
      state.favoritePostIds.add(post.id);
    } else {
      state.favoritePostIds.delete(post.id);
    }
    updateFavoriteButton(state, post);
  } catch (error) {
    console.warn('[Danbooru Masonry] favorite state check failed:', error);
  }
}

function setButtonEnabled(id: string, enabled: boolean): void {
  const button = byId<HTMLButtonElement>(id);
  if (!button) return;
  button.hidden = !enabled;
  button.disabled = !enabled;
}

function updateButtonTooltip(id: string, label: string): void {
  const button = byId<HTMLButtonElement>(id);
  if (!button) return;
  button.removeAttribute('title');
  button.dataset.dmhTooltip = label;
  button.setAttribute('aria-label', label);
}

function normalizeFavoriteLabel(title: string, favorited: boolean): string {
  if (title.includes('失败')) return title;
  if (title.includes('中')) return title;
  return favorited ? '取消收藏' : '收藏';
}

function showSnackbar(message: string): void {
  const snackbar = byId('dmh-snackbar');
  if (!snackbar) return;
  snackbar.textContent = message;
  snackbar.classList.add('dmh-open');
  window.clearTimeout(Number(snackbar.dataset.timer || 0));
  const timer = window.setTimeout(() => snackbar.classList.remove('dmh-open'), 2600);
  snackbar.dataset.timer = String(timer);
}

function showImageLoading(loading: HTMLElement): void {
  loading.hidden = false;
  loading.setAttribute('aria-hidden', 'false');
  byId('dmh-viewer-progress')?.removeAttribute('hidden');
  byId('dmh-viewer-error')?.setAttribute('hidden', '');
}

function hideImageLoading(loading: HTMLElement): void {
  loading.hidden = true;
  loading.setAttribute('aria-hidden', 'true');
  byId('dmh-viewer-progress')?.removeAttribute('hidden');
  byId('dmh-viewer-error')?.setAttribute('hidden', '');
}

function showImageError(loading: HTMLElement): void {
  loading.hidden = false;
  loading.setAttribute('aria-hidden', 'false');
  byId('dmh-viewer-progress')?.setAttribute('hidden', '');
  byId('dmh-viewer-error')?.removeAttribute('hidden');
}

function renderViewerInfo(state: AppState, post: Post): string {
  const pills = [
    `<a class="dmh-info-pill dmh-pill-id" href="${escapeAttr(state.adapter.getPostUrl(post.id, state.tags))}" target="_blank" rel="noreferrer">#${escapeHtml(post.id)}</a>`,
  ];
  const labels = { artist: '画师', copyright: '版权', character: '角色' };
  for (const type of ['artist', 'copyright', 'character'] as const) {
    for (const tag of post.tagGroups[type]) {
      const translated = state.translations.translate(tag);
      const label = `[ ${labels[type]} ] ${tag}${translated ? ` [ ${translated} ]` : ''}`;
      pills.push(
        `<a class="dmh-info-pill dmh-pill-${escapeAttr(type)}" href="${escapeAttr(state.adapter.getPostsPageUrl(tag))}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a>`,
      );
    }
  }
  return pills.join('');
}
