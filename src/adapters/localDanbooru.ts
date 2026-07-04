import { DanbooruAdapter } from './danbooru';

export class LocalDanbooruAdapter extends DanbooruAdapter {
  siteName = 'Danbooru';
  origin = location.origin;

  isMatch(currentLocation: Location): boolean {
    return (
      ['http://localhost:3000', 'http://127.0.0.1:3000'].includes(currentLocation.origin) &&
      (currentLocation.pathname === '/' || currentLocation.pathname.startsWith('/posts'))
    );
  }
}
