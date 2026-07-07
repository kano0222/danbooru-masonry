import type { BooruAdapter, Post } from '../adapters/types';
import { TagTranslationStore } from '../data/tagTranslation';

export interface AppState {
  adapter: BooruAdapter;
  page: number;
  tags: string;
  posts: Post[];
  loading: boolean;
  done: boolean;
  started: boolean;
  starting: boolean;
  requestToken: number;
  resizeRaf: number;
  layoutObserver: ResizeObserver | null;
  autocompleteTimer: number;
  autocompleteToken: number;
  autocompleteIndex: number;
  viewerIndex: number;
  viewerChromeHidden: boolean;
  zoomMode: boolean;
  zoomScale: number;
  zoomX: number;
  zoomY: number;
  zoomDragging: boolean;
  zoomMoved: boolean;
  zoomStartX: number;
  zoomStartY: number;
  zoomBaseX: number;
  zoomBaseY: number;
  lastViewerWheelAt: number;
  favoriteLoading: boolean;
  favoritePostIds: Set<string>;
  translations: TagTranslationStore;
}

export function createState(adapter: BooruAdapter): AppState {
  return {
    adapter,
    page: getInitialPage(),
    tags: new URLSearchParams(location.search).get('tags') || '',
    posts: [],
    loading: false,
    done: false,
    started: false,
    starting: false,
    requestToken: 0,
    resizeRaf: 0,
    layoutObserver: null,
    autocompleteTimer: 0,
    autocompleteToken: 0,
    autocompleteIndex: -1,
    viewerIndex: -1,
    viewerChromeHidden: false,
    zoomMode: false,
    zoomScale: 1,
    zoomX: 0,
    zoomY: 0,
    zoomDragging: false,
    zoomMoved: false,
    zoomStartX: 0,
    zoomStartY: 0,
    zoomBaseX: 0,
    zoomBaseY: 0,
    lastViewerWheelAt: 0,
    favoriteLoading: false,
    favoritePostIds: new Set(),
    translations: new TagTranslationStore(),
  };
}

function getInitialPage(): number {
  const page = Number(new URLSearchParams(location.search).get('page'));
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}
