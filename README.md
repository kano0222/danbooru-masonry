# Danbooru Masonry

[中文说明](https://github.com/kano0222/danbooru-masonry/blob/main/README.zh-CN.md)

Adds masonry browsing, tag translation, immersive image viewing, and several helper features to Danbooru. This project is based on [asadahimeka/yandere-masonry](https://github.com/asadahimeka/yandere-masonry), simplified and adapted for Danbooru.

The current translations come from [ffdkj-Danbooru_Tag-Chinese-English-Translation-Table](https://github.com/ffdkj/ffdkj-Danbooru_Tag-Chinese-English-Translation-Table). If you find an error, submit a correction through the [tag correction page](https://tagsuggest.zeabur.app).

<img src="https://count.getloli.com/@danbooru-masonry?theme=moebooru" alt="Moe Counter">

## Install

[Install from Greasy Fork](https://greasyfork.org/scripts/585986) (login is required because the script is marked as adult content)

[Install from Sleazy Fork](https://sleazyfork.org/scripts/585986) (login is not required)

[Install from GitHub Release](https://github.com/kano0222/danbooru-masonry/releases/latest/download/danbooru-masonry.user.js)

## Features

- Adds a masonry mode entry in the upper-right corner of Danbooru pages. Tags in the original left sidebar are automatically shown with Chinese translations.

![preview1](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/preview1.png)

- Masonry mode supports scroll loading, tag search, page jumping, and tag autocomplete, and follows the logged-in user's Danbooru blacklist.

- Thumbnails provide source and download links and can show image IDs and dimensions.

![preview2](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/preview2.png)

- The settings panel supports:

  - Thumbnails
    - Thumbnail size: small / medium / big
    - Show NSFW (enabled by default)
    - Show thumbnail action buttons (enabled by default)
    - Show thumbnail information (disabled by default)
    - Show masonry scrollbar (enabled by default)
    - Show back-to-top button (enabled by default)
  - Viewer
    - Use the mouse wheel to navigate images (enabled by default)
    - Load original files (disabled by default)
    - Show viewer tag entry (enabled by default)
    - Tag click behavior: new-tab masonry (default), original search in a new tab, or current-tab masonry
  - Other
    - Danbooru blacklist rule editing and account synchronization
    - Download filename templates

![preview3](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/preview3.png)

- The immersive viewer supports image and video previews, navigation, zooming, favorites, and downloads. Favorites require a Danbooru login.

- Artist, character, and copyright tags are shown by default, with more tags available on expansion.

![preview4](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/preview4.png)

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

If the script does not run on the domain you use, you can add the site URL to *User matches* yourself: script editor - Settings - Includes/Excludes - User matches - Add.

![userMatches](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/userMatches.png)

## Notes

- Masonry blacklist filtering supports positive and negative tags, `*` wildcards, and `rating`, `score`, and `status` metatags; other rules are saved to Danbooru but do not apply in masonry mode.

## Credits

- [asadahimeka/yandere-masonry](https://github.com/asadahimeka/yandere-masonry), the original project on which Danbooru Masonry is based.
- [ffdkj-Danbooru_Tag-Chinese-English-Translation-Table](https://github.com/ffdkj/ffdkj-Danbooru_Tag-Chinese-English-Translation-Table), for providing the Chinese tag translations.

## License

This project is open source under the [MIT License](https://github.com/kano0222/danbooru-masonry/blob/main/LICENSE).

Copyright © 2026 kano0222
