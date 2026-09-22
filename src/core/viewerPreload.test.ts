import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppState } from './state';
import type { Post } from '../adapters/types';
import { refreshViewerPreload } from './viewer';
import { clearViewerImages, getViewerImage, preloadViewerImages } from './viewerPreload';

class FakeImage {
  static instances: FakeImage[] = [];
  src = '';
  complete = false;
  naturalWidth = 0;
  private listeners = new Map<string, Set<() => void>>();

  constructor() {
    FakeImage.instances.push(this);
  }

  addEventListener(type: string, listener: () => void): void {
    const listeners = this.listeners.get(type) || new Set();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type: string, listener: () => void): void {
    this.listeners.get(type)?.delete(listener);
  }

  finish(width = 100): void {
    this.complete = true;
    this.naturalWidth = width;
    for (const listener of this.listeners.get(width ? 'load' : 'error') || []) listener();
  }
}

beforeEach(() => {
  FakeImage.instances = [];
  vi.stubGlobal('Image', FakeImage);
});

afterEach(() => vi.unstubAllGlobals());

describe('viewer image preloading', () => {
  it('loads following images in order and reuses the loaded image', async () => {
    const state = { viewerPreloadCount: 2 } as AppState;
    const pending = preloadViewerImages(state, 'current', ['next', 'after']);
    expect(FakeImage.instances.map((image) => image.src)).toEqual(['next']);
    FakeImage.instances[0].finish();
    await Promise.resolve();
    expect(FakeImage.instances.map((image) => image.src)).toEqual(['next', 'after']);
    FakeImage.instances[1].finish();
    await pending;
    expect(getViewerImage(state, 'next')).toBe(FakeImage.instances[0]);
  });

  it('stops the previous queue when navigation changes', async () => {
    const state = { viewerPreloadCount: 2 } as AppState;
    const previous = preloadViewerImages(state, 'first', ['old-next', 'old-after']);
    const current = preloadViewerImages(state, 'second', ['new-next']);
    expect(FakeImage.instances.map((image) => image.src)).toEqual(['old-next', 'new-next']);
    FakeImage.instances[0].finish();
    await previous;
    expect(FakeImage.instances.map((image) => image.src)).toEqual(['old-next', 'new-next']);
    FakeImage.instances[1].finish();
    await current;
  });

  it('does not preload when disabled and clears retained images on close', async () => {
    const state = { viewerPreloadCount: 0 } as AppState;
    await preloadViewerImages(state, 'current', ['next']);
    expect(FakeImage.instances).toHaveLength(0);
    const image = getViewerImage(state, 'current');
    clearViewerImages(state);
    expect(getViewerImage(state, 'current')).not.toBe(image);
  });

  it('uses original URLs and skips videos when counting following images', async () => {
    const state = {
      viewerIndex: 0,
      viewerPreloadCount: 2,
      viewerUseOriginal: true,
      posts: [
        { fileUrl: 'current-original' },
        { playbackUrl: 'video.mp4' },
        { fileUrl: 'next-original' },
        { fileUrl: 'after-original' },
      ] as unknown as Post[],
    } as AppState;
    refreshViewerPreload(state);
    expect(FakeImage.instances.map((image) => image.src)).toEqual(['next-original']);
    FakeImage.instances[0].finish();
    await Promise.resolve();
    expect(FakeImage.instances.map((image) => image.src)).toEqual([
      'next-original',
      'after-original',
    ]);
    FakeImage.instances[1].finish();
  });
});
