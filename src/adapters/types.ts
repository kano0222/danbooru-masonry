export interface GetPostsParams {
  tags: string;
  page: number;
  pageUrlSearch?: string;
}

export interface AutocompleteItem {
  value: string;
  count: string;
  category: string;
}

export interface TagGroups {
  artist: string[];
  copyright: string[];
  character: string[];
  general: string[];
  meta: string[];
}

export interface Post {
  id: string;
  raw: unknown;
  fileUrl: string;
  largeUrl: string;
  sampleUrl: string;
  previewUrl: string;
  listUrl: string;
  viewerUrl: string;
  width: number;
  height: number;
  aspectRatio: number;
  tags: string[];
  tagGroups: TagGroups;
  rating: string;
  score: number;
  source: string;
  fileExt: string;
  isVideo: boolean;
  favorited: boolean;
  available: boolean;
}

export interface BooruAdapter {
  siteName: string;
  origin: string;
  isMatch(location: Location): boolean;
  getPosts(params: GetPostsParams): Promise<Post[]>;
  getAutocomplete(query: string): Promise<AutocompleteItem[]>;
  createFavorite(postId: string): Promise<void>;
  deleteFavorite(postId: string): Promise<void>;
  isFavorited?(postId: string): Promise<boolean>;
  getPostUrl(postId: string, currentTags?: string): string;
  getPostsPageUrl(tags?: string, page?: number): string;
  normalizePost(raw: unknown): Post;
}
