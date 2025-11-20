# 開発ワークフローと品質ガイド

## 1. 環境セットアップ
1. Node.js 20.x / pnpm 9.x を推奨 (`corepack enable`).
2. 依存インストール: `pnpm install`。
3. 環境変数テンプレート `.env.example` (必要時作成) を `.env.local` にコピーし、Electron/Next 双方で共有。
4. Electron 実行: `pnpm dev:desktop`（Next.js dev server + Electron shell を自動起動）、Web 実行: `pnpm dev:web`。コマンドは `package.json` で統一管理。

## 2. ブランチ戦略
- `main`: デプロイ可能な安定ブランチ。CI 通過後のみマージ。
- `develop`: 日常開発の統合ブランチ。必要に応じて運用。
- 機能ブランチ: `feature/<issue-id>-<short-desc>` (例: `feature/issue-02-crop-poc`).
- ホットフィックス: `fix/<issue-id>-<desc>`。
- マージは Pull Request 経由。最低 1 名のレビュー必須、Electron 関連は Desktop 担当確認。

## 3. コーディング規約
- TypeScript strict mode を有効化。型 any の使用は禁止 (例外はコメント `// TODO: refine type`).
- UI コンポーネントは `src/components` 以下で Atomic/機能別に配置し、shadcn/ui からの import は `src/components/ui` を経由。
- スタイルは Tailwind CSS を基本とし、レイアウトは CSS 変数 + テーマコンテキストを使用。
- 画像処理ロジックは `src/lib/image-process.ts` に集約し、副作用を避ける。
- ファイル命名: `kebab-case.tsx`, React コンポーネントは PascalCase。

## 4. テスト・検証
- 単体テスト: `pnpm test` (Vitest/Jest 想定)。Canvas ロジックはユーティリティ化しテスト可能に。
- Lint/Format: `pnpm lint`, `pnpm format`. PR 作成前に実行。
- E2E: Web は Playwright、Electron は smoke テスト (起動/画像変換/保存) を自動化。
- ベンチマーク: 進捗トラッカーに記載の KPI を計測し、`docs/progress_tracker.md` の備考へ記録。
- CI: `.github/workflows/ci.yml` が push / PR ごとに `pnpm lint` → `pnpm vitest run` → `pnpm bench:canvas` → `pnpm build:web` を自動実行。失敗時は PR で原因と再実行結果を共有。

## 5. コードレビュー チェックリスト
- 要件/仕様 (requirements.md, tech_spec.md) に沿っているか。
- 画像処理ロジックは再利用化され、副作用やメモリリークが無いか。
- UI はレスポンシブ (min-width 768px) とアクセシビリティ (キーボード操作/ARIA) を満たすか。
- エラーハンドリング: 画像読み込み失敗時のリカバリーがあるか。
- テレメトリ/ログ (必要であれば) が個人情報を含まないか。

## 6. リリースフロー
1. `main` でバージョン更新 (`pnpm version <patch|minor|major>` または手動)。
2. CHANGELOG/リリースノートを作成し、α リストへ共有。
3. Web: `pnpm build:web` → Vercel へデプロイ。
4. Desktop: `pnpm build:desktop` (electron-builder) → Windows `.exe` / macOS `.dmg` を生成し、署名・ウイルススキャン後に配布。
5. リリース結果と既知の問題を `docs/progress_tracker.md` スプリントログに記録。

## 7. サポート/フィードバック受付
- α リリース期間は GitHub Issues を一次窓口にする。
- 緊急バグは `fix/*` ブランチで即時修正、`main` に直接 cherry-pick。
- ユーザーフィードバックは週次で棚卸しし、プロジェクト計画のリスク/対応を更新。

## 8. テンプレート (Issue/PR)
```
### Issue テンプレート
- Summary: 
- 背景 / 目的:
- 受け入れ条件 (DoD):
- 参考資料:

### PR テンプレート
- この変更の目的
- 変更概要 (UI 変更はスクリーンショット)
- テスト内容 (`pnpm test`, `pnpm lint`, 手動確認)
- 関連 Issue
```
