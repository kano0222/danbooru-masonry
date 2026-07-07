# Danbooru 瀑布流浏览

为 Danbooru 增加瀑布流浏览、标签翻译和沉浸式图片查看以及一些辅助功能，基于 [asadahimeka/yandere-masonry](https://github.com/asadahimeka/yandere-masonry) 简化改进而来。

## 安装

[从 Greasy Fork 安装](https://greasyfork.org/scripts/585986)（由于成人内容，需要登录才能安装）

[从 Sleazy Fork 安装](https://sleazyfork.org/scripts/585986)（不需要登录）

[从 GitHub Release 安装](https://github.com/kano0222/danbooru-masonry/releases/latest/download/danbooru-masonry.js)

## 主要功能

- 在右上角增加瀑布流模式入口，左侧标签自动翻译。

![preview1](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/preview1.png)

- 瀑布流支持最短列布局、下拉加载和布局自动重排。顶栏提供标签搜索、页码跳转（可以使用方向键）、标签自动补全。鼠标移到缩略图上会显示图片大小。

![preview2](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/preview2.png)

- 沉浸式 viewer 支持图片/视频预览、左右切换、滚轮切换、Esc 关闭、原图缩放和拖拽查看。点击左上角标签会打开对应搜索页，右上角按钮从左到右是打开来源链接、收藏（需登录danbooru）、放大查看、打开详情页、退出

![preview3](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/preview3.png)

## 注意事项

- Danbooru API 请求使用同源 cookie 和 `Accept: application/json`。如果返回 HTML，通常代表未登录、权限不足、被重定向、Cloudflare/站点拦截，或接口行为变化。
- 收藏状态通过当前登录用户的 favorites 查询结果判断。
- 收藏操作依赖官方页面中的 `meta[name="csrf-token"]`、同源登录 cookie 和页面上的当前用户数据。失败时会显示 `收藏失败: ...`。
- 中文标签翻译来自 jsDelivr，超时时间为 2500ms。失败不影响主要浏览功能。

## License

本项目采用 [MIT License](https://github.com/kano0222/danbooru-masonry/blob/main/LICENSE) 开源。

Copyright © 2026 kano0222
