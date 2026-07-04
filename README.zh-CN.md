# Danbooru Masonry

Danbooru Masonry 是一个 Danbooru 浏览增强 userscript。它会在 `/posts` 页面右上角注入 **Masonry mode** 按钮，只有点击后才进入瀑布流模式，不会默认破坏原站页面。

## 功能

- 瀑布流浏览、最短列布局、无限滚动。
- 顶栏标签搜索和 Danbooru autocomplete。
- 中文标签翻译增强，加载失败会静默降级。
- 图片/视频 viewer，支持左右切换、滚轮切换、Esc 关闭、原图缩放、拖拽、打开来源、打开详情、收藏/取消收藏。
- 通过 adapter 区分官方 Danbooru 和本地调试站点。

## 支持站点

- `https://danbooru.donmai.us/posts*`
- `https://danbooru.donmai.us/`

## 安装

1. 安装 Tampermonkey 或 Violentmonkey。
2. 获取或构建 `dist/danbooru-masonry.user.js`。
3. 在浏览器中打开该 `.user.js` 文件并确认安装。

## 开发与构建

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm lint
pnpm build
pnpm build:local
```

构建产物为 `dist/danbooru-masonry.user.js`。

## 常见问题

如果 posts 或 autocomplete 返回 HTML，通常代表未登录、权限不足、被重定向、Cloudflare/站点拦截，或接口行为变化。

收藏功能依赖官方页面中的 `meta[name="csrf-token"]`、同源登录 cookie 和 `body` 上的当前用户数据。未登录时按钮会短暂显示 `未检测到登录状态`。

中文标签翻译来自 jsDelivr，超时时间为 2500ms。失败不影响主功能。

本项目只参考 `nhentai-helper` 和 `yandere-masonry` 的工程组织和功能设计，不复制 GPL 项目代码。
