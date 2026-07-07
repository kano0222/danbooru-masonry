# Danbooru Masonry

[中文说明](https://github.com/kano0222/danbooru-masonry/blob/main/README.zh-CN.md)

Adds masonry browsing, tag translation, immersive image viewing, and several helper features to Danbooru. This project is based on [asadahimeka/yandere-masonry](https://github.com/asadahimeka/yandere-masonry), simplified and adapted for Danbooru.

## Install

[Install from Greasy Fork](https://greasyfork.org/scripts/585986) (login is required because the script is marked as adult content)

[Install from Sleazy Fork](https://sleazyfork.org/scripts/585986) (login is not required)

[Install from GitHub Release](https://github.com/kano0222/danbooru-masonry/releases/latest/download/danbooru-masonry.user.js)

## Features

- Adds a masonry mode entry in the upper-right corner, with automatic Chinese tag translation on the left side.

![preview1](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/preview1.png)

- Masonry mode supports shortest-column layout, scroll loading, and automatic relayout. The top toolbar provides tag search, page jumping with arrow keys, and tag autocomplete. Hovering over a thumbnail shows the image size.

![preview2](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/preview2.png)

- The immersive viewer supports image/video preview, previous/next navigation, wheel navigation, Esc close, original-size zoom, and drag-to-pan. Clicking a tag in the upper-left corner opens the corresponding search page. The upper-right buttons, from left to right, open the source link, favorite the post (requires Danbooru login), zoom, open the post detail page, and exit.

![preview3](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/preview3.png)

## Notes

- Danbooru API requests use same-origin cookies and `Accept: application/json`. If HTML is returned, it usually means login, permission, redirect, Cloudflare/site interception, or API behavior has changed.
- Favorite state is determined by querying favorites for the current logged-in user.
- Favorite actions depend on the official page's `meta[name="csrf-token"]`, same-origin login cookie, and current user data on the page. Failures are shown as `收藏失败: ...`.
- Chinese tag translation is loaded from jsDelivr with a 2500ms timeout. Failure does not affect the main browsing features.

## License

This project is open source under the [MIT License](https://github.com/kano0222/danbooru-masonry/blob/main/LICENSE).

Copyright © 2026 kano0222
