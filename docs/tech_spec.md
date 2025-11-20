# 技術仕様書: Image Resizer for Creators

## 1. システムアーキテクチャ

### 1.1 ハイブリッド構成
本アプリケーションは **Next.js (SPAモード)** として構築し、最終的に **Electron** でラップしてデスクトップアプリ化する構成を採用する。

* **Renderer Process (UI):** Next.js (App Router), React, Tailwind CSS
* **Main Process (System):** Electron
* **Deploy Target (Web):** Vercel (Static Export)
* **Deploy Target (Desktop):** Windows (.exe), macOS (.dmg)

### 1.2 データフロー
ユーザーのプライバシー保護とサーバーコスト削減のため、画像処理は **全てクライアントサイド（ブラウザメモリ内）** で実行する。サーバーへの画像アップロード処理は実装しない。

## 2. データ構造と型定義 (TypeScript)

開発の基盤となる主要な型定義。

```typescript
// 画像の処理ステータス
type ProcessStatus = 'idle' | 'processing' | 'completed' | 'error';

// ユーザーが設定可能な画像サイズ・形式
interface ExportSettings {
  targetWidth: number;     // 出力する幅 (px)
  targetHeight: number;    // 出力する高さ (px)
  keepAspectRatio: boolean;// アスペクト比を維持するか (基本false: 指定サイズにクロップするため)
  format: 'image/jpeg' | 'image/png' | 'image/webp';
  quality: number;         // 0.1 ~ 1.0 (jpeg/webpのみ)
  fitMode: 'cover' | 'contain'; // cover=切り抜き, contain=余白追加(V2で検討)
}

// アプリ内で管理する個別の画像データ
interface ImageItem {
  id: string;              // UUID
  file: File;              // 元のファイルオブジェクト
  previewUrl: string;      // 表示用のObjectURL
  originalWidth: number;
  originalHeight: number;
  
  // 個別のクロップ設定 (react-easy-crop用)
  crop: { x: number; y: number }; 
  zoom: number;
  
  status: ProcessStatus;
}

// アプリケーション全体のステート
interface AppState {
  images: ImageItem[];
  globalSettings: ExportSettings; // 全体共通の設定
  isDragging: boolean;            // ドラッグオーバー中か
  
  // Actions
  addImages: (files: File[]) => void;
  removeImage: (id: string) => void;
  updateGlobalSettings: (settings: Partial<ExportSettings>) => void;
  updateImageCrop: (id: string, crop: {x: number, y: number}, zoom: number) => void;
}


3. コンポーネント設計
Atomic Designを簡略化し、機能単位で構成する。UIライブラリには shadcn/ui を採用。

src/components/
├── ui/                   # shadcn/ui コンポーネント群 (Button, Slider, Dialog等)
├── layout/
│   ├── header.tsx        # アプリタイトル、ダークモード切替
│   └── sidebar.tsx       # 左側設定パネル (ExportSettings操作)
├── features/
│   ├── dropzone.tsx      # react-dropzone使用。全画面オーバーレイまたはエリア指定
│   ├── image-grid.tsx    # ImageCardのリスト表示コンテナ
│   ├── image-card.tsx    # 個別画像のサムネイル、削除ボタン、編集トリガー
│   └── crop-modal.tsx    # react-easy-cropを使用した編集モーダル
└── providers/
    └── theme-provider.tsx # next-themes


4. 画像処理ロジック (Core Logic)
4.1 ライブラリ選定
画像読み込み・UI: react-dropzone

クロップUI: react-easy-crop

理由: 直感的なUI（ズーム、ドラッグ）を実装コスト低く実現できるため。

画像変換: HTML5 Canvas API

理由: 標準APIで十分高速。将来的に高画質化が必要な場合は pica を導入するが、初期リリースではCanvasの drawImage で実装する。

ZIP圧縮: jszip

ファイル保存: file-saver

4.2 変換フロー (Canvas処理)
Source作成: Image() オブジェクトを作成し、src に元画像をセットしてロード待機。

Canvas作成: OffscreenCanvas または document.createElement('canvas') で出力サイズのキャンバスを作成。

座標計算:

ExportSettings と ImageItem.crop (ズーム・位置) から、元画像の「どの範囲(sx, sy, sw, sh)」を切り取るか計算する。

デフォルト（編集なし）の場合は、中央配置（Center Crop）の座標を自動計算する。

描画: ctx.drawImage() を使用してリサイズ・クロップ描画。

Blob化: canvas.toBlob() で指定フォーマット（JPEG/PNG/WebP）のバイナリデータを生成。

ダウンロード: 生成されたBlobをダウンロードさせる。

5. Electron固有の実装方針
5.1 IPC通信の扱い
初期バージョンではコードの複雑化を防ぐため、「Webアプリとして振る舞う」 設計とする。

ファイル保存時: Electronの fs モジュールを使わず、ブラウザ標準の「ダウンロード」挙動（<a download>）を利用する。

これにより、Web版とElectron版でコードを分岐させる必要がなくなる。

5.2 ウィンドウ設定
メインウィンドウサイズ: 初期 1200x800 (リサイズ可)

メニューバー: 不要なデフォルトメニュー（File, Edit等）は非表示にする。

6. 開発環境・リンター設定
Framework: Next.js 14+ (App Router)

Language: TypeScript 5.x

Linter: ESLint (Next.js recommended)

Formatter: Prettier

Import Alias: @/* で src/* を参照