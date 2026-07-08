import type { Post } from '../adapters/types';
import type { AppState } from './state';
import type { DanbooruRawPost } from '../types/danbooru';
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
    const placeholderUrl = getViewerPlaceholderUrl(post, imageUrl);
    if (placeholderUrl) {
      img.onload = null;
      img.onerror = null;
      img.src = placeholderUrl;
      img.hidden = false;
    } else {
      img.hidden = true;
      img.removeAttribute('src');
    }
    showImageLoading(loading);
    const fullImage = new Image();
    const showIfCurrentImage = () => {
      if (state.posts[state.viewerIndex]?.id !== post.id) return;
      if (!fullImage.naturalWidth) {
        showImageError(loading);
        return;
      }
      img.onload = null;
      img.onerror = null;
      img.src = imageUrl;
      img.hidden = false;
      hideImageLoading(loading);
    };
    const showErrorIfCurrentImage = () => {
      if (state.posts[state.viewerIndex]?.id !== post.id) return;
      if (!placeholderUrl) img.hidden = true;
      showImageError(loading);
    };
    fullImage.onload = showIfCurrentImage;
    fullImage.onerror = showErrorIfCurrentImage;
    fullImage.src = imageUrl;
    if (fullImage.complete && fullImage.naturalWidth) window.requestAnimationFrame(showIfCurrentImage);
  }

  info.innerHTML = renderViewerInfo(state, post);
  const cachedFavoriteState = state.favoriteStateCache.get(post.id);
  if (cachedFavoriteState !== undefined) {
    applyFavoriteState(state, post, cachedFavoriteState);
  } else if (post.favorited) {
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

export async function showAdjacentViewerPost(state: AppState, direction: 1 | -1): Promise<void> {
  const nextIndex = state.viewerIndex + direction;
  if (nextIndex >= 0 && nextIndex < state.posts.length) {
    showViewer(state, nextIndex);
    return;
  }
  if (direction < 0 || nextIndex < 0 || state.done || state.loading || !state.loadMore) return;
  const previousLength = state.posts.length;
  await state.loadMore();
  if (state.posts.length > previousLength && nextIndex < state.posts.length) {
    showViewer(state, nextIndex);
  }
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
      state.favoriteStateCache.set(post.id, false);
      post.favorited = false;
    } else {
      await state.adapter.createFavorite(post.id);
      state.favoritePostIds.add(post.id);
      state.favoriteStateCache.set(post.id, true);
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

export function downloadCurrentPost(state: AppState): void {
  const post = state.posts[state.viewerIndex];
  const url = post?.fileUrl || post?.viewerUrl || '';
  if (!post || !isHttpUrl(url)) return;
  const name = buildDownloadFilename(post);
  try {
    GM_download({
      url,
      name,
      onerror: (error) => {
        if (isDownloadCanceled(error)) return;
        console.warn('[Danbooru Masonry] download failed:', error);
        showSnackbar('下载失败');
      },
    });
  } catch (error) {
    console.warn('[Danbooru Masonry] download failed:', error);
    showSnackbar('下载失败');
  }
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
  void showAdjacentViewerPost(state, event.deltaY > 0 ? 1 : -1);
}

export function onViewerKeydown(state: AppState, event: KeyboardEvent): void {
  const isOpen = byId('dmh-viewer')?.classList.contains('dmh-open');
  if (!isOpen) return;
  if (event.key === 'Escape') closeViewer(state);
  if (event.key === 'ArrowLeft') void showAdjacentViewerPost(state, -1);
  if (event.key === 'ArrowRight') void showAdjacentViewerPost(state, 1);
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
  const cached = state.favoriteStateCache.get(post.id);
  if (cached !== undefined) {
    applyFavoriteState(state, post, cached);
    return;
  }
  if (state.favoriteStateLoading.has(post.id)) return;
  state.favoriteStateLoading.add(post.id);
  try {
    const favorited = await state.adapter.isFavorited(post.id);
    state.favoriteStateCache.set(post.id, favorited);
    if (state.posts[state.viewerIndex]?.id !== post.id) return;
    applyFavoriteState(state, post, favorited);
  } catch (error) {
    console.warn('[Danbooru Masonry] favorite state check failed:', error);
  } finally {
    state.favoriteStateLoading.delete(post.id);
  }
}

function applyFavoriteState(state: AppState, post: Post, favorited: boolean): void {
  post.favorited = favorited;
  if (favorited) {
    state.favoritePostIds.add(post.id);
  } else {
    state.favoritePostIds.delete(post.id);
  }
  updateFavoriteButton(state, post);
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

function getViewerPlaceholderUrl(post: Post, imageUrl: string): string {
  return (
    [post.sampleUrl, post.largeUrl, post.listUrl, post.previewUrl].find(
      (url) => url && url !== imageUrl,
    ) || ''
  );
}

function buildDownloadFilename(post: Post): string {
  const raw = (post.raw || {}) as DanbooruRawPost;
  const rawSource = typeof raw.source === 'string' ? raw.source : '';
  const source = rawSource || post.source || '';
  const sourceUrl = parseUrl(source);
  const normalizedSourceUrl = parseUrl(post.source || source);
  const extension = sanitizeFilenamePart(post.fileExt || extensionFromUrl(post.fileUrl) || 'jpg');
  const artist = sanitizeFilenamePart(firstTag(raw.tag_string_artist) || post.tagGroups.artist[0] || 'unknown');
  const pixivId = String(raw.pixiv_id || extractPixivId(sourceUrl, source) || '').trim();

  if (pixivId) {
    const sourceFile = sourceUrl ? lastPathSegment(sourceUrl) : '';
    const pixivPart = sanitizeFilenamePart(sourceFile.replace(/\.[^.]+$/, '') || pixivId);
    return formatDownloadFilename('pixiv', artist, pixivPart, extension);
  }

  if (normalizedSourceUrl && isFanboxSource(normalizedSourceUrl)) {
    const author = sanitizeFilenamePart(extractFanboxAuthor(normalizedSourceUrl) || artist);
    const id = sanitizeFilenamePart(extractFanboxId(normalizedSourceUrl) || post.id);
    return formatDownloadFilename('fanbox', author, id, extension);
  }

  if (sourceUrl && isFantiaSource(sourceUrl)) {
    const id = sanitizeFilenamePart(extractFantiaId(sourceUrl) || post.id);
    return formatDownloadFilename('fantia', artist, id, extension);
  }

  if (normalizedSourceUrl && isFantiaSource(normalizedSourceUrl)) {
    const id = sanitizeFilenamePart(extractFantiaId(normalizedSourceUrl) || post.id);
    return formatDownloadFilename('fantia', artist, id, extension);
  }

  if (sourceUrl && isPatreonSource(sourceUrl)) {
    const id = sanitizeFilenamePart(extractPatreonId(sourceUrl) || post.id);
    return formatDownloadFilename('patreon', artist, id, extension);
  }

  if (normalizedSourceUrl && isPatreonSource(normalizedSourceUrl)) {
    const id = sanitizeFilenamePart(extractPatreonId(normalizedSourceUrl) || post.id);
    return formatDownloadFilename('patreon', artist, id, extension);
  }

  if (sourceUrl && isWeiboSource(sourceUrl)) {
    const userId = sanitizeFilenamePart(extractWeiboUserId(sourceUrl) || 'unknown');
    const id = sanitizeFilenamePart(extractWeiboId(sourceUrl) || post.id);
    return formatDownloadFilename('weibo', `${artist}(${userId})`, id, extension);
  }

  if (sourceUrl && isTwitterSource(sourceUrl)) {
    const author = sanitizeFilenamePart(sourceUrl.pathname.split('/').filter(Boolean)[0] || 'unknown');
    const id = sanitizeFilenamePart(extractTwitterStatusId(sourceUrl) || extractSourceId(sourceUrl) || post.id);
    return formatDownloadFilename('twitter', author, id, extension);
  }

  if (sourceUrl && isBilibiliSource(sourceUrl)) {
    const id = sanitizeFilenamePart(extractBilibiliId(sourceUrl) || extractSourceId(sourceUrl) || post.id);
    return formatDownloadFilename('bilibili', artist, id, extension);
  }

  return formatDownloadFilename('danbooru', artist, sanitizeFilenamePart(post.id), extension);
}

function parseUrl(value: string): URL | null {
  try {
    return value ? new URL(value) : null;
  } catch {
    return null;
  }
}

function firstTag(value: unknown): string {
  return typeof value === 'string' ? value.split(/\s+/).filter(Boolean)[0] || '' : '';
}

function sanitizeFilenamePart(value: string): string {
  return value
    .trim()
    .replace(/[<>:"/\\|?*]+/g, '_')
    .replace(/[\n\r\t]+/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 120) || 'unknown';
}

function formatDownloadFilename(platform: string, artist: string, id: string, extension: string): string {
  return `${sanitizeFilenamePart(platform)}[${sanitizeFilenamePart(artist)}]_${sanitizeFilenamePart(id)}.${sanitizeFilenamePart(extension)}`;
}

function isDownloadCanceled(error: unknown): boolean {
  const value =
    error && typeof error === 'object' && 'error' in error
      ? String((error as { error?: unknown }).error || '')
      : String(error || '');
  return /cancel|abort|not_succeeded/i.test(value);
}

function extensionFromUrl(value: string): string {
  try {
    const path = new URL(value).pathname;
    return path.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase() || '';
  } catch {
    return value.match(/\.([a-z0-9]+)(?:\?|#|$)/i)?.[1]?.toLowerCase() || '';
  }
}

function lastPathSegment(url: URL): string {
  return decodeURIComponent(url.pathname.split('/').filter(Boolean).pop() || '');
}

function extractPixivId(url: URL | null, source: string): string {
  if (url?.hostname.toLowerCase().includes('pixiv.net')) {
    const artworkId = url.pathname.match(/\/(?:en\/)?artworks\/(\d+)/)?.[1];
    const imageId = lastPathSegment(url).match(/^(\d+)_p\d+/)?.[1];
    return artworkId || imageId || '';
  }
  return source.match(/(\d+)_p\d+/)?.[1] || '';
}

function isFanboxSource(url: URL): boolean {
  const host = url.hostname.toLowerCase();
  return host === 'fanbox.cc' || host.endsWith('.fanbox.cc') || host.includes('pixiv.net');
}

function extractFanboxAuthor(url: URL): string {
  const host = url.hostname.toLowerCase();
  if (host.endsWith('.fanbox.cc') && host !== 'www.fanbox.cc') return host.split('.')[0] || '';
  const creator = url.searchParams.get('creatorId');
  return creator || '';
}

function extractFanboxId(url: URL): string {
  return url.pathname.match(/\/posts\/(\d+)/)?.[1] || '';
}

function isFantiaSource(url: URL): boolean {
  const host = url.hostname.toLowerCase();
  return host === 'fantia.jp' || host.endsWith('.fantia.jp');
}

function extractFantiaId(url: URL): string {
  return (
    url.pathname.match(/\/posts\/(\d+)/)?.[1] ||
    url.pathname.match(/\/uploads\/post\/file\/(\d+)\//)?.[1] ||
    ''
  );
}

function isPatreonSource(url: URL): boolean {
  const host = url.hostname.toLowerCase();
  return host === 'patreon.com' || host.endsWith('.patreon.com') || host.endsWith('patreonusercontent.com');
}

function extractPatreonId(url: URL): string {
  return url.pathname.match(/\/posts\/(\d+)/)?.[1] || url.pathname.match(/\/post\/(\d+)\//)?.[1] || '';
}

function isWeiboSource(url: URL): boolean {
  const host = url.hostname.toLowerCase();
  return host === 'weibo.com' || host === 'www.weibo.com' || host.endsWith('.weibo.com');
}

function extractWeiboUserId(url: URL): string {
  return url.pathname.split('/').filter(Boolean)[0] || '';
}

function extractWeiboId(url: URL): string {
  return url.pathname.split('/').filter(Boolean)[1] || '';
}

function isTwitterSource(url: URL): boolean {
  const host = url.hostname.toLowerCase();
  return host === 'x.com' || host === 'twitter.com' || host.endsWith('.twitter.com') || host.endsWith('.x.com');
}

function extractTwitterStatusId(url: URL): string {
  return url.pathname.match(/\/status(?:es)?\/(\d+)/)?.[1] || '';
}

function isBilibiliSource(url: URL): boolean {
  const host = url.hostname.toLowerCase();
  return host === 'bilibili.com' || host.endsWith('.bilibili.com') || host === 'b23.tv';
}

function extractBilibiliId(url: URL): string {
  const path = url.pathname;
  return (
    path.match(/\/video\/(BV[a-zA-Z0-9]+)/)?.[1] ||
    path.match(/\/video\/av(\d+)/i)?.[1] ||
    path.match(/\/opus\/(\d+)/)?.[1] ||
    path.match(/\/dynamic\/(\d+)/)?.[1] ||
    path.match(/\/read\/cv(\d+)/i)?.[1] ||
    ''
  );
}

function extractSourceId(url: URL): string {
  const segments = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
  const last = segments.at(-1) || url.hostname;
  return last.replace(/\.[^.]+$/, '');
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
