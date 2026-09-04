# Danbooru 瀑布流浏览

为 Danbooru 增加瀑布流浏览、标签翻译和沉浸式图片查看以及一些辅助功能，基于 [asadahimeka/yandere-masonry](https://github.com/asadahimeka/yandere-masonry) 简化改进而来。

## 安装

[从 Greasy Fork 安装](https://greasyfork.org/scripts/585986)（由于成人内容，需要登录才能安装）

[从 Sleazy Fork 安装](https://sleazyfork.org/scripts/585986)（不需要登录）

[从 GitHub Release 安装](https://github.com/kano0222/danbooru-masonry/releases/latest/download/danbooru-masonry.user.js)

## 主要功能

- 在 Danbooru 页面右上角增加瀑布流模式入口，原页面左侧标签会自动显示中文翻译。

![preview1](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/preview1.png)

- 瀑布流支持最短列布局、下拉加载和窗口变化自动重排。顶部工具栏提供标签搜索、页码跳转、方向键翻页和标签自动补全。瀑布流会遵循进入模式时的 Danbooru 黑名单设置。下拉一定高度会显示回到顶部按钮。

- 鼠标移到缩略图上会显示danbooru的图片ID和图片尺寸，提供打开来源和下载按钮。可以在设置中控制是否显示和修改瀑布流图片大小。

![preview2](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/preview2.png)

- 设置页支持以下配置：

  - 缩略图
    - 缩略图大小：小 / 中 / 大
    - 显示缩略图操作按钮（默认开启）
    - 显示缩略图信息（默认关闭）
    - 显示瀑布流滚动条（默认开启）
    - 显示回到顶部按钮（默认开启）
  - 详情
    - 使用滚轮切换图片（默认开启）
    - 加载原图（默认关闭）
  - 其他
    - Danbooru 黑名单规则编辑与账号同步
    - 下载文件名模板

![preview3](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/preview3.png)

![preview3.1](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/preview3.1.png)

- 沉浸式 viewer 支持图片/视频预览、左右切换、滚轮切换、Esc 关闭、原图缩放和拖拽查看。点击左上角标签会打开对应搜索页，右上角按钮从左到右是打开来源链接、收藏（需登录danbooru）、放大查看、打开详情页、下载（默认原图，文件名按主流来源生成）、退出

![preview4](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/preview4.png)

### 下载文件名模板

下载文件名模板支持以下占位符：

- `{original}`：原文件名，不含后缀
- `{artist}`：Danbooru 画师标签
- `{username}`：来源 URL 可解析到的用户名，缺失时回退到画师标签
- `{userid}`：来源 URL 可解析到的用户 ID
- `{id}`：来源作品 ID，缺失时回退到 Danbooru ID
- `{postid}`：Danbooru ID
- `{ext}`：文件后缀

模板只基于 Danbooru API 返回的数据和 source URL 解析结果生成，不会额外请求 Pixiv、Bilibili、微博等原站页面。
模板不能为空，手动修改后会在输入框失焦时自动保存。点击“恢复默认”后可在按钮附近确认，确认后会立即恢复并保存默认模板。

### 镜像站支持

该脚本支持基于[danbooru](https://github.com/danbooru/danbooru)的图库镜像站

如脚本没有在你使用的域名上运行，可自行将网址加入 *用户匹配*（脚本编辑-设置-包括/排除-用户匹配-添加）

![userMatches](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/userMatches.png)

## 注意事项

- 登录后可在瀑布流设置面板编辑 Danbooru 黑名单规则。保存成功后会同步到账号并立即重新过滤已加载帖子。当前支持正负标签、`*` 通配符以及 `rating`、`score`、`status` 常用元标签；无法解析的规则仍会保存到 Danbooru，但不会在瀑布流中隐藏帖子。
- Danbooru API 请求使用同源 cookie 和 `Accept: application/json`。如果返回 HTML，通常代表未登录、权限不足、被重定向、Cloudflare/站点拦截，或接口行为变化。
- 收藏状态通过当前登录用户的 favorites 查询结果判断。
- 收藏操作依赖官方页面中的 `meta[name="csrf-token"]`、同源登录 cookie 和页面上的当前用户数据。失败时会显示 `收藏失败: ...`。
- 中文标签翻译来自 jsDelivr，超时时间为 2500ms。失败不影响主要浏览功能。

## License

本项目采用 [MIT License](https://github.com/kano0222/danbooru-masonry/blob/main/LICENSE) 开源。

Copyright © 2026 kano0222
