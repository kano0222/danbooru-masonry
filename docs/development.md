# 开发指南

本项目是 TypeScript/Vite 用户脚本，另有复用正式界面的本地演示。功能用法见 [中文 README](../README.md)，历史变化见 [CHANGELOG](../CHANGELOG.md)。

## 环境与安装

建议使用 Node.js 24（与发布工作流一致）和 pnpm 9.15.9（由 `package.json` 的 `packageManager` 指定）。在项目根目录执行：

```sh
node --version
pnpm --version
pnpm install --frozen-lockfile
```

若尚未安装对应 pnpm，可使用 Node.js 附带的 Corepack：

```sh
corepack enable
corepack prepare pnpm@9.15.9 --activate
```

依赖安装需要访问包仓库；本地演示和单元测试不需要连接 Danbooru。验证真实用户脚本需浏览器及用户脚本管理器（如 Tampermonkey），没有后端服务需要在本仓库启动。

## 开发构建、正式构建与演示

| 命令 | 用途与产物 |
| --- | --- |
| `pnpm dev` | 以 development 模式监听构建，输出 `dist/danbooru-masonry.user.js`；不是网页开发服务器，不运行 postbuild |
| `pnpm build` | 构建用户脚本，再运行 `scripts/postbuild.mjs` 重写元数据头，输出同一路径 |
| `pnpm preview` | 启动 `preview/` 的 Vite 开发服务器，修改源码后可即时查看演示 |
| `pnpm preview:build` | 生成可静态托管的演示到 `preview-dist/`，不生成用户脚本 |

### 在真实页面调试

1. 执行 `pnpm dev`，保持命令运行。
2. 用脚本管理器导入生成的 `dist/danbooru-masonry.user.js`，或将其内容复制到管理器编辑器并保存；避免同时启用另一份已安装版本。
3. 打开或刷新 Danbooru 的 `/` 或 `/posts` 页面。每次源码更新后等待重新构建，再更新管理器中的脚本并刷新页面。此命令不提供自动注入或页面热更新。
4. 查看浏览器控制台及网络面板；正式构件还需用 `pnpm build` 验证。构建会清空 `dist/`，不要在其中放需保留的文件。

脚本默认匹配和权限配置见 [vite.config.ts](../vite.config.ts)。`postbuild.mjs` 维护另一份最终元数据头，修改名称、匹配域名、权限或更新地址时需同时核对两处。监听构建的版本来自 Vite 配置，正式构建的最终版本来自 `package.json`。

### 本地演示与静态产物

```sh
pnpm preview
```

打开终端显示的本地地址，按 Ctrl+C 停止。演示通过 `PreviewAdapter`、模拟请求和 GM API 复用 `boot()`；数据来自 `preview/fixtures.ts` 与 `preview/public/image/`。数据及存储边界见 [README 的本地预览说明](../README.md#本地预览)。演示并不模拟全部 Danbooru 搜索语法，也不能验证真实登录、接口权限、视频或宿主 CSS。

要检查构建后的静态页面：

```sh
pnpm preview:build
pnpm exec vite preview --config vite.preview.config.ts
```

打开终端显示的地址，结束后按 Ctrl+C 停止。第二条命令服务于已有的 `preview-dist/`；`pnpm preview` 本身不会检查这个构建目录。预览配置使用相对资源路径，并且 `emptyOutDir: false`，重新构建不会清理旧产物。

## 结构与执行流程

| 位置 | 职责 |
| --- | --- |
| `src/userscript.ts`、`src/prepare.ts` | 用户脚本入口与站点适配器选择 |
| `src/main.ts` | 启动编排、界面事件、分页加载、设置保存及浏览器历史恢复 |
| `src/adapters/` | `BooruAdapter` / `Post` 数据契约，以及 Danbooru 实现 |
| `src/api/` | 帖子、计数、补全、收藏、热门搜索及用户黑名单接口 |
| `src/core/` | 状态与脚本存储、搜索规则、黑名单、布局、查看器、预加载和快捷键逻辑 |
| `src/ui/` | 页面壳（含查看器 HTML）、卡片、搜索面板、样式与主题 |
| `src/data/`、`src/utils/` | 标签翻译加载；请求、URL、DOM、转义及 CSRF 等工具 |
| `preview/` | 演示入口、适配器、请求替身、数据及本地图片 |
| `scripts/`、`.github/workflows/` | 构建后处理、发布提示、发布说明提取及 GitHub Release 工作流 |

测试以 `*.test.ts` 与源码放在一起。`docs/` 保存说明和 README 截图；`dist/`、`preview-dist/` 是忽略提交的构建输出。

启动和加载的主要关系如下：

1. 用户脚本在 `document-end` 运行，`userscript.ts` 调用 `resolveAdapter(location)`；没有匹配适配器则结束。当前只接受官方 origin，以及 `http://localhost:3000`、`http://127.0.0.1:3000` 上的 `/` 或 `/posts*` 路径。本地地址是外部 Danbooru 实例，不是演示服务器。
2. `main.ts` 的 `boot()` 调用 `createState()` 读取 GM 存储中的偏好，绑定历史导航并开始加载翻译，尝试翻译原页面标签。在首页和帖子列表页安装启动按钮，按偏好或启动 URL 决定是否进入瀑布流。
3. `startMasonry()` 等待翻译加载完成（失败可继续使用原文），从宿主页捕获黑名单，应用主题、样式和页面壳，绑定事件及布局监听，初始化历史并加载第一页。
4. `loadNextPage()` 通过适配器获取帖子，Danbooru 实现委托 API 请求并将返回数据规范化为 `Post`。黑名单过滤后由 `ui/cards.ts` 渲染，`core/masonry.ts` 排列；过滤导致整页不可见时继续取后续页。总数量另行请求，用于计算总页数。
5. 点击卡片进入 `core/viewer.ts` 的查看器逻辑，更新 `ui/shell.ts` 创建的查看器元素，并衔接预加载、标签搜索及历史记录。后续滚动、搜索、页码跳转和前进后退由 `main.ts` 协调。

适配器并未封装所有请求：热门搜索和黑名单保存等仍由应用直接调用 API；因此新增请求时也需检查演示的 `preview/requests.ts`。

## 常见修改入口

| 修改内容 | 首先检查 | 注意事项 |
| --- | --- | --- |
| 设置项、默认值与持久化 | `core/state.ts`、`ui/shell.ts`、`main.ts` | 同步控件、保存行为及相关 README；不要只改显示值 |
| 搜索、分页与历史 | `core/search.ts`、`core/searchLibrary.ts`、`ui/searchLibrary.ts`、`ui/autocomplete.ts`、`main.ts` | 区分补全填入和执行搜索；检查请求失效、总页数与历史恢复 |
| 列表布局与卡片 | `core/masonry.ts`、`ui/cards.ts`、`ui/styles.ts` | 检查四种布局、窗口变化、虚拟列表及关闭查看器后的滚动位置 |
| 媒体、下载及标签操作 | `core/normalizePost.ts`、`core/viewer.ts`、`core/viewerPreload.ts`、`core/viewerTags.ts`、`ui/shell.ts` | 区分缩略图、播放资源和原文件，保留视频、ugoira 及无媒体回退 |
| 黑名单 | `core/blacklist.ts`、`api/userSettings.ts`、`main.ts` | 区分读取、过滤、草稿和账号保存；保存后需重新过滤已加载内容 |
| 翻译、接口或站点支持 | `data/tagTranslation.ts`、`api/`、`adapters/`、`prepare.ts` | 翻译来源见 README；新增域名仅添加用户匹配不足以通过适配器选择 |

## 自动检查与手动验证

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Lint 检查脚本与 TypeScript；类型检查覆盖 `src/`、`preview/` 和配置；测试使用 Vitest 单次运行。日常可先运行受影响的测试，例如：

```sh
pnpm test src/core/masonry.test.ts
```

接口测试使用 `vi.stubGlobal('fetch', ...)` 等替身，应用编排测试也有模拟 DOM 和模块；新增测试沿用这些方式，不依赖在线 Danbooru 或翻译 CDN。测试通过不能代替真实浏览器验证布局、焦点和脚本管理器权限。

根据改动选取手动验证项：

- 在本地演示检查搜索、补全、历史、翻页、设置、布局、查看器与浏览器前进后退；改变窗口宽度，检查键盘操作及焦点恢复。
- 涉及真实页面集成时，用构建脚本检查启动/退出、原页标签翻译、宿主 CSS、登录与未登录状态，以及实际媒体格式。真实收藏和黑名单保存会修改当前账号，普通界面验证优先使用演示。
- 修改接口或媒体处理时，检查加载中、空结果、失败与重试，以及快速搜索切换时旧请求不会覆盖新结果。

纯文档修改只需核对链接、命令与当前配置并运行 `git diff --check`，无需执行完整测试或构建。不要为局部修改运行会重写整个仓库的 `pnpm format`。

## 发布流程引用

发布规则见 [AGENTS.md 的发布约束](../AGENTS.md#发布约束)，具体步骤以 [package.json](../package.json)、[发布工作流](../.github/workflows/release.yml) 和 [发布说明提取脚本](../scripts/release-notes.mjs) 为准。

当前 `pnpm release` 依次执行 Lint、类型检查、正式构建和 `scripts/release.mjs` 的提示，**不运行测试，也不提交、打标签、推送或上传**。GitHub Release 工作流则执行依赖安装、Lint、类型检查、**测试**、正式构建，并从 CHANGELOG 提取说明后上传脚本。两者检查范围不一致，不能用本地 `pnpm release` 成功代替测试通过。

工作流由 `v*` 标签推送或手动触发；它没有构建或部署静态演示的步骤。开发验证无需触发发布。
