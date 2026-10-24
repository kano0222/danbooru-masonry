import { describe, expect, it } from 'vitest';

import { CARD_GAP, calculateLayout, findShortestColumn, getVisibleCardIndices } from './masonry';

describe('masonry column selection', () => {
  it('prefers the leftmost column when height differences are visually negligible', () => {
    expect(findShortestColumn([500, 499, 502, 499])).toBe(0);
  });

  it('uses the actual shortest column when the difference exceeds one gap', () => {
    expect(findShortestColumn([500, 500 - CARD_GAP - 1, 502, 499])).toBe(1);
  });
});

describe('image list layouts', () => {
  const posts = [{ width: 100, height: 200 }, { width: 200, height: 100 }, { width: 100, height: 100 }];

  it('preserves shortest-column masonry placement and proportions', () => {
    const positions = calculateLayout(posts, 412, 200, 'masonry');
    expect(positions).toEqual([
      { left: 0, top: 0, width: 200, height: 400 },
      { left: 212, top: 0, width: 200, height: 100 },
      { left: 212, top: 112, width: 200, height: 200 },
    ]);
    expect(calculateLayout(posts, 412, 200, 'virtual')).toEqual(positions);
  });

  it('lays out square grid cells in reading order', () => {
    expect(calculateLayout(posts, 412, 200, 'grid')).toEqual([
      { left: 0, top: 0, width: 200, height: 200 },
      { left: 212, top: 0, width: 200, height: 200 },
      { left: 0, top: 212, width: 200, height: 200 },
    ]);
  });

  it('fills justified rows without cropping and leaves the final row unstretched', () => {
    const positions = calculateLayout(posts, 412, 200, 'justified');
    expect(positions).toEqual([
      { left: 0, top: 0, width: 80, height: 160 },
      { left: 92, top: 0, width: 320, height: 160 },
      { left: 0, top: 172, width: 200, height: 200 },
    ]);
    const appended = calculateLayout([...posts, ...posts], 412, 200, 'justified');
    expect(appended.slice(0, 2)).toEqual(positions.slice(0, 2));
  });

  it('handles missing dimensions, empty lists and narrow containers', () => {
    for (const layout of ['masonry', 'grid', 'justified', 'virtual'] as const) {
      expect(calculateLayout([], 400, 200, layout)).toEqual([]);
      expect(calculateLayout(posts, 0, 200, layout)).toEqual([]);
      const positions = calculateLayout([{ width: 0, height: 0 }, ...posts], 50, 200, layout);
      for (const item of positions) {
        expect(item.width).toBeGreaterThan(0);
        expect(item.height).toBeGreaterThan(0);
        expect(item.left + item.width).toBeLessThanOrEqual(50);
      }
    }
  });

  it('keeps visible cards and one screen of overscan, including very tall cards', () => {
    const positions = [
      { left: 0, top: 0, width: 200, height: 5000 },
      ...Array.from({ length: 30 }, (_, i) => ({ left: 212, top: i * 212, width: 200, height: 200 })),
    ];
    const visible = getVisibleCardIndices(positions, 2000, 500);
    expect(visible).toContain(0);
    expect(visible).toContain(10);
    expect(visible).not.toContain(1);
    expect(visible).not.toContain(30);
  });
});
