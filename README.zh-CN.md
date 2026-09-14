# Danbooru 瀑布流浏览

为 Danbooru 提供瀑布流浏览、标签翻译、沉浸式图片查看及其他辅助功能。本项目基于 [asadahimeka/yandere-masonry](https://github.com/asadahimeka/yandere-masonry) 简化并适配 Danbooru。

当前翻译来源于 [ffdkj-Danbooru_Tag-Chinese-English-Translation-Table](https://github.com/ffdkj/ffdkj-Danbooru_Tag-Chinese-English-Translation-Table)，如有错误，可访问 [标签纠错页面](https://tagsuggest.zeabur.app) 提交纠错。

<img src="https://count.getloli.com/@danbooru-masonry?theme=moebooru" alt="Moe Counter">

## 安装

[从 Greasy Fork 安装](https://greasyfork.org/scripts/585986)（由于成人内容，需要登录才能安装）

[从 Sleazy Fork 安装](https://sleazyfork.org/scripts/585986)（不需要登录）

[从 GitHub Release 安装](https://github.com/kano0222/danbooru-masonry/releases/latest/download/danbooru-masonry.user.js)

## 主要功能

- 在 Danbooru 页面右上角增加瀑布流模式入口，原页面左侧标签会自动显示中文翻译。

![preview1](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/preview1.png)

- 瀑布流支持最短列布局、滚动加载和窗口变化自动重排。顶部工具栏提供标签搜索、页码跳转、上下方向键翻页和标签自动补全；点击左上角的 Danbooru 标题可以退出瀑布流。向下滚动一定距离后，右下角会显示“回到顶部”按钮。瀑布流会遵循进入模式时读取的 Danbooru 黑名单设置。

- 鼠标悬停在缩略图上时会显示 Danbooru 图片 ID 和尺寸，并提供打开来源和下载按钮。可以在设置中控制缩略图信息、操作按钮及瀑布流图片大小。

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
    - 显示详情标签入口（默认开启）
    - 默认展开标签窗口（默认关闭）
    - 标签点击行为：新标签页瀑布流搜索（默认）、新标签页原站搜索、当前页瀑布流搜索
  - 其他
    - Danbooru 黑名单规则编辑与账号同步
    - 下载文件名模板

![preview3.1](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/preview3.1.png)

![preview3.2](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/preview3.2.png)

- 沉浸式查看器支持图片和视频预览、左右方向键切换、滚轮切换、Esc 关闭、原图缩放及拖拽查看。右上角按钮依次用于打开来源、收藏帖子（需要登录 Danbooru）、缩放、打开帖子详情页、下载原文件和退出查看器。

- 查看器左下角提供标签入口，可展开浏览其他普通标签及其中文翻译。查看器中的所有标签均遵循设置的点击行为：在原站新标签页搜索、在当前页切换瀑布流搜索，或在新标签页自动启动瀑布流搜索。标签搜索会使用所点击的标签替换原查询。

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

该脚本支持基于 [Danbooru](https://github.com/danbooru/danbooru) 的图库镜像站。

如脚本没有在你使用的域名上运行，可自行将网址加入 *用户匹配*（脚本编辑 → 设置 → 包括/排除 → 用户匹配 → 添加）。

![userMatches](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/userMatches.png)

## 注意事项

- 登录后可在瀑布流设置面板编辑 Danbooru 黑名单规则。保存成功后会同步到账号并立即重新过滤已加载帖子。当前支持正负标签、`*` 通配符以及 `rating`、`score`、`status` 常用元标签；无法解析的规则仍会保存到 Danbooru，但不会在瀑布流中隐藏帖子。
- Danbooru API 请求使用同源 cookie 和 `Accept: application/json`。如果返回 HTML，通常代表未登录、权限不足、被重定向、Cloudflare/站点拦截，或接口行为变化。
- 收藏操作依赖官方页面中的 `meta[name="csrf-token"]`、同源登录 cookie 和页面上的当前用户数据。失败时会显示 `收藏失败: ...`。

## 致谢

- [asadahimeka/yandere-masonry](https://github.com/asadahimeka/yandere-masonry)：Danbooru Masonry 所基于的原始项目。
- [ffdkj-Danbooru_Tag-Chinese-English-Translation-Table](https://github.com/ffdkj/ffdkj-Danbooru_Tag-Chinese-English-Translation-Table)：提供中文标签翻译数据。

## License

本项目采用 [MIT License](https://github.com/kano0222/danbooru-masonry/blob/main/LICENSE) 开源。

Copyright © 2026 kano0222
