import type { BooruAdapter } from './adapters/types';
import { DanbooruAdapter } from './adapters/danbooru';

export function resolveAdapter(currentLocation: Location): BooruAdapter | null {
  const adapters: BooruAdapter[] = [new DanbooruAdapter()];
  return adapters.find((adapter) => adapter.isMatch(currentLocation)) || null;
}
