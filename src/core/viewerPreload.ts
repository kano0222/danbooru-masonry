import type { AppState } from './state';

interface ViewerImageCache {
  images: Map<string, HTMLImageElement>;
  generation: number;
}

const caches = new WeakMap<AppState, ViewerImageCache>();

function getCache(state: AppState): ViewerImageCache {
  let cache = caches.get(state);
  if (!cache) {
    cache = { images: new Map(), generation: 0 };
    caches.set(state, cache);
  }
  return cache;
}

export function getViewerImage(state: AppState, url: string): HTMLImageElement {
  const cache = getCache(state);
  const existing = cache.images.get(url);
  if (existing) return existing;
  const image = new Image();
  if (url) {
    cache.images.set(url, image);
    image.src = url;
  }
  return image;
}

export function forgetViewerImage(state: AppState, url: string): void {
  getCache(state).images.delete(url);
}

export async function preloadViewerImages(
  state: AppState,
  currentUrl: string,
  followingUrls: string[],
): Promise<void> {
  const cache = getCache(state);
  const generation = ++cache.generation;
  const urls = state.viewerPreloadCount > 0 ? followingUrls.filter(Boolean) : [];
  const retained = new Set([currentUrl, ...urls]);
  for (const url of cache.images.keys()) {
    if (!retained.has(url)) cache.images.delete(url);
  }

  for (const url of urls) {
    if (generation !== cache.generation) return;
    const image = getViewerImage(state, url);
    if (!image.complete) {
      await new Promise<void>((resolve) => {
        const done = () => {
          image.removeEventListener('load', done);
          image.removeEventListener('error', done);
          resolve();
        };
        image.addEventListener('load', done);
        image.addEventListener('error', done);
      });
    }
    if (generation !== cache.generation) return;
    if (!image.naturalWidth) cache.images.delete(url);
  }
}

export function clearViewerImages(state: AppState): void {
  const cache = getCache(state);
  cache.generation++;
  cache.images.clear();
}
