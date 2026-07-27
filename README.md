# Danbooru Masonry

[中文说明](https://github.com/kano0222/danbooru-masonry/blob/main/README.zh-CN.md)

Adds masonry browsing, tag translation, immersive image viewing, and several helper features to Danbooru. This project is based on [asadahimeka/yandere-masonry](https://github.com/asadahimeka/yandere-masonry), simplified and adapted for Danbooru.

## Install

[Install from Greasy Fork](https://greasyfork.org/scripts/585986) (login is required because the script is marked as adult content)

[Install from Sleazy Fork](https://sleazyfork.org/scripts/585986) (login is not required)

[Install from GitHub Release](https://github.com/kano0222/danbooru-masonry/releases/latest/download/danbooru-masonry.user.js)

## Features

- Adds a masonry mode entry in the upper-right corner of Danbooru pages. Tags in the original left sidebar are automatically shown with Chinese translations.

![preview1](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/preview1.png)

- Masonry mode supports shortest-column layout, scroll loading, and automatic relayout on viewport changes. The top toolbar provides tag search, page jumping, arrow-key page navigation, and tag autocomplete.

- Hovering over a thumbnail shows the Danbooru image ID and image size. Thumbnails also provide source and download buttons. The settings panel can control thumbnail display behavior and masonry image size.

![preview2](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/preview2.png)

- The settings panel supports:

  - Masonry image size: small / medium / big
  - Thumbnail buttons shown by default
  - Thumbnail info hidden by default
  - Wheel navigation
  - Use original file in viewer
  - Per-source download filename templates

![preview3](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/preview3.png)

- The immersive viewer supports image/video preview, previous/next navigation, wheel navigation, Esc close, original-size zoom, and drag-to-pan. Clicking a tag in the upper-left corner opens the corresponding search page. The upper-right buttons, from left to right, open the source link, favorite the post (requires Danbooru login), zoom, open the post detail page, download the original file with a source-aware filename, and exit.

![preview4](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/preview4.png)

### Download Filename Templates

Download filename templates support the following placeholders:

- `{original}`: original filename without extension
- `{artist}`: Danbooru artist tag
- `{username}`: username parsed from the source URL, falling back to the artist tag
- `{userid}`: user ID parsed from the source URL
- `{id}`: source work/post ID, falling back to the Danbooru ID
- `{postid}`: Danbooru ID
- `{ext}`: file extension

Templates are generated only from Danbooru API data and source URL parsing results. The script does not request Pixiv, Bilibili, Weibo, or other source pages for extra metadata.

### Mirror Site Support

This script supports gallery mirror sites based on [Danbooru](https://github.com/danbooru/danbooru).

If the script does not run on the domain you use, you can add the site URL to *User matches* yourself: script editor - Settings - Includes/Excludes - User matches - Add.

![userMatches](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/userMatches.png)

## Notes

- Danbooru API requests use same-origin cookies and `Accept: application/json`. If HTML is returned, it usually means login, permission, redirect, Cloudflare/site interception, or API behavior has changed.
- Favorite state is determined by querying favorites for the current logged-in user.
- Favorite actions depend on the official page's `meta[name="csrf-token"]`, same-origin login cookie, and current user data on the page. Failures are shown as `收藏失败: ...`.
- Chinese tag translation is loaded from jsDelivr with a 2500ms timeout. Failure does not affect the main browsing features.

## License

This project is open source under the [MIT License](https://github.com/kano0222/danbooru-masonry/blob/main/LICENSE).

Copyright © 2026 kano0222
