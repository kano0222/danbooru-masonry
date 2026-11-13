import { escapeAttr, escapeHtml } from '../utils/escape';

export type Language = 'zh-CN' | 'en';
const STORAGE_KEY = 'danbooru-masonry.language';
let language: Language = 'zh-CN';

export function getLanguage(): Language { return language; }

export function initializeLanguage(): void {
  let stored: unknown;
  try { stored = GM_getValue(STORAGE_KEY); } catch { /* Use Chinese when storage is unavailable. */ }
  language = stored === 'en' ? 'en' : 'zh-CN';
}

export function setLanguage(value: Language): void {
  language = value;
  try { GM_setValue(STORAGE_KEY, value); } catch { /* Keep the choice for this session. */ }
}

// Source messages are keys; only explicitly bound UI copy is localized.
export const english: Record<string, string> = {
  '尚无规则': 'No rules yet',
  '删除规则 {value}': 'Remove rule {value}',
  '退出瀑布流': 'Exit masonry',
  '页码': 'Page',
  '总页数': 'Total pages',
  '搜索标签': 'Search tags',
  '搜索': 'Search',
  '热门': 'Hot',
  '我的收藏': 'My favorites',
  '登录后可查看收藏': 'Sign in to view favorites',
  '已加载 {count} 张 / 加载中...': '{count} posts loaded / Loading...',
  '已加载 {count} 张': '{count} posts loaded',
  '设置': 'Settings',
  '正在加载瀑布流': 'Loading masonry',
  '瀑布流滚动位置': 'Masonry scroll position',
  '回到顶部': 'Back to top',
  '关闭设置': 'Close settings',
  '瀑布流': 'Masonry',
  '自动进入瀑布流': 'Enter masonry automatically',
  '打开原站图片列表页时自动使用瀑布流浏览': 'Use masonry when opening a post list on the original site',
  '图片列表布局': 'Post layout',
  '选择图片列表的排列方式': 'Choose how posts are arranged',
  '缩略图大小': 'Thumbnail size',
  '调整卡片宽度，等高排列时调整行高': 'Adjust card width, or row height in justified layout',
  '显示 NSFW': 'Show NSFW',
  '包含敏感、限制级内容': 'Include sensitive and explicit content',
  '显示缩略图操作按钮': 'Show thumbnail actions',
  '在图片卡片上显示收藏和下载按钮': 'Show favorite and download buttons on cards',
  '显示缩略图信息': 'Show thumbnail details',
  '在图片卡片上显示作品信息': 'Show post details on cards',
  '显示瀑布流滚动条': 'Show masonry scrollbar',
  '在页面右侧显示滚动条': 'Show a scrollbar on the right',
  '隐藏热门搜索': 'Hide popular searches',
  '隐藏后搜索历史默认显示 16 条': 'Show 16 history entries by default when hidden',
  '详情页': 'Viewer',
  '使用滚轮切换图片': 'Navigate with the mouse wheel',
  '在详情查看器中滚动切换上一张或下一张': 'Scroll to the previous or next post in the viewer',
  '加载原图': 'Load original images',
  '打开详情页时直接加载高质量原图': 'Load the full quality original when opening the viewer',
  '预加载数量': 'Preload count',
  '提前加载后续图片；设为 0 可关闭': 'Preload upcoming images; set to 0 to disable',
  '0（关闭）': '0 (off)',
  '标签点击行为': 'Tag click behavior',
  '选择点击详情标签后的搜索方式': 'Choose where viewer tags open a search',
  '当前页瀑布流搜索': 'Search in this tab',
  '新标签页瀑布流搜索': 'Search in a new tab',
  '其他': 'Other',
  'Danbooru 黑名单规则': 'Danbooru blacklist rules',
  '编辑用于过滤图片的原站规则': 'Edit the site rules used to filter posts',
  '下载文件名模板': 'Download filename templates',
  '按图片来源自定义下载文件名': 'Customize filenames by post source',
  '打开 GitHub 仓库': 'Open GitHub repository',
  '关闭Danbooru 黑名单规则': 'Close Danbooru blacklist rules',
  '添加单个标签或多个标签组合规则': 'Add a tag or a rule combining multiple tags',
  '添加规则': 'Add rule',
  '未能读取黑名单规则': 'Could not load blacklist rules',
  '批量编辑': 'Batch edit',
  '未能读取黑名单，请关闭此窗口后重新打开以重试': 'Could not load the blacklist. Close and reopen this dialog to retry',
  '登录 Danbooru 后可修改': 'Sign in to Danbooru to edit',
  '取消': 'Cancel',
  '保存': 'Save',
  '关闭下载文件名模板': 'Close download filename templates',
  '原文件名，不含后缀': 'Original filename without the extension',
  'Danbooru 作者标签': 'Danbooru artist tag',
  '来源 URL 可解析到的用户名，缺失时回退到作者标签': 'Username from the source URL, falling back to the artist tag',
  '来源 URL 可解析到的用户 ID': 'User ID from the source URL',
  '来源作品 ID，缺失时回退到 Danbooru ID': 'Source post ID, falling back to the Danbooru ID',
  '关闭窗口或取消会放弃未保存修改。': 'Closing or canceling discards unsaved changes.',
  '恢复默认': 'Restore defaults',
  '图片标签': 'Post tags',
  '显示标签': 'Show tags',
  '隐藏标签': 'Hide tags',
  '图片操作': 'Post actions',
  '来源': 'Source',
  '收藏': 'Favorite',
  '加入黑名单': 'Add to blacklist',
  '查看大图': 'Zoom image',
  '详情': 'Post details',
  '下载原图': 'Download original',
  '关闭': 'Close',
  '上一张': 'Previous post',
  '下一张': 'Next post',
  '正在加载图片': 'Loading image',
  '加载失败': 'Failed to load',
  '关闭加入黑名单': 'Close blacklist selection',
  '选择要屏蔽的标签或上传者。确认后保存到 Danbooru 账号，匹配图片将从当前瀑布流中隐藏。上传者是上传图片的账号，可能与作者不同。': 'Select tags or the uploader to block. Confirming saves the rules to your Danbooru account and hides matching posts from this masonry view. The uploader is the account that uploaded the image and may differ from the artist.',
  '当前图片标签与上传者': 'Current post tags and uploader',
  '确认加入': 'Confirm',
  '确认加入（{count}）': 'Confirm ({count})',
  '瀑布流模式': 'Masonry mode',
  '加载中...': 'Loading...',
  '启动失败，点击重试': 'Failed to start. Click to retry',
  '尚未保存': 'Unsaved changes',
  '已经到底了，没有更多图片。': 'No more posts.',
  '没有找到符合条件的图片。': 'No matching posts found.',
  '本页内容已被过滤或无法显示，可继续向下滚动加载下一页，或切换页码。': 'Posts on this page were filtered or cannot be displayed. Scroll down to load the next page, or choose another page.',
  ' 升级账号': ' Upgrade account',
  '黑名单正在保存，请稍后重试': 'The blacklist is being saved. Please try again shortly',
  '所选规则已在黑名单中': 'The selected rules are already blacklisted',
  '已将 {count} 条规则加入黑名单': 'Added {count} rules to the blacklist',
  '保存中...': 'Saving...',
  '已保存': 'Saved',
  '网络连接失败，请检查网络后重新保存。': 'Network connection failed. Check your connection and save again.',
  '保存失败，请稍后重试。': 'Save failed. Please try again later.',
  '草稿已恢复默认，保存后生效': 'Draft reset to defaults. Save to apply',
  '示例:{value}': 'Example: {value}',
  '模板不能为空': 'The template cannot be empty',
  '规则已存在': 'Rule already exists',
  '请输入规则': 'Enter a rule',
  '操作栏位置': 'Toolbar position',
  '选择底部时，上下翻转详情布局': 'Flip the viewer layout when the toolbar is at the bottom',
  '顶部': 'Top',
  '底部': 'Bottom',
  '切换到浅色模式': 'Switch to light mode',
  '切换到深色模式': 'Switch to dark mode',
  '正在加载标签联想…': 'Loading tag suggestions…',
  '没有匹配的标签': 'No matching tags',
  '标签联想暂时不可用': 'Tag suggestions are temporarily unavailable',
  '搜索历史': 'Search history',
  '取消固定': 'Unpin',
  '固定': 'Pin',
  '取消固定：{value}': 'Unpin: {value}',
  '固定：{value}': 'Pin: {value}',
  '删除搜索：{value}': 'Remove search: {value}',
  '删除': 'Remove',
  '尚无搜索历史': 'No search history yet',
  '收起': 'Show less',
  '展开更多': 'Show more',
  '热门搜索': 'Popular searches',
  '{count} 次搜索': '{count} searches',
  '打开来源': 'Open source',
  '来源 {value}': 'Source {value}',
  '取消收藏中...': 'Removing favorite...',
  '收藏中...': 'Adding favorite...',
  '网络连接失败，请检查网络后重试。': 'Network connection failed. Check your connection and try again.',
  '请稍后重试。': 'Please try again later.',
  '下载失败': 'Download failed',
  '下载超时，请稍后重试。': 'Download timed out. Please try again later.',
  '退出原图模式': 'Exit original image mode',
  '取消收藏': 'Unfavorite',
  '作者': 'Artist',
  '版权': 'Copyright',
  '角色': 'Character',
  '上传者 ID：{value}': 'Uploader ID: {value}',
  '网格': 'Grid',
  '等高排列': 'Justified',
  '虚拟瀑布流': 'Virtual masonry',
  '小': 'Small',
  '中': 'Medium',
  '大': 'Large',
  '未检测到登录状态': 'Not signed in',
  '未能读取当前账号的黑名单规则': 'Could not load the current account blacklist',
  'HTTP {value}: 黑名单保存失败': 'HTTP {value}: Could not save the blacklist',
  '搜索失败：当前账号每次最多搜索 {count} 个标签。请减少标签数量，或升级账号以搜索更多标签。': 'Search failed: your account can search at most {count} tags at once. Use fewer tags, or upgrade your account.',
  '搜索失败：搜索标签数量超过当前账号上限。请减少标签数量，或升级账号以搜索更多标签。': 'Search failed: too many tags for your account. Use fewer tags, or upgrade your account.',
  '网站未返回有效数据，可能需要登录或完成验证。请打开原站检查后重试。': 'The site returned invalid data. Open the original site to sign in or complete verification, then try again.',
  '搜索超时，请简化搜索条件后重试。': 'Search timed out. Simplify your query and try again.',
  '搜索参数无法解析，请检查标签和搜索语法。': 'Could not parse the query. Check your tags and search syntax.',
  '身份验证失败，请在 Danbooru 登录后重试。': 'Authentication failed. Sign in to Danbooru and try again.',
  '访问被拒绝，请检查账号权限或在原站完成验证。': 'Access denied. Check account permissions or complete verification on the original site.',
  '请求的内容不存在。': 'The requested content does not exist.',
  '页码超过可访问范围，请返回较前的页码或缩小搜索范围。': 'Page out of range. Go to an earlier page or narrow your search.',
  '搜索条件无效，请检查标签、括号和搜索语法。': 'Invalid query. Check your tags, parentheses, and search syntax.',
  '搜索参数无效，请检查搜索条件。': 'Invalid search parameters. Check your query.',
  '请求过于频繁，请稍等一分钟后重试。': 'Too many requests. Wait a minute and try again.',
  '服务器处理失败，请稍后重试；也可尝试简化搜索条件。': 'The server could not process the request. Try again later or simplify your query.',
  '服务器暂时无法响应，请稍后重试。': 'The server is temporarily unavailable. Please try again later.',
  '服务暂时不可用，请稍后重试。': 'Service temporarily unavailable. Please try again later.',
  '服务器响应超时，请稍后重试。': 'The server timed out. Please try again later.',
  '请求失败，请稍后重试。': 'Request failed. Please try again later.',
  '网站返回的数据格式无效，请稍后重试。': 'The site returned an invalid data format. Please try again later.',
  '登录已失效或权限不足，请刷新原站并确认登录后重试。': 'Your session has expired or you lack permission. Refresh the original site and sign in, then try again.',
  '图片不存在或已被删除。': 'The post does not exist or has been deleted.',
  '操作过于频繁，请稍等一分钟后重试。': 'Too many actions. Wait a minute and try again.',
  '服务器未能完成收藏操作，请稍后重试。（HTTP {value}）': 'The server could not update favorites. Try again later. (HTTP {value})',
  '请求失败（HTTP {status}，{value}）': 'Request failed (HTTP {status}, {value})',
  '切换语言': 'Switch language',
  '原文件名': 'original_filename',
  '作者名称': 'artist_name',
  '用户名': 'username',
  '演示': 'Demo',
  '演示预览': 'Preview',
  '当前为演示预览': 'This is a demo preview',
  '模拟已登录状态；标签、评分与分级为演示数据，操作仅影响本地预览。': 'Simulated signed-in account. Tags, scores, and ratings are sample data; actions only affect this local preview.',
};

const patterns = Object.entries(english).filter(([key]) => key.includes('{')).map(([key, value]) => {
  const names: string[] = [];
  const expression = key.split(/(\{\w+\})/).map((part) => {
    if (/^\{\w+\}$/.test(part)) { names.push(part); return '([\\s\\S]*?)'; }
    return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }).join('');
  return { expression: new RegExp(`^${expression}$`), names, value };
});

export function t(source: string): string {
  if (language !== 'en') return source;
  if (Object.hasOwn(english, source)) return english[source];
  // Composed errors retain server-provided details verbatim.
  for (const [prefix, translated] of [['加载失败：', 'Failed to load: '], ['收藏操作失败：', 'Could not update favorites: ']]) {
    if (source.startsWith(prefix)) return translated + t(source.slice(prefix.length));
  }
  const separator = ' 服务器说明：';
  const serverSeparator = source.indexOf(separator);
  if (serverSeparator >= 0) return t(source.slice(0, serverSeparator)) + ' Server message: ' + source.slice(serverSeparator + separator.length);
  for (const { expression, names, value } of patterns) {
    const match = expression.exec(source);
    if (match) return value.replace(/\{\w+\}/g, (name) => match[names.indexOf(name) + 1]);
  }
  const http = source.match(/^(.*)（HTTP (\d+)）$/s);
  if (http) return `${t(http[1])} (HTTP ${http[2]})`;
  return source;
}

export function localizeText(element: HTMLElement, source: string): void {
  element.dataset.i18n = source;
  element.textContent = t(source);
}

export function localizeAttribute(element: HTMLElement, attribute: string, source: string): void {
  element.setAttribute(`data-i18n-${attribute}`, source);
  element.setAttribute(attribute, t(source));
}

export function textMarkup(source: string): string {
  return `<span data-i18n="${escapeAttr(source)}">${escapeHtml(t(source))}</span>`;
}

export function attributeMarkup(attribute: string, source: string): string {
  return `data-i18n-${attribute}="${escapeAttr(source)}" ${attribute}="${escapeAttr(t(source))}"`;
}

export function refreshLocalizedDom(root: HTMLElement): void {
  const elements = [root, ...root.querySelectorAll<HTMLElement>(
    '[data-i18n], [data-i18n-aria-label], [data-i18n-title], [data-i18n-placeholder], [data-i18n-data-dmh-tooltip]',
  )];
  for (const element of elements) {
    if (element.dataset.i18n !== undefined) {
      // Keep child controls such as an upgrade link when updating a status message.
      const text = t(element.dataset.i18n);
      const first = element.firstChild;
      if (first?.nodeType === 3) first.textContent = text;
      else element.textContent = text;
    }
    for (const attribute of ['aria-label', 'title', 'placeholder', 'data-dmh-tooltip']) {
      const source = element.getAttribute(`data-i18n-${attribute}`);
      if (source !== null) element.setAttribute(attribute, t(source));
    }
  }
  root.lang = language;
}
