import { describe, expect, it } from 'vitest';
import { getFavoriteSearchTag, getRequestTags } from './search';

describe('favorite search shortcut', () => {
  it('uses the signed-in username', () => {
    expect(getFavoriteSearchTag('42', '  My Name  ', false)).toBe('ordfav:My_Name');
  });
  it('does not search without a signed-in username', () => {
    expect(getFavoriteSearchTag('', 'My_Name', false)).toBe('');
    expect(getFavoriteSearchTag('42', '', false)).toBe('');
    expect(getFavoriteSearchTag('42', 'My_Name', true)).toBe('');
  });
});

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
