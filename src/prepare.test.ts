import { describe, expect, it } from 'vitest';
import { resolveAdapter } from './prepare';

function mockLocation(url: string): Location {
  return new URL(url) as unknown as Location;
}

describe('resolveAdapter', () => {
  it('resolves the official Danbooru adapter', () => {
    const adapter = resolveAdapter(mockLocation('https://danbooru.donmai.us/posts?tags=blue_archive'));

    expect(adapter?.origin).toBe('https://danbooru.donmai.us');
  });

  it('resolves a local Danbooru mirror with the current origin', () => {
    const adapter = resolveAdapter(mockLocation('http://localhost:3000/posts?tags=blue_archive'));

    expect(adapter?.origin).toBe('http://localhost:3000');
  });

  it('ignores unsupported origins', () => {
    const adapter = resolveAdapter(mockLocation('https://example.com/posts'));

    expect(adapter).toBeNull();
  });
});
