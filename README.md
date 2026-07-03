# Danbooru Masonry

Danbooru Masonry is a userscript that adds an opt-in masonry browsing mode to Danbooru. It keeps the original `/posts` page intact until you click **Masonry mode**.

## Features

- Masonry grid with infinite scroll, default 220px cards, and shortest-column layout.
- Tag search and Danbooru autocomplete.
- Optional Chinese tag translations loaded from jsDelivr with a short timeout.
- Image/video viewer with keyboard navigation, wheel navigation, original-size zoom, dragging, source link, post link, and favorite toggle.
- Adapter layer for official Danbooru and local Danbooru development mirrors.

## Supported Sites

- `https://danbooru.donmai.us/posts*`
- `https://danbooru.donmai.us/`
- `http://localhost:3000/posts*`
- `http://localhost:3000/`
- `http://127.0.0.1:3000/posts*`
- `http://127.0.0.1:3000/`

## Install

1. Install Tampermonkey or Violentmonkey.
2. Build or download `dist/danbooru-masonry.user.js`.
3. Open the `.user.js` file URL in the browser and confirm installation.

For GitHub Releases, publish `dist/danbooru-masonry.user.js` as the install/update asset.

## Development

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm lint
pnpm build
```

`pnpm build` writes `dist/danbooru-masonry.user.js`.

## Notes

Official Danbooru API requests use same-origin cookies and `Accept: application/json`. If Danbooru returns HTML instead of JSON, the script reports a likely login, permission, redirect, Cloudflare, or interception problem.

Favorites use Danbooru's same-origin favorites endpoints and the page CSRF token. If no logged-in user is detected, the button shows `未检测到登录状态`.

Tag translation is best-effort. If the jsDelivr request fails or times out after 2500ms, browsing continues without Chinese labels.

This project references the engineering organization of `nhentai-helper` and `yandere-masonry`, but does not copy their code. It is MIT licensed.

## Manual Test Checklist

- Official Danbooru `/posts` page shows the **Masonry mode** button.
- Official Danbooru `/` page shows the **Masonry mode** button.
- Clicking it does not white-screen.
- Default posts load.
- Searching a tag loads matching results.
- Infinite scroll loads the next page.
- Autocomplete returns candidates.
- Chinese tag translation failure does not block browsing.
- Clicking a card opens the viewer.
- Left/right navigation, wheel navigation, and Esc close work.
- Original-size zoom and dragging work.
- Source button opens the source.
- Post button opens the official post page.
- Favorite/unfavorite works when logged in; logged-out failures are visible on the button.
- Local `localhost:3000/posts` still works for debugging.
- `pnpm build` generates `dist/danbooru-masonry.user.js`.
