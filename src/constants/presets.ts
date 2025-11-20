import type { PresetGroup } from '@/lib/types';

export const PRESET_GROUPS: PresetGroup[] = [
  {
    id: 'social',
    label: 'SNS用',
    options: [
      {
        id: 'instagram-square',
        label: 'Instagram 正方形',
        description: '1080 × 1080 px',
        width: 1080,
        height: 1080
      },
      {
        id: 'instagram-story',
        label: 'Instagram ストーリー',
        description: '1080 × 1920 px',
        width: 1080,
        height: 1920
      },
      {
        id: 'x-landscape',
        label: 'X 横長',
        description: '1600 × 900 px',
        width: 1600,
        height: 900
      }
    ]
  },
  {
    id: 'blog',
    label: 'ブログ / カバー',
    options: [
      {
        id: 'hero-16-9',
        label: 'ヒーロー 16:9',
        description: '1920 × 1080 px',
        width: 1920,
        height: 1080
      },
      {
        id: 'feature-4-3',
        label: '特集 4:3',
        description: '1200 × 900 px',
        width: 1200,
        height: 900
      }
    ]
  },
  {
    id: 'custom',
    label: 'カスタム',
    options: [
      {
        id: 'custom-1',
        label: '手動入力',
        description: '任意のサイズを指定',
        width: 1200,
        height: 1200
      }
    ]
  }
];
