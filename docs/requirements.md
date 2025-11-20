# プロジェクト: Image Resizer for Creators (Desktop & Web)

## 1. プロジェクト概要
デジカメ写真やイラストを、WEBサイトやSNSなどの用途に合わせて最適なサイズ・アスペクト比に一括変換するアプリケーション。
まずはデスクトップアプリ（Electron）として開発し、将来的にWEBアプリ（Next.js on Vercel）としても公開可能なアーキテクチャを採用する。

## 2. 技術スタック
* **Framework:** Next.js (App Router)
* **Desktop Wrapper:** Electron (electron-builder)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **UI Components:** shadcn/ui (Radix UI based), Lucide React (Icons)
* **State Management:** React Hooks (useState, useReducer) or Zustand
* **Image Processing:** HTML5 Canvas API (Client-side only)
* **Cropping UI:** `react-easy-crop` (推奨)
* **Zip/Download:** `jszip`, `file-saver`

## 3. 機能要件

### 3.1 画像入力
* **ドラッグ＆ドロップ:** ウィンドウ内のドロップゾーンにファイルをドラッグして読み込み。
* **ファイル選択:** ボタンクリックでシステムダイアログから選択。
* **複数枚対応:** 1枚〜数十枚の一括読み込みが可能。

### 3.2 画像変換設定
* **用途選択 (プリセット):** ドロップダウンリストで選択。
    * ポートフォリオWEBサイト用 (例: 1920x1080, 1200x800)
    * ブログ・記事アイキャッチ用 (例: 1200x630)
    * SNS投稿用 (例: Square 1080x1080)
    * **ユーザー指定:** 幅(px)と高さ(px)を数値入力。
* **リサイズルール:**
    * **Crop (デフォルト):** 指定サイズのアスペクト比に合わせて、中央基準で切り抜き。
    * **手動調整:** ユーザーがトリミング位置を調整可能（後述）。
* **出力フォーマット:**
    * JPG / PNG / WebP から選択可能。

### 3.3 編集・調整機能
* **プレビュー一覧:** 読み込んだ画像と、変換後の予想範囲を表示。
* **トリミング調整モーダル:**
    * 特定の画像をクリックするとモーダルが開く。
    * 指定したアスペクト比の枠が表示され、ユーザーは画像をドラッグ/ズームして切り抜き位置を決定できる。

### 3.4 出力・保存
* **クライアントサイド処理:** サーバーへのアップロードは行わず、ブラウザ/Electron内で完結させる。
* **保存形式:**
    * 単一ファイルの場合: そのままダウンロード。
    * 複数ファイルの場合: `images.zip` のようにZIP圧縮してダウンロード。

## 4. UI/UX デザイン方針
* **テーマ:** シンプルでモダンなデザイン (shadcn/ui デフォルト)。
* **レイアウト:**
    * **Left/Top:** コントロールパネル（用途選択、サイズ入力、形式選択、保存ボタン）。
    * **Main:** 画像プレビューエリア（グリッド表示）。ここにドロップゾーンも兼ねる。
    * **Loading:** 変換処理中はプログレスバーまたはスピナーを表示。

## 5. ディレクトリ構成案 (Next.js + Electron)
```text
root/
├── main/                 # Electronのメインプロセス用コード
│   ├── main.ts
│   └── preload.ts
├── src/                  # Next.js (レンダラープロセス/WEB用)
│   ├── app/
│   │   ├── page.tsx      # メイン画面
│   │   └── layout.tsx
│   ├── components/       # UIコンポーネント
│   │   ├── ui/           # shadcn/ui components
│   │   ├── dropzone.tsx  # ファイル入力
│   │   ├── image-grid.tsx# プレビュー一覧
│   │   └── cropper.tsx   # トリミング調整用モーダル
│   ├── lib/
│   │   ├── utils.ts      # shadcn utils
│   │   └── image-process.ts # 画像リサイズ・Canvas処理ロジック
│   └── types/            # 型定義
├── package.json
└── next.config.js