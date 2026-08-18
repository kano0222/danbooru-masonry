import { describe, expect, it } from 'vitest';

import { CARD_GAP, findShortestColumn } from './masonry';

describe('masonry column selection', () => {
  it('prefers the leftmost column when height differences are visually negligible', () => {
    expect(findShortestColumn([500, 499, 502, 499])).toBe(0);
  });

  it('uses the actual shortest column when the difference exceeds one gap', () => {
    expect(findShortestColumn([500, 500 - CARD_GAP - 1, 502, 499])).toBe(1);
  });
});
