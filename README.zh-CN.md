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

- 瀑布流支持滚动加载、标签搜索、页码跳转和标签自动补全，并遵循登录用户的 Danbooru 黑名单。

- 缩略图提供来源和下载入口，可显示图片 ID 和尺寸。

![preview2](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/preview2.png)

- 设置页支持以下配置：

  - 缩略图
    - 缩略图大小：小 / 中 / 大
    - 显示 NSFW（默认开启）
    - 显示缩略图操作按钮（默认开启）
    - 显示缩略图信息（默认关闭）
    - 显示瀑布流滚动条（默认开启）
    - 显示回到顶部按钮（默认开启）
  - 详情
    - 使用滚轮切换图片（默认开启）
    - 加载原图（默认关闭）
    - 显示详情标签入口（默认开启）
    - 标签点击行为：新标签页瀑布流搜索（默认）、新标签页原站搜索、当前页瀑布流搜索
  - 其他
    - Danbooru 黑名单规则编辑与账号同步
    - 下载文件名模板

![preview3](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/preview3.png)

- 沉浸式查看器支持图片和视频预览、切换、缩放、收藏及下载。收藏需要登录 Danbooru。

- 默认显示画师、角色和版权标签，更多标签可展开查看。

![preview4](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/preview4.png)

### 下载文件名模板

下载文件名模板支持以下占位符：

- `{original}`：原文件名，不含后缀
- `{artist}`：Danbooru 画师标签
- `{username}`：来源 URL 可解析到的用户名，缺失时回退到画师标签
- `{userid}`：来源 URL 可解析到的用户 ID
- `{id}`：来源作品 ID，缺失时回退到 Danbooru ID
- `{postid}`：Danbooru ID

模板从 Danbooru 和来源 URL 获取数据生成文件名。修改或恢复默认后需点击“保存”。

### 镜像站支持

该脚本支持基于 [Danbooru](https://github.com/danbooru/danbooru) 的图库镜像站。

如脚本没有在你使用的域名上运行，可自行将网址加入 *用户匹配*（脚本编辑 → 设置 → 包括/排除 → 用户匹配 → 添加）。

![userMatches](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/userMatches.png)

## 注意事项

- 瀑布流黑名单支持正负标签、`*` 通配符及 `rating`、`score`、`status` 元标签；其他规则仍会保存到 Danbooru，但不会在瀑布流中生效。

## 致谢

- [asadahimeka/yandere-masonry](https://github.com/asadahimeka/yandere-masonry)：Danbooru Masonry 所基于的原始项目。
- [ffdkj-Danbooru_Tag-Chinese-English-Translation-Table](https://github.com/ffdkj/ffdkj-Danbooru_Tag-Chinese-English-Translation-Table)：提供中文标签翻译数据。

## License

本项目采用 [MIT License](https://github.com/kano0222/danbooru-masonry/blob/main/LICENSE) 开源。

Copyright © 2026 kano0222
