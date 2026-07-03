import type { Post, TagGroups } from '../adapters/types';
import type { DanbooruRawPost } from '../types/danbooru';
import { absoluteUrl } from '../utils/url';

export function normalizePost(rawValue: unknown, origin: string): Post {
  const raw = (rawValue || {}) as DanbooruRawPost;
  const variants = Array.isArray(raw.media_asset?.variants) ? raw.media_asset.variants : [];
  const fileUrl = absoluteUrl(raw.file_url || findVariantUrl(variants, ['original', 'file']), origin);
  const largeUrl = absoluteUrl(
    raw.large_file_url || findVariantUrl(variants, ['large', 'sample', '720x720']),
    origin,
  );
  const sampleUrl = absoluteUrl(
    raw.sample_file_url || raw.sample_url || findVariantUrl(variants, ['sample', 'large', '720x720']),
    origin,
  );
  const previewUrl = absoluteUrl(
    raw.preview_file_url ||
      raw.preview_url ||
      findVariantUrl(variants, ['preview', '360x360', '180x180', 'small']),
    origin,
  );
  const width = Number(raw.image_width || raw.width || raw.media_asset?.image_width || 0);
  const height = Number(raw.image_height || raw.height || raw.media_asset?.image_height || 0);
  const fileExt = String(raw.file_ext || extensionFromUrl(fileUrl) || '').toLowerCase();
  const isVideo = fileExt === 'mp4' || fileExt === 'webm' || /\.(mp4|webm)(\?|$)/i.test(fileUrl);
  const listUrl = isVideo
    ? previewUrl || sampleUrl || largeUrl || fileUrl
    : sampleUrl || largeUrl || previewUrl || fileUrl;
  const viewerUrl = fileUrl || largeUrl || sampleUrl || previewUrl;

  return {
    id: String(raw.id ?? ''),
    raw,
    fileUrl,
    largeUrl,
    sampleUrl,
    previewUrl,
    listUrl,
    viewerUrl,
    width,
    height,
    aspectRatio: width && height ? width / height : 1,
    tags: normalizeTags(raw),
    tagGroups: normalizeTagGroups(raw),
    rating: raw.rating || 'u',
    score: Number(raw.score || 0),
    source: normalizeSource(raw, origin),
    fileExt,
    isVideo,
    favorited: isPostFavorited(raw),
    available:
      !raw.is_deleted && !raw.is_banned && Boolean(raw.id) && Boolean(fileUrl || largeUrl || sampleUrl || previewUrl),
  };
}

function parseTagString(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string') return value.split(/\s+/).filter(Boolean);
  return [];
}

function normalizeTags(raw: DanbooruRawPost): string[] {
  if (Array.isArray(raw.tag_string)) return raw.tag_string.map(String).filter(Boolean);
  if (typeof raw.tag_string === 'string') return parseTagString(raw.tag_string);
  if (typeof raw.tags === 'string') return parseTagString(raw.tags);
  if (raw.tags && typeof raw.tags === 'object') {
    return Object.values(raw.tags).flatMap((value) => parseTagString(value));
  }
  return [];
}

function normalizeTagGroups(raw: DanbooruRawPost): TagGroups {
  const tagsObject = raw.tags && typeof raw.tags === 'object' ? raw.tags : {};
  const groups = {
    artist: parseTagString(raw.tag_string_artist || tagsObject.artist),
    copyright: parseTagString(raw.tag_string_copyright || tagsObject.copyright),
    character: parseTagString(raw.tag_string_character || tagsObject.character),
    general: parseTagString(raw.tag_string_general || tagsObject.general),
    meta: parseTagString(raw.tag_string_meta || tagsObject.meta),
  };
  if (!groups.general.length) {
    const typed = new Set([
      ...groups.artist,
      ...groups.copyright,
      ...groups.character,
      ...groups.meta,
    ]);
    groups.general = normalizeTags(raw).filter((tag) => !typed.has(tag));
  }
  return groups;
}

function findVariantUrl(
  variants: NonNullable<DanbooruRawPost['media_asset']>['variants'],
  names: string[],
): string {
  if (!variants) return '';
  for (const name of names) {
    const variant = variants.find((item) => {
      const type = String(item.type || item.name || item.variant || '').toLowerCase();
      return type === name || type.includes(name);
    });
    if (variant?.url) return variant.url;
  }
  return '';
}

function extensionFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    return pathname.split('.').pop() || '';
  } catch {
    return url.split('?')[0]?.split('.').pop() || '';
  }
}

function normalizeSource(raw: DanbooruRawPost, origin: string): string {
  const pixivId = normalizePixivId(raw.pixiv_id);
  if (pixivId) return pixivArtworkUrl(pixivId);

  const source = absoluteUrl(raw.source || '', origin);
  const sourcePixivId = extractPixivId(source);
  return sourcePixivId ? pixivArtworkUrl(sourcePixivId) : source;
}

function normalizePixivId(value: unknown): string {
  const id = String(value ?? '').trim();
  return /^\d+$/.test(id) ? id : '';
}

function extractPixivId(source: string): string {
  if (!source) return '';
  try {
    const url = new URL(source);
    const host = url.hostname.toLowerCase();
    if (host === 'www.pixiv.net' || host === 'pixiv.net') {
      const artworkMatch = url.pathname.match(/\/(?:en\/)?artworks\/(\d+)/);
      if (artworkMatch?.[1]) return artworkMatch[1];
      const illustId = url.searchParams.get('illust_id');
      if (illustId && /^\d+$/.test(illustId)) return illustId;
    }
    if (host.endsWith('pximg.net')) {
      const imageMatch = url.pathname.match(/\/(\d+)_p\d+(?:_[a-z0-9]+)?\.[a-z0-9]+$/i);
      if (imageMatch?.[1]) return imageMatch[1];
    }
  } catch {
    const imageMatch = source.match(/\/(\d+)_p\d+(?:_[a-z0-9]+)?\.[a-z0-9]+(?:\?|$)/i);
    if (imageMatch?.[1]) return imageMatch[1];
  }
  return '';
}

function pixivArtworkUrl(id: string): string {
  return `https://www.pixiv.net/artworks/${id}`;
}

function isPostFavorited(raw: DanbooruRawPost): boolean {
  return Boolean(
    raw.is_favorited ||
      raw.is_favorited_by_current_user ||
      raw.is_favorited_by_user ||
      raw.favorited ||
      raw.has_favorite ||
      raw.current_user_favorite ||
      raw.favorite_id,
  );
}
