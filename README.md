# Danbooru 瀑布流浏览

[English](README.en.md)

为 Danbooru 提供瀑布流浏览、标签翻译、沉浸式图片查看及其他辅助功能。本项目基于 [asadahimeka/yandere-masonry](https://github.com/asadahimeka/yandere-masonry) 简化并适配 Danbooru。

当前翻译来源于 [ffdkj-Danbooru_Tag-Chinese-English-Translation-Table](https://github.com/ffdkj/ffdkj-Danbooru_Tag-Chinese-English-Translation-Table)，如有错误，可访问 [标签纠错页面](https://tagsuggest.zeabur.app) 提交纠错。

<img src="https://count.getloli.com/@danbooru-masonry?theme=moebooru" alt="Moe Counter">

[静态预览](https://kano0222.github.io/danbooru-masonry/)

## 安装

[从 Greasy Fork 安装](https://greasyfork.org/scripts/585986)（由于成人内容，需要登录才能安装）

[从 Sleazy Fork 安装](https://sleazyfork.org/scripts/585986)（不需要登录）

[从 GitHub Release 安装](https://github.com/kano0222/danbooru-masonry/releases/latest/download/danbooru-masonry.user.js)

## 主要功能

- 在 Danbooru 页面右上角增加瀑布流模式入口，原页面左侧标签会自动显示中文翻译。

![preview1](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/preview1.png)

- 瀑布流
  - 滚动加载
  - 标签搜索和标签自动补全
  - 热门与个人收藏快捷搜索
  - 自动保存搜索历史，支持固定、删除及查看 Danbooru 热门搜索
  - 页码跳转
  - 遵循登录用户的 Danbooru 黑名单
  - 夜间模式
- 缩略图
  - 提供来源和下载入口
  - 可显示图片 ID 和尺寸

![preview2](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/preview2.png)

- 设置页支持以下配置：

  - 瀑布流
    - 自动进入瀑布流（默认开启）
    - 图片列表布局：瀑布流、网格、等高排列、虚拟瀑布流（默认瀑布流）
    - 缩略图大小：小 / 中 / 大（默认大）
    - 显示 NSFW（默认开启）
    - 显示缩略图操作按钮（默认开启）
    - 显示缩略图信息（默认关闭）
    - 显示瀑布流滚动条（默认开启）
  - 详情页
    - 使用滚轮切换图片（默认开启）
    - 加载原图（默认关闭）
    - 预加载后续 0–5 张静态图片（默认 2 张；0 表示关闭）
    - 标签点击行为：新标签页瀑布流搜索（默认）、当前页瀑布流搜索
  - 其他
    - Danbooru 黑名单规则添加、搜索联想、删除确认、批量编辑及账号同步
    - 下载文件名模板

![preview3](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/preview3.png)

- 沉浸式查看器支持图片和视频预览、切换、缩放、收藏、下载，以及将当前图片标签加入黑名单。收藏和修改黑名单需要登录 Danbooru。

- 默认显示作者、角色和版权标签，更多标签可展开查看。

![preview4](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/preview4.png)

### 搜索历史与热门搜索

点击搜索框展开搜索历史和热门搜索。输入标签时，同一面板切换为标签补全；再次点击搜索框保持当前补全，清空输入后恢复历史。热门搜索中英并列；历史卡片上方保留原始表达式，下方只概括有译文的内容标签，不重复排序等指令，没有译文时只显示原文。标签补全也保留已有中文翻译。点击历史或热门搜索会从第 1 页直接搜索完整条件，点击补全项只填入标签。原有热门图片和个人收藏按钮仍位于搜索栏旁。

历史默认显示 8 条，超出时可点击列表下方的「展开更多」查看全部，或点击「收起」恢复；关闭后重新打开会恢复收起状态。面板不显示滚动条，超出可视范围仍可滚动浏览。设置中可开启「隐藏热门搜索」，隐藏后历史默认显示 16 条，也不再请求热门搜索。

词条左上角的图钉可固定或取消固定。固定项排在前面，始终保留且不能直接删除；取消固定后回到普通历史前部。普通历史最多保留 20 条，超出时淘汰最旧记录，固定项不计入上限；重复使用会移到最前。未固定词条右上角的叉用于删除，在悬停或键盘聚焦时显示，触摸设备始终显示。删除立即生效，无需确认，不提供撤销。

历史会在提交搜索或点击历史、热门搜索词条时自动记录。空搜索、热门图片与个人收藏快捷按钮、详情标签点击、翻页和刷新不会新增记录。历史保存在本地脚本存储中，不同步到 Danbooru 账号。

热门搜索取自原站的 [Popular Searches](https://danbooru.donmai.us/explore/posts/searches)，最多显示 10 条，表示搜索词排行，与热门图片 Hot 不同。当天没有数据时尝试前一天（按 UTC 日期），仍为空或接口不可用时隐藏该区域，搜索历史仍可使用。

### 下载文件名模板

下载文件名模板支持以下占位符：

- `{original}`：原文件名，不含后缀
- `{artist}`：Danbooru 作者标签
- `{username}`：来源 URL 可解析到的用户名，缺失时回退到作者标签
- `{userid}`：来源 URL 可解析到的用户 ID
- `{id}`：来源作品 ID，缺失时回退到 Danbooru ID
- `{postid}`：Danbooru ID

模板从 Danbooru 和来源 URL 获取数据生成文件名。修改或恢复默认后需点击“保存”。

### 镜像站支持

该脚本支持基于 [Danbooru](https://github.com/danbooru/danbooru) 的图库镜像站。

如脚本没有在你使用的域名上运行，可自行将网址加入 _用户匹配_（脚本编辑 → 设置 → 包括/排除 → 用户匹配 → 添加）。

![userMatches](https://raw.githubusercontent.com/kano0222/danbooru-masonry/main/docs/userMatches.png)

## 注意事项

- 瀑布流黑名单支持正负标签、`*` 通配符及 `rating`、`score`、`status` 元标签；其他规则仍会保存到 Danbooru，但不会在瀑布流中生效。

## TODO

- 详情按钮布局。
- 预览实际接入。

## 致谢

- [asadahimeka/yandere-masonry](https://github.com/asadahimeka/yandere-masonry)：Danbooru Masonry 所基于的原始项目。
- [ffdkj-Danbooru_Tag-Chinese-English-Translation-Table](https://github.com/ffdkj/ffdkj-Danbooru_Tag-Chinese-English-Translation-Table)：提供中文标签翻译数据。

## License

本项目采用 [MIT License](https://github.com/kano0222/danbooru-masonry/blob/main/LICENSE) 开源。

Copyright © 2026 kano0222
