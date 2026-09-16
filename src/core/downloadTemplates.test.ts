import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadPost, previewDownloadFilenameTemplate, validateDownloadFilenameTemplate } from './viewer';
import { createState, DEFAULT_DOWNLOAD_FILENAME_TEMPLATES } from './state';
import { normalizePost } from './normalizePost';
afterEach(() => vi.unstubAllGlobals());
describe('download template validation and rendering', () => {
  it.each(['', '  '])('rejects an empty template %s', value => {
    expect(validateDownloadFilenameTemplate(value)).toBe('模板不能为空');
  });
  it.each(['{typo}', '{postid', 'postid}', '{{id}}', '{ext}_{id}', '{id}.{ext}.{ext}'])('accepts a nonempty template %s', value => {
    expect(validateDownloadFilenameTemplate(value)).toBe('');
  });
  it.each(Object.values(DEFAULT_DOWNLOAD_FILENAME_TEMPLATES))('accepts default template %s', value => {
    expect(validateDownloadFilenameTemplate(value)).toBe('');
  });
  it('previews semantic example data and always keeps the actual extension', () => {
    expect(previewDownloadFilenameTemplate('{username}({userid})_{id}.{ext}')).toBe('用户名(123456)_12345.png');
    expect(previewDownloadFilenameTemplate('{postid}')).toBe('67890.png');
    expect(previewDownloadFilenameTemplate('x'.repeat(220) + '.{ext}')).toMatch(/\.png$/);
  });
  it('uses the same renderer for the example and actual download', () => {
    const download = vi.fn(); vi.stubGlobal('GM_download', download);
    const post = normalizePost({ id: 67890, file_url: 'https://cdn.donmai.us/sample.png', file_ext: 'png', tag_string_artist: '画师名称' }, 'https://danbooru.donmai.us');
    downloadPost(post, undefined, { ...DEFAULT_DOWNLOAD_FILENAME_TEMPLATES, danbooru: '{artist}_{postid}.{ext}' });
    expect(download.mock.calls[0][0].name).toBe(previewDownloadFilenameTemplate('{artist}_{postid}.{ext}'));
  });
});

it('preserves the basename of legacy fixed-extension templates but uses the real type', () => {
  const download = vi.fn(); vi.stubGlobal('GM_download', download);
  const post = normalizePost({ id: 1, file_url: 'https://cdn.donmai.us/a.png', file_ext: 'png' }, 'https://danbooru.donmai.us');
  downloadPost(post, undefined, { ...DEFAULT_DOWNLOAD_FILENAME_TEMPLATES, danbooru: 'legacy_{postid}.jpg' });
  expect(download.mock.calls[0][0].name).toBe('legacy_1.png');
});

it('accepts a fixed suffix without an extension-specific warning', () => {
  expect(validateDownloadFilenameTemplate('{id}.jpg')).toBe('');
  expect(previewDownloadFilenameTemplate('{id}.jpg')).toBe('12345.png');
});

it('removes the legacy extension token when loading saved templates', () => {
  vi.stubGlobal('location', { search: '' });
  vi.stubGlobal('GM_getValue', (key: string, fallback: unknown) => key === 'danbooru-masonry.downloadFilenameTemplates' ? { pixiv: 'custom_{postid}.{ext}' } : fallback);
  const state = createState({} as Parameters<typeof createState>[0]);
  expect(state.downloadFilenameTemplates.pixiv).toBe('custom_{postid}');
  expect(Object.values(DEFAULT_DOWNLOAD_FILENAME_TEMPLATES).every(template => !template.includes('{ext}'))).toBe(true);
});
