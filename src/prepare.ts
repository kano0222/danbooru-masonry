import type { BooruAdapter } from './adapters/types';
import { DanbooruAdapter } from './adapters/danbooru';
import { LocalDanbooruAdapter } from './adapters/localDanbooru';

export function resolveAdapter(currentLocation: Location): BooruAdapter | null {
  const adapters: BooruAdapter[] = __LOCAL_DANBOORU__
    ? [new LocalDanbooruAdapter(), new DanbooruAdapter()]
    : [new DanbooruAdapter()];
  return adapters.find((adapter) => adapter.isMatch(currentLocation)) || null;
}
