import type { BooruAdapter } from './adapters/types';
import { DanbooruAdapter } from './adapters/danbooru';

const LOCAL_DANBOORU_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000'];

export function resolveAdapter(currentLocation: Location): BooruAdapter | null {
  const adapters: BooruAdapter[] = [
    ...(LOCAL_DANBOORU_ORIGINS.includes(currentLocation.origin)
      ? [new DanbooruAdapter(currentLocation.origin)]
      : []),
    new DanbooruAdapter(),
  ];
  return adapters.find((adapter) => adapter.isMatch(currentLocation)) || null;
}
