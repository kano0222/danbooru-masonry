# Danbooru 瀑布流浏览

为 Danbooru 增加瀑布流浏览、标签翻译和沉浸式图片查看以及一些辅助功能，基于 [asadahimeka/yandere-masonry](https://github.com/asadahimeka/yandere-masonry) 简化改进而来。

## 安装

1. 安装 Tampermonkey 或 Violentmonkey。
2. 获取或构建 `dist/danbooru-masonry.js`。
3. 在浏览器中打开该构建产物并确认安装。

## 主要功能

- Danbooru 瀑布流模式，支持最短列布局、下拉加载和布局自动重排。
- 顶栏提供标签搜索、页码跳转、Danbooru autocomplete、键盘选择和常用排序/分级建议。
- 可选中文标签翻译，翻译数据加载失败或超时时会自动降级。
- 沉浸式 viewer 支持图片/视频预览、左右切换、滚轮切换、Esc 关闭、原图缩放和拖拽查看。
- viewer 内提供打开详情页、打开来源链接、Pixiv 来源归一化，以及登录状态下的收藏辅助操作。

## 注意事项
- Danbooru API 请求使用同源 cookie 和 `Accept: application/json`。如果返回 HTML，通常代表未登录、权限不足、被重定向、Cloudflare/站点拦截，或接口行为变化。
- 收藏状态通过当前登录用户的 favorites 查询结果判断。
- 收藏操作依赖官方页面中的 `meta[name="csrf-token"]`、同源登录 cookie 和页面上的当前用户数据。失败时会显示 `收藏失败: ...`。
- 中文标签翻译来自 jsDelivr，超时时间为 2500ms。失败不影响主要浏览功能。

## License

本项目采用 [MIT License](https://github.com/kano0222/danbooru-masonry/blob/main/LICENSE) 开源。

Copyright © 2026 kano0222