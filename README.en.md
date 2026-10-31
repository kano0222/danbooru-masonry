# Danbooru Masonry

[中文说明](README.md)

Adds masonry browsing, tag translation, immersive image viewing, and several helper features to Danbooru. This project is based on [asadahimeka/yandere-masonry](https://github.com/asadahimeka/yandere-masonry), simplified and adapted for Danbooru.

The current translations come from [ffdkj-Danbooru_Tag-Chinese-English-Translation-Table](https://github.com/ffdkj/ffdkj-Danbooru_Tag-Chinese-English-Translation-Table). If you find an error, submit a correction through the [tag correction page](https://tagsuggest.zeabur.app).

<img src="https://count.getloli.com/@danbooru-masonry?theme=moebooru" alt="Moe Counter">

[Preview](https://kano0222.github.io/danbooru-masonry/)

## Install

[Install from Greasy Fork](https://greasyfork.org/scripts/585986) (login is required because the script is marked as adult content)

[Install from Sleazy Fork](https://sleazyfork.org/scripts/585986) (login is not required)

[Install from GitHub Release](https://github.com/kano0222/danbooru-masonry/releases/latest/download/danbooru-masonry.user.js)

## Features

- Adds a masonry mode entry in the upper-right corner of Danbooru pages. Tags in the original left sidebar are automatically shown with Chinese translations.

![preview1](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/preview1.png)

- Masonry
  - Infinite scrolling
  - Tag search and autocomplete
  - Hot and personal favorites shortcuts
  - Automatic search history with pinning, deletion, and Danbooru popular searches
  - Page navigation
  - Honors the logged-in user's Danbooru blacklist
  - Dark mode
- Thumbnails
  - Source and download actions
  - Optional image IDs and dimensions

![preview2](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/preview2.png)

- The settings panel supports:

  - Masonry
    - Automatically enter masonry mode (enabled by default)
    - Image list layout: masonry, grid, justified, or virtual masonry(default: masonry)
    - Thumbnail size: small / medium / big (default: big)
    - Show NSFW (enabled by default)
    - Show thumbnail action buttons (enabled by default)
    - Show thumbnail information (disabled by default)
    - Show masonry scrollbar (enabled by default)
  - Viewer
    - Use the mouse wheel to navigate images (enabled by default)
    - Load original files (disabled by default)
    - Preload 0–5 following still images (default: 2; 0 disables preloading)
    - Tag click behavior: new-tab masonry (default) or current-tab masonry
  - Other
    - Danbooru blacklist rule creation, autocomplete, removal confirmation, batch editing, and account synchronization
    - Download filename templates

![preview3](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/preview3.png)

- The immersive viewer supports image and video previews, navigation, zooming, favorites, downloads, and adding tags from the current post to the blacklist. Favorites and blacklist changes require a Danbooru login.

- Artist, character, and copyright tags are shown by default, with more tags available on expansion.

![preview4](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/preview4.png)

### Search History and Popular Searches

Click the search field to open search history and popular searches. Typing a tag switches the same panel to autocomplete; clicking the field again preserves the current suggestions, and clearing the input restores history. Popular searches show English and Chinese side by side. History cards retain the original query above a summary of translated content tags, omitting directives such as sort order; entries without translations show only the original query. Autocomplete retains its existing Chinese translations. Clicking history or popular searches runs the complete query from page 1; autocomplete only inserts a tag. The original Hot and personal favorites buttons remain beside the search field.

History initially shows eight entries. Use “展开更多” (show more) below the list to view all entries, or “收起” (collapse) to restore the compact view. Closing and reopening resets the compact view. The panel hides scrollbars but remains scrollable when content exceeds the available height. Enable “隐藏热门搜索” (hide popular searches) in Settings to show 16 history entries by default and stop requesting popular searches.

Use the pin in an entry's upper-left corner to pin or unpin it. Pinned entries appear first, are retained indefinitely, and cannot be deleted directly. Unpinning moves an entry to the front of ordinary history. Up to 20 unpinned entries are kept; the oldest are removed when the limit is exceeded, and reused entries move to the front. Pinned entries do not count toward this limit. The upper-right cross deletes an unpinned entry; it appears on hover or keyboard focus and stays visible on touch devices. Deletion is immediate, without confirmation or undo.

Submitting a search or selecting history or popular searches records the query. Empty searches, Hot and personal favorites shortcuts, viewer tag clicks, page navigation, and refreshes do not add entries. History is stored locally in userscript storage without syncing to your Danbooru account.

Popular searches come from the site's [Popular Searches](https://danbooru.donmai.us/explore/posts/searches) ranking, with up to 10 entries. This ranks search queries and is distinct from Hot images. If today's ranking is empty, the previous day is requested once (using UTC dates). The section is hidden if that ranking is also empty or the endpoint is unavailable; search history remains usable.

### Download Filename Templates

Download filename templates support the following placeholders:

- `{original}`: original filename without extension
- `{artist}`: Danbooru artist tag
- `{username}`: username parsed from the source URL, falling back to the artist tag
- `{userid}`: user ID parsed from the source URL
- `{id}`: source work/post ID, falling back to the Danbooru ID
- `{postid}`: Danbooru ID

Templates use data from Danbooru and source URLs to generate filenames. Click **Save** after editing or restoring defaults.

### Mirror Site Support

This script supports gallery mirror sites based on [Danbooru](https://github.com/danbooru/danbooru).

If the script does not run on the domain you use, you can add the site URL to _User matches_ yourself: script editor - Settings - Includes/Excludes - User matches - Add.

![userMatches](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/userMatches.png)

## Notes

- Masonry blacklist filtering supports positive and negative tags, `*` wildcards, and `rating`, `score`, and `status` metatags; other rules are saved to Danbooru but do not apply in masonry mode.

## TODO

- Viewer action layout.

## Credits

- [asadahimeka/yandere-masonry](https://github.com/asadahimeka/yandere-masonry), the original project on which Danbooru Masonry is based.
- [ffdkj-Danbooru_Tag-Chinese-English-Translation-Table](https://github.com/ffdkj/ffdkj-Danbooru_Tag-Chinese-English-Translation-Table), for providing the Chinese tag translations.

## License

This project is open source under the [MIT License](https://github.com/kano0222/danbooru-masonry/blob/main/LICENSE). Images in the static preview remain the property of their creators and are not covered by the project's MIT license; the preview's source buttons link to the original posts.

Copyright © 2026 kano0222
