import { describe, expect, it } from 'vitest';
import { getRequestTags } from './search';

describe('NSFW request restriction', () => {
  it.each(['', 'a b', 'rating:e', 'a or b', 'source:"a b"'])('preserves %s when disabled', (tags) => {
    expect(getRequestTags(tags, false)).toBe(tags);
  });
  it('restricts an empty search', () => {
    expect(getRequestTags('  ', true)).toBe('rating:g');
  });
  it.each(['a b', 'a or b', '( a or b ) -c', 'rating:e', 'rating:g', 'source:"a b"'])('intersects the whole query %s with General', (tags) => {
    expect(getRequestTags(tags, true)).toBe('( ' + tags + ' ) rating:g');
  });
});
