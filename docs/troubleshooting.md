# Troubleshooting

## Posts Do Not Load

Open the browser console. A JSON error usually means Danbooru returned HTML. Check login state, permissions, Cloudflare/interception, and whether the request was redirected.

## Autocomplete Is Empty

Autocomplete is best-effort and closes silently on errors. Check the network request to `/autocomplete.json`.

## Chinese Labels Are Missing

The translation file is loaded from jsDelivr with a 2500ms timeout. Failure is expected on slow or blocked networks and does not affect browsing.

## Favorites Fail

Make sure you are logged in and the page includes `meta[name="csrf-token"]`. If a 403 or 404 appears, verify the official favorite endpoints in `docs/official-danbooru-adapter.md`.
