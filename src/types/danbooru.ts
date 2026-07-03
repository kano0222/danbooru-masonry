export interface DanbooruRawPost {
  id?: number | string;
  file_url?: string | null;
  large_file_url?: string | null;
  sample_file_url?: string | null;
  sample_url?: string | null;
  preview_file_url?: string | null;
  preview_url?: string | null;
  image_width?: number | string | null;
  image_height?: number | string | null;
  width?: number | string | null;
  height?: number | string | null;
  file_ext?: string | null;
  tag_string?: string | string[] | null;
  tag_string_artist?: string | null;
  tag_string_copyright?: string | null;
  tag_string_character?: string | null;
  tag_string_general?: string | null;
  tag_string_meta?: string | null;
  tags?: string | Record<string, string[] | string> | null;
  rating?: string | null;
  score?: number | string | null;
  source?: string | null;
  pixiv_id?: number | string | null;
  is_deleted?: boolean | null;
  is_banned?: boolean | null;
  is_favorited?: boolean | null;
  is_favorited_by_current_user?: boolean | null;
  is_favorited_by_user?: boolean | null;
  favorited?: boolean | null;
  has_favorite?: boolean | null;
  current_user_favorite?: unknown;
  favorite_id?: number | string | null;
  fav_count?: number | string | null;
  media_asset?: {
    image_width?: number | string | null;
    image_height?: number | string | null;
    variants?: Array<{
      type?: string | null;
      name?: string | null;
      variant?: string | null;
      url?: string | null;
    }>;
  } | null;
}
