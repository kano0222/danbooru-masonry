import { afterEach, describe, expect, it, vi } from 'vitest';

import type { BooruAdapter } from '../adapters/types';
import { createState, saveShowBackToTop, saveShowScrollbar } from './state';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('scroll control settings', () => {
  it('enables both controls by default', () => {
    stubSettings(new Map());
    const state = createState({} as BooruAdapter);
    expect(state.showScrollbar).toBe(true);
    expect(state.showBackToTop).toBe(true);
  });

  it('restores both controls independently', () => {
    stubSettings(
      new Map([
        ['danbooru-masonry.showScrollbar', false],
        ['danbooru-masonry.showBackToTop', true],
      ]),
    );
    const state = createState({} as BooruAdapter);
    expect(state.showScrollbar).toBe(false);
    expect(state.showBackToTop).toBe(true);
  });

  it('persists both controls under independent keys', () => {
    const setValue = vi.fn();
    vi.stubGlobal('GM_setValue', setValue);
    saveShowScrollbar(false);
    saveShowBackToTop(true);
    expect(setValue.mock.calls).toEqual([
      ['danbooru-masonry.showScrollbar', false],
      ['danbooru-masonry.showBackToTop', true],
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
});

function stubSettings(values: Map<string, unknown>): void {
  vi.stubGlobal('location', { search: '' });
  vi.stubGlobal('GM_getValue', (key: string, fallback: unknown) =>
    values.has(key) ? values.get(key) : fallback,
  );
}
