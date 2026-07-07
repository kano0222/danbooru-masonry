# Danbooru Masonry

[中文说明](https://github.com/kano0222/danbooru-masonry/blob/main/README.zh-CN.md)
Adds masonry browsing, tag translation, immersive image viewing, and several helper features to Danbooru. This project is based on [asadahimeka/yandere-masonry](https://github.com/asadahimeka/yandere-masonry), simplified and adapted for Danbooru.

## Install

1. Install Tampermonkey or Violentmonkey.
2. Get or build `dist/danbooru-masonry.js`.
3. Open the built userscript file in your browser and confirm installation.

## Features

- Danbooru masonry mode with shortest-column layout, infinite scroll, and automatic relayout.
- Toolbar with tag search, page jumping, Danbooru autocomplete, keyboard selection, and common order/rating suggestions.
- Optional Chinese tag translation with graceful fallback when translation data fails to load or times out.
- Immersive viewer for image/video preview, previous/next navigation, wheel navigation, Esc close, original-size zoom, and drag-to-pan.
- Viewer actions for opening the post page, opening source links, Pixiv source normalization, and favorite helper actions when logged in.

## Notes

- Danbooru API requests use same-origin cookies and `Accept: application/json`. If HTML is returned, it usually means login, permission, redirect, Cloudflare/site interception, or API behavior has changed.
- Favorite state is determined by querying favorites for the current logged-in user.
- Favorite actions depend on the official page's `meta[name="csrf-token"]`, same-origin login cookie, and current user data on the page. Failures are shown as `收藏失败: ...`.
- Chinese tag translation is loaded from jsDelivr with a 2500ms timeout. Failure does not affect the main browsing features.

## License

This project is open source under the [MIT License](https://github.com/kano0222/danbooru-masonry/blob/main/LICENSE).

Copyright © 2026 kano0222
