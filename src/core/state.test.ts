import { afterEach, describe, expect, it, vi } from 'vitest';

import type { BooruAdapter } from '../adapters/types';
import {
  createState,
  parseViewerPreloadCount,
  saveAutoEnterMasonry,
  saveShowScrollbar,
  saveViewerPreloadCount,
} from './state';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('masonry settings', () => {
  it('enables the scrollbar and disables automatic entry by default', () => {
    stubSettings(new Map());
    const state = createState({} as BooruAdapter);
    expect(state.showScrollbar).toBe(true);
    expect(state.autoEnterMasonry).toBe(false);
  });

  it('restores scrollbar and automatic entry independently', () => {
    stubSettings(
      new Map([
        ['danbooru-masonry.showScrollbar', false],
        ['danbooru-masonry.autoEnterMasonry', true],
      ]),
    );
    const state = createState({} as BooruAdapter);
    expect(state.showScrollbar).toBe(false);
    expect(state.autoEnterMasonry).toBe(true);
  });

  it('persists both controls under independent keys', () => {
    const setValue = vi.fn();
    vi.stubGlobal('GM_setValue', setValue);
    saveShowScrollbar(false);
    saveAutoEnterMasonry(true);
    expect(setValue.mock.calls).toEqual([
      ['danbooru-masonry.showScrollbar', false],
      ['danbooru-masonry.autoEnterMasonry', true],
    ]);
  });
});

describe('viewer settings', () => {
  it('disables original files by default', () => {
    stubSettings(new Map());
    expect(createState({} as BooruAdapter).viewerUseOriginal).toBe(false);
  });

  it('preserves a saved original-file preference', () => {
    stubSettings(new Map([['danbooru-masonry.viewerUseOriginal', true]]));
    expect(createState({} as BooruAdapter).viewerUseOriginal).toBe(true);
  });

  it('preloads two images by default', () => {
    stubSettings(new Map());
    const state = createState({} as BooruAdapter);
    expect(state.viewerPreloadCount).toBe(2);
  });

  it('restores and bounds preload settings', () => {
    stubSettings(new Map([['danbooru-masonry.viewerPreloadCount', 3]]));
    const state = createState({} as BooruAdapter);
    expect(state.viewerPreloadCount).toBe(3);
    expect(parseViewerPreloadCount(0)).toBe(0);
    expect(parseViewerPreloadCount(6)).toBe(2);
    expect(parseViewerPreloadCount(2.5)).toBe(2);
  });

  it('restores and persists zero as disabled preloading', () => {
    stubSettings(new Map([['danbooru-masonry.viewerPreloadCount', 0]]));
    expect(createState({} as BooruAdapter).viewerPreloadCount).toBe(0);
    const setValue = vi.fn();
    vi.stubGlobal('GM_setValue', setValue);
    saveViewerPreloadCount(0);
    expect(setValue).toHaveBeenCalledWith('danbooru-masonry.viewerPreloadCount', 0);
  });
});

function stubSettings(values: Map<string, unknown>): void {
  vi.stubGlobal('location', { search: '' });
  vi.stubGlobal('GM_getValue', (key: string, fallback: unknown) =>
    values.has(key) ? values.get(key) : fallback,
  );
}
