import type { BooruAdapter, Post } from '../adapters/types';
import { CARD_SIZE_OPTIONS, DEFAULT_CARD_WIDTH } from './masonry';
import { TagTranslationStore } from '../data/tagTranslation';
import type { BlacklistConfig } from './blacklist';

const CARD_SIZE_STORAGE_KEY = 'danbooru-masonry.cardSize';
const VIEWER_USE_ORIGINAL_STORAGE_KEY = 'danbooru-masonry.viewerUseOriginal';
const VIEWER_PRELOAD_COUNT_STORAGE_KEY = 'danbooru-masonry.viewerPreloadCount';
const SHOW_THUMBNAIL_INFO_STORAGE_KEY = 'danbooru-masonry.showThumbnailInfo';
const SHOW_THUMBNAIL_BUTTONS_STORAGE_KEY = 'danbooru-masonry.showThumbnailButtons';
const VIEWER_WHEEL_NAVIGATION_STORAGE_KEY = 'danbooru-masonry.viewerWheelNavigation';
const SHOW_SCROLLBAR_STORAGE_KEY = 'danbooru-masonry.showScrollbar';
const AUTO_ENTER_MASONRY_STORAGE_KEY = 'danbooru-masonry.autoEnterMasonry';
const DOWNLOAD_FILENAME_TEMPLATES_STORAGE_KEY = 'danbooru-masonry.downloadFilenameTemplates';
const HIDE_NSFW_STORAGE_KEY = 'danbooru-masonry.hideNsfw';
const VIEWER_TAGS_OPEN_STORAGE_KEY = 'danbooru-masonry.viewerTagsOpen';
const TAG_CLICK_BEHAVIOR_STORAGE_KEY = 'danbooru-masonry.tagClickBehavior';
export type TagClickBehavior = 'masonry-current-tab' | 'masonry-new-tab';

export function parseTagClickBehavior(value: unknown): TagClickBehavior {
  if (
    value === 'masonry-current-tab' ||
    value === 'masonry-new-tab'
  ) {
    return value;
  }
  return 'masonry-new-tab';
}

export function saveHideNsfw(value: boolean): void {
  saveSetting(HIDE_NSFW_STORAGE_KEY, value);
}

export function saveAutoEnterMasonry(value: boolean): void {
  saveSetting(AUTO_ENTER_MASONRY_STORAGE_KEY, value);
}

export function saveViewerTagsOpen(value: boolean): void {
  saveSetting(VIEWER_TAGS_OPEN_STORAGE_KEY, value);
}

export function saveTagClickBehavior(value: TagClickBehavior): void {
  saveSetting(TAG_CLICK_BEHAVIOR_STORAGE_KEY, value);
}

const MISSING_VALUE = '__dmh_missing__';

export const DOWNLOAD_FILENAME_TEMPLATE_OPTIONS = [
  { key: 'pixiv', label: 'Pixiv', template: 'pixiv[{artist}]_{original}' },
  { key: 'fanbox', label: 'Fanbox', template: 'fanbox[{username}]_{id}' },
  { key: 'fantia', label: 'Fantia', template: 'fantia[{artist}]_{id}' },
  { key: 'patreon', label: 'Patreon', template: 'patreon[{artist}]_{id}' },
  { key: 'weibo', label: 'Weibo', template: 'weibo[{artist}]({userid})_{id}' },
  { key: 'twitter', label: 'X / Twitter', template: 'twitter[{username}]_{id}' },
  { key: 'bilibili', label: 'Bilibili', template: 'bilibili[{artist}]_{id}' },
  { key: 'danbooru', label: '其他', template: 'danbooru[{artist}]_{postid}' },
] as const;

export type DownloadFilenamePlatform = (typeof DOWNLOAD_FILENAME_TEMPLATE_OPTIONS)[number]['key'];
export type DownloadFilenameTemplates = Record<DownloadFilenamePlatform, string>;

export const DEFAULT_DOWNLOAD_FILENAME_TEMPLATES = Object.fromEntries(
  DOWNLOAD_FILENAME_TEMPLATE_OPTIONS.map((option) => [option.key, option.template]),
) as DownloadFilenameTemplates;

export interface AppState {
  adapter: BooruAdapter;
  page: number;
  tags: string;
  posts: Post[];
  sourcePosts: Post[];
  blacklist: BlacklistConfig;
  blacklistText: string;
  blacklistSaving: boolean;
  blacklistAvailable: boolean;
  loading: boolean;
  done: boolean;
  started: boolean;
  starting: boolean;
  loadMore: (() => Promise<void>) | null;
  requestToken: number;
  resizeRaf: number;
  layoutObserver: ResizeObserver | null;
  autocompleteTimer: number;
  autocompleteToken: number;
  autocompleteIndex: number;
  hideNsfw: boolean;
  autoEnterMasonry: boolean;
  viewerTagsOpen: boolean;
  tagClickBehavior: TagClickBehavior;
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
  favoriteStateCache: Map<string, boolean>;
  favoriteStateLoading: Set<string>;
  cardWidth: number;
  viewerUseOriginal: boolean;
  viewerPreloadCount: number;
  showThumbnailInfo: boolean;
  showThumbnailButtons: boolean;
  viewerWheelNavigation: boolean;
  showScrollbar: boolean;
  downloadFilenameTemplates: DownloadFilenameTemplates;
  translations: TagTranslationStore;
}

export function createState(adapter: BooruAdapter): AppState {
  return {
    adapter,
    page: getInitialPage(),
    tags: new URLSearchParams(location.search).get('tags') || '',
    posts: [],
    sourcePosts: [],
    blacklist: { enabled: false, rules: [] },
    blacklistText: '',
    blacklistSaving: false,
    blacklistAvailable: false,
    loading: false,
    done: false,
    started: false,
    starting: false,
    loadMore: null,
    requestToken: 0,
    resizeRaf: 0,
    layoutObserver: null,
    autocompleteTimer: 0,
    autocompleteToken: 0,
    autocompleteIndex: -1,
    hideNsfw: getInitialBooleanSetting(HIDE_NSFW_STORAGE_KEY, false),
    autoEnterMasonry: getInitialBooleanSetting(AUTO_ENTER_MASONRY_STORAGE_KEY, true),
    viewerTagsOpen: getInitialBooleanSetting(VIEWER_TAGS_OPEN_STORAGE_KEY, false),
    tagClickBehavior: parseTagClickBehavior(getStoredSetting(TAG_CLICK_BEHAVIOR_STORAGE_KEY)),
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
    favoriteStateCache: new Map(),
    favoriteStateLoading: new Set(),
    cardWidth: getInitialCardWidth(),
    viewerUseOriginal: getInitialViewerUseOriginal(),
    viewerPreloadCount: parseViewerPreloadCount(getStoredSetting(VIEWER_PRELOAD_COUNT_STORAGE_KEY)),
    showThumbnailInfo: getInitialBooleanSetting(SHOW_THUMBNAIL_INFO_STORAGE_KEY, false),
    showThumbnailButtons: getInitialBooleanSetting(SHOW_THUMBNAIL_BUTTONS_STORAGE_KEY, true),
    viewerWheelNavigation: getInitialBooleanSetting(VIEWER_WHEEL_NAVIGATION_STORAGE_KEY, true),
    showScrollbar: getInitialBooleanSetting(SHOW_SCROLLBAR_STORAGE_KEY, true),
    downloadFilenameTemplates: getInitialDownloadFilenameTemplates(),
    translations: new TagTranslationStore(),
  };
}

function getInitialPage(): number {
  const page = Number(new URLSearchParams(location.search).get('page'));
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function getInitialCardWidth(): number {
  const storedValue = getStoredSetting(CARD_SIZE_STORAGE_KEY);
  const storedOption = getCardSizeOption(storedValue);
  return storedOption?.value ?? DEFAULT_CARD_WIDTH;
}

export function saveCardWidth(value: number): void {
  const option = CARD_SIZE_OPTIONS.find((item) => item.value === value);
  if (!option) return;
  saveSetting(CARD_SIZE_STORAGE_KEY, option.key);
}

function getInitialViewerUseOriginal(): boolean {
  return getInitialBooleanSetting(VIEWER_USE_ORIGINAL_STORAGE_KEY, false);
}

export function saveViewerUseOriginal(value: boolean): void {
  saveSetting(VIEWER_USE_ORIGINAL_STORAGE_KEY, value);
}

export function parseViewerPreloadCount(value: unknown): number {
  const count = Number(value);
  return Number.isInteger(count) && count >= 0 && count <= 5 ? count : 2;
}

export function saveViewerPreloadCount(value: number): void {
  saveSetting(VIEWER_PRELOAD_COUNT_STORAGE_KEY, parseViewerPreloadCount(value));
}

export function saveShowThumbnailInfo(value: boolean): void {
  saveSetting(SHOW_THUMBNAIL_INFO_STORAGE_KEY, value);
}

export function saveShowThumbnailButtons(value: boolean): void {
  saveSetting(SHOW_THUMBNAIL_BUTTONS_STORAGE_KEY, value);
}

export function saveViewerWheelNavigation(value: boolean): void {
  saveSetting(VIEWER_WHEEL_NAVIGATION_STORAGE_KEY, value);
}

export function saveShowScrollbar(value: boolean): void {
  saveSetting(SHOW_SCROLLBAR_STORAGE_KEY, value);
}

export function saveDownloadFilenameTemplates(value: DownloadFilenameTemplates): void {
  saveSetting(DOWNLOAD_FILENAME_TEMPLATES_STORAGE_KEY, value);
}

function getInitialDownloadFilenameTemplates(): DownloadFilenameTemplates {
  const value = getStoredSetting(DOWNLOAD_FILENAME_TEMPLATES_STORAGE_KEY);
  const templates = { ...DEFAULT_DOWNLOAD_FILENAME_TEMPLATES };
  if (value && typeof value === 'object') {
    for (const option of DOWNLOAD_FILENAME_TEMPLATE_OPTIONS) {
      const template = (value as Partial<DownloadFilenameTemplates>)[option.key];
      if (typeof template === 'string' && template.trim()) {
        templates[option.key] = template.replace(/\.\{ext\}\s*$/, '');
      }
    }
  }
  return templates;
}

function getInitialBooleanSetting(key: string, defaultValue: boolean): boolean {
  const value = getStoredSetting(key);
  if (value === false || value === 'false') return false;
  if (value === true || value === 'true') return true;
  return defaultValue;
}

function getStoredSetting(key: string): unknown {
  try {
    const value = GM_getValue(key, MISSING_VALUE);
    if (value !== MISSING_VALUE) return value;
  } catch {
    // Ignore blocked userscript storage and fall back to defaults.
  }

  return undefined;
}

function saveSetting(key: string, value: unknown): void {
  try {
    GM_setValue(key, value);
  } catch {
    // Ignore blocked userscript storage; the setting still applies for this session.
  }
}

function getCardSizeOption(value: unknown): (typeof CARD_SIZE_OPTIONS)[number] | undefined {
  return CARD_SIZE_OPTIONS.find((option) => option.key === value);
}
