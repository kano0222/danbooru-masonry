# Official Danbooru Adapter

The official adapter targets `https://danbooru.donmai.us`.

- Posts: `GET /posts.json?tags=...&page=...`
- Autocomplete: `GET /autocomplete.json?search[type]=tag_query&search[query]=...`
- Create favorite: `POST /favorites?post_id=...`
- Delete favorite: `POST /favorites/:post_id` with `_method=delete`
- Check current user's favorite state: `GET /favorites.json?search[post_id]=...&search[user_id]=...`

All requests use same-origin credentials and JSON accept headers. Favorites include `X-CSRF-Token` from `meta[name="csrf-token"]`.
Favorite writes first check `body[data-current-user-id]` and `body[data-current-user-is-anonymous]`; if no logged-in user is detected, the viewer button shows `未检测到登录状态`.
`fav_count` is only the number of favorites on a post, not whether the current user has favorited it.

Manual verification for favorites:

1. Log in to official Danbooru.
2. Open `/posts`, start Masonry mode, open a post.
3. Click favorite and confirm the post is favorited on its detail page.
4. Click again and confirm it is removed.
5. Repeat while logged out and verify the UI shows a temporary failure instead of breaking.

If Danbooru changes favorite routes, update `src/api/favorites.ts` and this document together.
