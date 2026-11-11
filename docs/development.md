# 开发指南

本指南帮助贡献者获取源码、启动预览、定位实现并验证改动。贡献要求与权限边界见 [AGENTS.md](../AGENTS.md)，功能用法见 [README](../README.md)，历史变化见 [CHANGELOG](../CHANGELOG.md)。

## 开始之前

本项目是 TypeScript/Vite 用户脚本，无需在仓库中启动后端服务。准备 Git、Node.js 24（与发布工作流一致）及 pnpm 9.15.9（由 `package.json` 指定）。安装依赖需要访问包仓库。

- 普通界面与交互开发先使用本地预览：无需 Danbooru 账号或脚本管理器，数据与请求均为演示用途。
- 涉及宿主页面、登录权限、脚本管理器或真实媒体时，再安装构建后的用户脚本进行验证。

## 快速开始

### 获取源码

```sh
git clone https://github.com/kano0222/danbooru-masonry.git
cd danbooru-masonry
```

通过 fork 贡献时，将克隆地址替换为自己的 fork。已有工作副本可直接进入项目根目录；下文命令均在该目录执行。

### 安装依赖

若尚未安装指定 pnpm，执行：

```sh
npm install --global pnpm@9.15.9
```

已安装 Corepack 时，也可用以下方式启用 pnpm，二选一即可：

```sh
corepack enable
corepack prepare pnpm@9.15.9 --activate
```

确认版本后安装项目依赖：

```sh
node --version
pnpm --version
pnpm install --frozen-lockfile
```

### 启动预览

```sh
pnpm preview
```

打开终端显示的地址，即可体验图片列表、搜索、设置和查看器。修改源码后检查页面变化，按 Ctrl+C 停止服务。预览默认模拟已登录用户，不能用于验证真实账号接口。

## 开发与调试

| 命令 | 用途与产物 |
| --- | --- |
| `pnpm dev` | 以 development 模式监听构建，输出 `dist/danbooru-masonry.user.js`；不是网页开发服务器，不运行 postbuild |
| `pnpm build` | 构建用户脚本，再运行 `scripts/postbuild.mjs` 重写元数据头，输出同一路径 |
| `pnpm preview` | 启动 `preview/` 的 Vite 开发服务器，修改源码后可即时查看演示 |
| `pnpm preview:build` | 生成可静态托管的演示到 `preview-dist/`，不生成用户脚本 |

### 本地演示与静态产物

日常开发使用快速开始中的 `pnpm preview`。演示通过 `PreviewAdapter`、模拟请求和 GM API 复用 `boot()`；数据来自 `preview/fixtures.ts` 与 `preview/public/image/`。预览默认模拟已登录用户，用 10 张本地图片生成分页数据。数据及存储边界见 [README 的预览说明](../README.md#关于预览)。演示并不模拟全部 Danbooru 搜索语法，也不能验证真实登录、接口权限、视频或宿主 CSS。

要检查构建后的静态页面：

```sh
pnpm preview:build
pnpm exec vite preview --config vite.preview.config.ts
```

打开终端显示的地址，结束后按 Ctrl+C 停止。第二条命令服务于已有的 `preview-dist/`；`pnpm preview` 本身不会检查这个构建目录。预览配置使用相对资源路径，并且 `emptyOutDir: false`，重新构建不会清理旧产物。

### 在真实页面调试

1. 执行 `pnpm dev`，保持命令运行。
2. 用脚本管理器导入生成的 `dist/danbooru-masonry.user.js`，或将其内容复制到管理器编辑器并保存；避免同时启用另一份已安装版本。
3. 打开或刷新 Danbooru 的 `/` 或 `/posts` 页面。每次源码更新后等待重新构建，再更新管理器中的脚本并刷新页面。此命令不提供自动注入或页面热更新。
4. 查看浏览器控制台及网络面板；正式构件还需用 `pnpm build` 验证。构建会清空 `dist/`，不要在其中放需保留的文件。

脚本默认匹配和权限配置见 [vite.config.ts](../vite.config.ts)。`postbuild.mjs` 维护另一份最终元数据头，修改名称、匹配域名、权限或更新地址时需同时核对两处。监听构建的版本来自 Vite 配置，正式构建的最终版本来自 `package.json`。

### 检查正式构建

```sh
pnpm build
```

将 `dist/danbooru-masonry.user.js` 导入脚本管理器，按上面的真实页面步骤复查受影响行为。`pnpm build` 生成正式元数据头；监听构建成功不能替代对这一产物的检查。

## 项目结构与修改入口

| 位置 | 用途 |
| --- | --- |
| `src/userscript.ts`、`src/prepare.ts`、`src/main.ts` | 脚本入口、站点选择与启动编排 |
| `src/adapters/`、`src/api/` | 站点数据契约与 API 请求 |
| `src/core/`、`src/ui/` | 状态、业务逻辑、界面与样式；具体入口见下表 |
| `src/data/`、`src/utils/` | 翻译数据加载及请求、URL、DOM 等工具 |
| `preview/` | 本地演示入口、适配器、请求替身与数据；图片在 `preview/public/image/` |
| `scripts/`、`.github/workflows/` | 构建后处理与发布工具 |
| `docs/`、`docs/images/` | 开发文档与 README 截图 |

测试以 `*.test.ts` 与源码放在一起。`dist/`、`preview-dist/` 分别是用户脚本与预览的构建输出。

按改动类型定位源码，下表路径均相对于 `src/`：

| 修改内容 | 首先检查 | 注意事项 |
| --- | --- | --- |
| 设置项、默认值与持久化 | `core/state.ts`、`ui/shell.ts`、`main.ts` | 同步控件、保存行为及相关 README；不要只改显示值 |
| 搜索、分页与历史 | `core/search.ts`、`core/searchLibrary.ts`、`ui/searchLibrary.ts`、`ui/autocomplete.ts`、`main.ts` | 区分补全填入和执行搜索；检查请求失效、总页数与历史恢复 |
| 列表布局与卡片 | `core/masonry.ts`、`ui/cards.ts`、`ui/styles.ts` | 检查四种布局、窗口变化、虚拟列表及关闭查看器后的滚动位置 |
| 媒体、下载及标签操作 | `core/normalizePost.ts`、`core/viewer.ts`、`core/viewerPreload.ts`、`core/viewerTags.ts`、`ui/shell.ts` | 区分缩略图、播放资源和原文件，保留视频、ugoira 及无媒体回退 |
| 黑名单 | `core/blacklist.ts`、`api/userSettings.ts`、`main.ts` | 区分读取、过滤、草稿和账号保存；保存后需重新过滤已加载内容 |
| 翻译、接口或站点支持 | `data/tagTranslation.ts`、`api/`、`adapters/`、`prepare.ts` | 翻译来源见 README；新增域名仅添加用户匹配不足以通过适配器选择 |

## 关键运行流程

启动和加载的主要关系如下：

1. 用户脚本在 `document-end` 运行，`userscript.ts` 调用 `resolveAdapter(location)`；没有匹配适配器则结束。当前只接受官方 origin，以及 `http://localhost:3000`、`http://127.0.0.1:3000` 上的 `/` 或 `/posts*` 路径。本地地址是外部 Danbooru 实例，不是演示服务器。
2. `main.ts` 的 `boot()` 调用 `createState()` 读取 GM 存储中的偏好，绑定历史导航并开始加载翻译，尝试翻译原页面标签。在首页和帖子列表页安装启动按钮，按偏好或启动 URL 决定是否进入瀑布流。
3. `startMasonry()` 等待翻译加载完成（失败可继续使用原文），已登录时通过账号接口读取保存的黑名单，未登录时从宿主页捕获规则，应用主题、样式和页面壳，绑定事件及布局监听，初始化历史并加载第一页。
4. `loadNextPage()` 每次通过适配器获取一页帖子，Danbooru 实现委托 API 请求并将返回数据规范化为 `Post`。黑名单过滤后由 `ui/cards.ts` 渲染，`core/masonry.ts` 排列；整页不可见时显示提示，等待用户继续滚动或切换页码。总数量另行请求，用于计算总页数。
5. 点击卡片进入 `core/viewer.ts` 的查看器逻辑，更新 `ui/shell.ts` 创建的查看器元素，并衔接预加载、标签搜索及历史记录。后续滚动、搜索、页码跳转和前进后退由 `main.ts` 协调。

适配器并未封装所有请求：热门搜索和黑名单保存等仍由应用直接调用 API；因此新增请求时也需检查演示的 `preview/requests.ts`。

## 验证改动

验证范围与完成标准见 [AGENTS.md](../AGENTS.md#验证与完成标准)。以下是具体检查方式，按受影响部分选用。

### 自动检查

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff --check
```

Lint 检查脚本与 TypeScript；类型检查覆盖 `src/`、`preview/` 和配置；测试使用 Vitest 单次运行。开发期间可先运行受影响的测试，例如：

```sh
pnpm test src/core/masonry.test.ts
```

接口测试使用 `vi.stubGlobal('fetch', ...)` 等替身，应用编排测试使用模拟 DOM 和模块；可参考相邻测试组织新案例。预览打包与资源路径的检查方式见[本地演示与静态产物](#本地演示与静态产物)。

### 手动验证

| 改动范围 | 操作与检查点 |
| --- | --- |
| 搜索、分页、历史 | 在预览中输入标签、选择补全、提交搜索、固定或删除历史、翻页，再使用浏览器前进后退，检查搜索条件与列表恢复 |
| 布局、设置、查看器 | 切换受影响的布局和设置，改变窗口宽度；打开、切换、关闭查看器，检查滚动位置、键盘操作与焦点恢复 |
| 底部布局的矮横屏 | 在 480×320 本地预览中模拟视频可见并展开标签，检查所有操作按钮中心和边缘的命中；来源按钮中心和下载按钮上缘不能命中标签列表或翻页按钮。切回顶部后核对默认布局未变化 |
| 请求或媒体处理 | 用测试替身构造空结果、失败和延迟响应，检查相应提示、重试及快速切换搜索后旧请求是否覆盖新结果 |
| 宿主页面集成 | 安装构建脚本，检查启动和退出、原页标签翻译、宿主 CSS、登录与未登录状态及涉及的媒体格式 |

真实收藏和黑名单保存会修改账号；普通界面交互先在预览中检查。验证记录注明使用的是预览还是实际站点、操作步骤、结果及尚未覆盖的部分。

纯文档修改检查链接、命令、章节引用与差异；涉及截图时查看实际显示效果。`pnpm format` 会重写整个仓库，不适合只检查局部改动。

## 发布操作（维护者）

本节供维护者或获授权的发布执行者使用。发布规则见 [AGENTS.md 的维护与发布权限](../AGENTS.md#维护与发布权限)，具体步骤以 [package.json](../package.json)、[发布工作流](../.github/workflows/release.yml) 和 [发布说明提取脚本](../scripts/release-notes.mjs) 为准。

| 入口 | 自动执行 | 不包含 |
| --- | --- | --- |
| `pnpm release` | Lint、类型检查、正式构建、输出发布提示 | 测试、提交、打标签、推送和上传 |
| GitHub Release 工作流 | 安装依赖、Lint、类型检查、测试、正式构建、提取 CHANGELOG 说明并上传脚本 | 静态演示构建与部署 |

发布准备按以下顺序进行：

1. 将确定的版本写入 `package.json` 和 `vite.config.ts`，在 `CHANGELOG.md` 添加对应的 `## X.Y.Z - YYYY-MM-DD` 章节。
2. 运行 `pnpm release`、`pnpm test` 和 `git diff --check`。已通过且相关内容未变的检查无需重复。
3. 检查 `dist/danbooru-masonry.user.js` 的元数据头，核对版本、匹配地址、权限和更新地址；正式头由 `scripts/postbuild.mjs` 生成。
4. 按贡献规范完成发布提交与标签操作。标签推送触发工作流后，核对运行结果、Release 说明及脚本附件。

`pnpm release` 只完成本地检查与构建，不会创建 Git 提交、标签或 GitHub Release。工作流用 `scripts/release-notes.mjs` 提取更新日志，并上传 `dist/danbooru-masonry.user.js`。

工作流由 `v*` 标签推送或手动触发；开发验证无需触发发布。
