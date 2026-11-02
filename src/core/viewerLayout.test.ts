import { describe, expect, it } from 'vitest';
import { parseViewerLayout } from './viewerLayout';

describe('viewer toolbar position', () => {
  it.each([undefined, null, false, 'left', [], {}])(
    'defaults invalid settings %j to top',
    (value) => {
      expect(parseViewerLayout(value)).toBe('top');
    },
  );
  it.each(['top', 'bottom'] as const)('restores %s', (value) => {
    expect(parseViewerLayout(value)).toBe(value);
  });
});
