import { afterEach, describe, expect, it, vi } from 'vitest';
import type { BooruAdapter } from '../adapters/types';
import { createState } from '../core/state';
import { bindViewerLayout } from './viewerLayout';

afterEach(() => vi.unstubAllGlobals());

function setup(layout: unknown = undefined) {
  const save = vi.fn();
  vi.stubGlobal('location', { search: '' });
  vi.stubGlobal('GM_getValue', (key: string, fallback: unknown) =>
    key === 'danbooru-masonry.viewerLayout' ? layout : fallback,
  );
  vi.stubGlobal('GM_setValue', save);
  const state = createState({} as BooruAdapter);
  const viewer = { dataset: {} as Record<string, string> };
  const input = { value: state.viewerLayout, addEventListener: vi.fn() };
  vi.stubGlobal('document', {
    getElementById: (id: string) =>
      id === 'dmh-viewer' ? viewer : id === 'dmh-viewer-toolbar-position' ? input : null,
  });
  bindViewerLayout(state);
  const change = () => input.addEventListener.mock.calls[0][1]();
  return { state, viewer, input, save, change };
}

describe('viewer layout mode', () => {
  it.each(['top', 'bottom'])('restores %s without writing storage', (layout) => {
    const { viewer, save } = setup(layout);
    expect(viewer.dataset.toolbarPosition).toBe(layout);
    expect(save).not.toHaveBeenCalled();
  });

  it('switches to bottom and back to the original mode, preserving tag visibility', () => {
    const { state, viewer, input, save, change } = setup();
    state.viewerTagsOpen = true;
    for (const position of ['bottom', 'top'] as const) {
      input.value = position;
      change();
      expect(state.viewerLayout).toBe(position);
      expect(viewer.dataset.toolbarPosition).toBe(position);
      expect(save).toHaveBeenLastCalledWith('danbooru-masonry.viewerLayout', position);
      expect(state.viewerTagsOpen).toBe(true);
    }
  });
});
