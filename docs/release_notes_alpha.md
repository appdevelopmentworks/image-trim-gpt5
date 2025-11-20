# αリリースノート (Image Trim GPT5)

## 概要
- **バージョン**: v0.1.0-alpha
- **公開日**: 2025-11-20
- **対象**: Web (Next.js App Router) / Desktop (Electron PoC ※Phase3以降で同梱予定)

本リリースはクリエイター向け画像トリミング＆リサイズ体験の PoC 版です。10枚/30秒以内の高速変換と、react-easy-crop を利用したきめ細かな編集UXを検証することを目的としています。

## 新機能
1. **ドラッグ&ドロップ対応アップロード**
   - 複数画像を同時投入、Zustand ストアでキュー管理し、プレビューやメタ情報を即時表示。
2. **プリセット & カスタム出力設定**
   - SNS/ブログ/汎用テンプレートをワンクリック適用。任意の幅/高さ、JPEG/PNG/WebP、品質スライダーも提供。
3. **個別トリミング UI**
   - react-easy-crop により各画像へ独立した `crop/zoom` を保存。アスペクト固定／フリー両対応。
4. **Canvas ベースの変換パイプライン**
   - `src/lib/image-process.ts` で OffscreenCanvas + `createImageBitmap` を利用し、高速描画を実現。単体テストと KPI ベンチマーク付き。
5. **ZIP/単体ダウンロード**
   - 1枚の場合は個別保存、複数の場合は `images-<timestamp>.zip` を自動生成。file-saver + JSZip ベース。
6. **ステータス/統計パネル**
   - 待機/処理中/完了の進行状況を把握できるダッシュボードを搭載。
7. **CI パイプライン**
   - GitHub Actions で lint → vitest → bench:canvas → build:web を検証。性能回帰を即座に検知。

## インストール / 動作確認
- 依存関係: Node.js 20+, pnpm 9+
- 初期セットアップ: `pnpm install`
- Web 開発サーバー: `pnpm dev:web` → http://localhost:3000
- テスト: `pnpm lint`, `pnpm vitest run`, `pnpm bench:canvas`
- ビルド: `pnpm build:web`

## 既知の課題
| 分類 | 内容 | 対応計画 |
| --- | --- | --- |
| UI/UX | トリミング済みサムネイルの視覚的フィードバックが未実装 | issue-?? (バックログ) で検討 |
| Electron | `pnpm dev:desktop` は stub。IPC とZIP処理の統合が未実施 | Phase3 スプリントで対応 |
| ZIP | 非同期処理中の進捗バー未実装 | 進行中タスクに追加予定 |
| 国際化 | 日本語UIのみ。英語UI切替は backlog | 追加言語要件次第で拡張 |

## サポート / フィードバック
- バグ・要望: GitHub Issues (`issue-06` タグ)
- 緊急対応: `fix/*` ブランチで hotfix → `main` へ cherry-pick
- KPI レポート: `docs/progress_tracker.md` のスプリントログへ記載

## 参考コマンド
```bash
# Lint & Test
pnpm lint
pnpm vitest run
pnpm bench:canvas

# Web Build
pnpm build:web
```
