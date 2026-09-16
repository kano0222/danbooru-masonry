import type { GetPostsParams, GetPostsResult, Post } from '../adapters/types';
import { ApiError, fetchJson } from '../utils/fetch';

export async function fetchPostsJson(
  origin: string,
  params: GetPostsParams,
  normalize: (raw: unknown) => Post,
): Promise<GetPostsResult> {
  const url = new URL('/posts.json', origin);
  const currentParams = new URLSearchParams(params.pageUrlSearch || '');
  const z = currentParams.get('z');
  url.searchParams.set('tags', params.tags);
  url.searchParams.set('page', String(params.page));
  if (z) url.searchParams.set('z', z);
  const data = await fetchJson<unknown[]>(url.toString(), {}, 'posts.json');
  const rawPosts = Array.isArray(data) ? data : [];
  return {
    posts: rawPosts.map(normalize).filter((post) => post.available),
    hasSourcePosts: rawPosts.length > 0,
  };
}

export function getPostLoadError(error: unknown): { message: string; upgrade: boolean } {
  let message: string;
  if (error instanceof ApiError) {
    if (error.errorType === 'PostQuery::TagLimitError') {
      const limit = error.serverMessage.match(/cannot search for more than (\d+) tags at a time/i)?.[1];
      return {
        message: limit
          ? '搜索失败：当前账号每次最多搜索 ' + limit + ' 个标签。请减少标签数量，或升级账号以搜索更多标签。'
          : '搜索失败：搜索标签数量超过当前账号上限。请减少标签数量，或升级账号以搜索更多标签。',
        upgrade: true,
      };
    }
    if (error.errorType === 'UnexpectedResponse') {
      message = '网站未返回有效数据，可能需要登录或完成验证。请打开原站检查后重试。';
    } else if (['ActiveRecord::QueryCanceled', 'Rack::Timeout::RequestTimeoutException'].includes(error.errorType)) {
      message = '搜索超时，请简化搜索条件后重试。';
    } else {
      const messages: Record<number, string> = {
        400: '搜索参数无法解析，请检查标签和搜索语法。',
        401: '身份验证失败，请在 Danbooru 登录后重试。',
        403: '访问被拒绝，请检查账号权限或在原站完成验证。',
        404: '请求的内容不存在。',
        410: '页码超过可访问范围，请返回较前的页码或缩小搜索范围。',
        422: '搜索条件无效，请检查标签、括号和搜索语法。',
        424: '搜索参数无效，请检查搜索条件。',
        429: '请求过于频繁，请稍等一分钟后重试。',
        500: '服务器处理失败，请稍后重试；也可尝试简化搜索条件。',
        502: '服务器暂时无法响应，请稍后重试。',
        503: '服务暂时不可用，请稍后重试。',
        504: '服务器响应超时，请稍后重试。',
      };
      message = messages[error.status] || '请求失败，请稍后重试。';
      message += '（HTTP ' + error.status + '）';
      if (error.serverMessage && (error.status === 400 || error.status === 422 || !messages[error.status])) {
        message += ' 服务器说明：' + error.serverMessage;
      }
    }
  } else if (error instanceof TypeError) {
    message = '网络连接失败，请检查网络后重试。';
  } else if (error instanceof SyntaxError) {
    message = '网站返回的数据格式无效，请稍后重试。';
  } else {
    message = error instanceof Error ? error.message : String(error);
  }
  return { message: '加载失败：' + message, upgrade: false };
}
