import type { Post } from '../src/adapters/types';
const previewImages = [
  {
    file: '01.jpg',
    width: 2048,
    height: 1044,
    author: '白石定規',
    handle: 'jojojojougi',
    statusId: '968691347270991873',
  },
  {
    file: '02.jpg',
    width: 1414,
    height: 1000,
    author: 'Hiten',
    handle: 'HitenKei',
    statusId: '848982747645267968',
  },
  {
    file: '03.jpg',
    width: 2048,
    height: 1348,
    author: 'Hiten',
    handle: 'HitenKei',
    statusId: '1065892245218373633',
  },
  {
    file: '04.jpg',
    width: 1414,
    height: 1000,
    author: 'Hiten',
    handle: 'HitenKei',
    statusId: '1328675184757202945',
  },
  {
    file: '05.jpg',
    width: 849,
    height: 1200,
    author: 'Hiten',
    handle: 'HitenKei',
    statusId: '1473235665156702209',
  },
  {
    file: '06.jpg',
    width: 1200,
    height: 1055,
    author: 'Hiten',
    handle: 'HitenKei',
    statusId: '1591051073133113346',
  },
  {
    file: '07.jpg',
    width: 1500,
    height: 851,
    author: 'アシマ',
    handle: 'roro046',
    statusId: '1867527928780914897',
  },
  {
    file: '08.jpg',
    width: 1500,
    height: 844,
    author: 'アシマ',
    handle: 'roro046',
    statusId: '1952687063825842491',
  },
  {
    file: '09.jpg',
    width: 1920,
    height: 1080,
    author: 'アシマ',
    handle: 'roro046',
    statusId: '2075888896697913466',
  },
  {
    file: '10.jpg',
    width: 3541,
    height: 2508,
    author: 'かみゆう',
    handle: 'KYamiuu49',
    statusId: '2094077692086042729',
  },
] as const;
export const translations: Record<string, string> = {
  original: '原创', preview_character: '演示角色', '1girl': '一个女孩',
  solo: '单人', landscape: '风景', outdoors: '户外', sky: '天空',
  clouds: '云', scenery: '景色', city: '城市', night: '夜晚',
  long_hair: '长发', dress: '连衣裙', looking_at_viewer: '看向观众',
  highres: '高分辨率', flower: '花', blue_sky: '蓝天',
  hiten: 'Hiten', ashima: 'アシマ', kamiyuu: 'かみゆう', shiraishi_jougi: '白石定規',
};

export const popularSearches: [string, number][] = [
  ['landscape', 18320], ['1girl solo', 15480], ['original', 12960],
  ['sky clouds', 9870], ['hiten', 8620], ['night', 7540],
  ['flower', 6420], ['city', 5310], ['dress', 4280], ['scenery', 3160],
];

// Artwork/source metadata comes from the existing preview. Tags, scores and ratings are illustrative.
export function createPreviewPosts(baseUrl: string): Post[] {
  return Array.from({ length: 60 }, (_, index) => {
    const image = previewImages[index % previewImages.length];
    const artist = index % 10 === 0 ? 'shiraishi_jougi'
      : index % 10 < 6 ? 'hiten' : index % 10 < 9 ? 'ashima' : 'kamiyuu';
    const general = ['1girl', 'solo', 'landscape', 'outdoors', 'sky',
      ...(index % 2 ? ['long_hair', 'dress', 'looking_at_viewer'] : ['clouds', 'scenery', 'blue_sky']),
      ...(index % 3 === 0 ? ['flower'] : []),
      ...(index % 4 === 0 ? ['city', 'night'] : [])];
    const tagGroups = {
      artist: [artist], copyright: ['original'], character: ['preview_character'],
      general, meta: ['highres'],
    };
    const imageUrl = new URL(`image/${image.file}`, baseUrl).toString();
    return {
      id: String(9000001 + index), raw: null,
      fileUrl: imageUrl, largeUrl: imageUrl, sampleUrl: imageUrl,
      previewUrl: imageUrl, thumbnailUrl: imageUrl, listUrl: imageUrl, viewerUrl: imageUrl,
      playbackUrl: '', width: image.width, height: image.height,
      aspectRatio: image.width / image.height,
      tags: Object.values(tagGroups).flat(), tagGroups,
      rating: index % 5 === 4 ? 's' : 'g', score: 80 + (index * 137) % 2400,
      source: `https://x.com/${image.handle}/status/${image.statusId}`,
      fileExt: 'jpg', isVideo: false, isUgoira: false,
      favorited: index % 4 === 0, available: true,
    };
  });
}
