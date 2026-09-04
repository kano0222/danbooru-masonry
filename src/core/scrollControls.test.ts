import { describe, expect, it } from 'vitest';

import {
  calculateScrollMetrics,
  scrollTopFromThumbOffset,
  scrollTopFromTrackPoint,
  shouldShowBackToTop,
} from './scrollControls';

describe('scroll controls metrics', () => {
  it('maps the top, middle, and bottom of the page to the track', () => {
    expect(calculateScrollMetrics(0, 1000, 5000, 500).thumbOffset).toBe(0);
    expect(calculateScrollMetrics(2000, 1000, 5000, 500).thumbOffset).toBe(200);
    expect(calculateScrollMetrics(4000, 1000, 5000, 500).thumbOffset).toBe(400);
  });

  it('uses a minimum thumb height for very long pages', () => {
    const metrics = calculateScrollMetrics(0, 1000, 100_000, 500);
    expect(metrics.thumbHeight).toBe(36);
    expect(metrics.maxThumbOffset).toBe(464);
  });

  it('marks short and invalid pages as not scrollable', () => {
    expect(calculateScrollMetrics(0, 1000, 800, 500).scrollable).toBe(false);
    expect(calculateScrollMetrics(Number.NaN, 0, 0, 0)).toEqual({
      scrollable: false,
      maxScroll: 0,
      thumbHeight: 0,
      thumbOffset: 0,
      maxThumbOffset: 0,
      progress: 0,
    });
  });

  it('maps dragging and track clicks to clamped scroll positions', () => {
    expect(scrollTopFromThumbOffset(200, 400, 4000)).toBe(2000);
    expect(scrollTopFromThumbOffset(500, 400, 4000)).toBe(4000);
    expect(scrollTopFromTrackPoint(250, 500, 100, 4000)).toBe(2000);
    expect(scrollTopFromTrackPoint(0, 500, 100, 4000)).toBe(0);
  });

  it('shows the back-to-top button only after 300 pixels', () => {
    expect(shouldShowBackToTop(true, 300)).toBe(false);
    expect(shouldShowBackToTop(true, 301)).toBe(true);
    expect(shouldShowBackToTop(false, 1000)).toBe(false);
  });
});
