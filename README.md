# Image Trim GPT5

クリエイター向けの高速画像トリミング・リサイズ PoC です。Next.js(App Router) をレンダラーに採用し、Electron (Phase 3) でデスクトップ版を同梱予定です。クライアントサイドの Canvas 処理により、10 枚 / 30 秒以内のバッチ変換 KPI を満たすことを目標としています。

## 主な機能
- ドラッグ&ドロップ対応アップロードと画像キュー管理（Zustand）
- プリセット / カスタム出力設定（幅・高さ・形式・品質）
- react-easy-crop による個別トリミングとズーム
- Canvas + OffscreenCanvas を用いた変換ロジック（`src/lib/image-process.ts`）
- 1枚なら単体ダウンロード、複数枚なら JSZip で ZIP 書き出し
- ステータス/統計カードによる進行状況の可視化
- GitHub Actions CI（lint → vitest → bench:canvas → build:web）

## セットアップ
```bash
pnpm install
```

必要バージョン: Node.js 20+ / pnpm 9+

## 開発コマンド
| コマンド | 説明 |
| --- | --- |
| `pnpm dev:web` | Next.js 開発サーバー（http://localhost:3000） |
| `pnpm dev:desktop` | Next.js dev server + Electron を自動起動（`main/main.js` を参照） |
| `pnpm lint` | ESLint（Next.js preset） |
| `pnpm vitest run` | Vitest（Canvas 処理の単体テスト付き） |
| `pnpm bench:canvas` | Canvas ベンチマーク（10 枚 / 30 秒 KPI の計測） |
| `pnpm build:web` | Web ビルド（Vercel デプロイ想定） |

## テストとベンチ
- ユニットテストは `tests/lib/image-process.test.ts` に集約。`tests/setup/canvas-polyfill.ts` で Node 環境でも OffscreenCanvas を利用できるよう polyfill 済みです。
- ベンチスクリプトは `scripts/benchmarks/canvas-benchmark.ts`。`CANVAS_BENCH_BATCH` などの環境変数でバッチサイズを調整できます。

## デスクトップ (Electron)
- `main/main.js` が BrowserWindow を生成し、`preload.js` で `desktopAPI` を公開。
- `pnpm dev:desktop` は Next.js 開発サーバーが応答するまで待機した後、Electron を起動します。
- 今後のフェーズで IPC を介した ZIP / 保存処理や `pnpm build:desktop` を実装予定。

## ドキュメント
- `docs/requirements.md` / `docs/tech_spec.md` … 要件と詳細設計
- `docs/project_plan.md` / `docs/progress_tracker.md` … スプリント計画と進捗
- `docs/development_workflow.md` … ブランチ戦略・テスト方針
- `docs/release_notes_alpha.md` … αリリースノート
- `docs/faq.md` … よくある質問
- `TODO.md` … 直近タスク一覧

## 既知課題
- トリミング済みサムネイルの視覚的フィードバック
- Electron 側での ZIP/保存処理の IPC 化
- 多言語対応（現状は日本語 UI のみ）

これらのタスクは `docs/progress_tracker.md` / `TODO.md` にてバックログ管理しています。 README に変更が必要な場合は同ファイルを更新してください。
