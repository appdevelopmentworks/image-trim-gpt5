# プロジェクト計画: Image Resizer for Creators

## 1. プロジェクト目的と成功指標
- クリエイターが PC/WEB どちらの環境でも同じ UX で画像一括リサイズ・トリミングを完了できる状態を提供する。
- 目標: 主要テンプレート 6 種（SNS/ブログ/汎用）と任意サイズ入力、JPEG/PNG/WebP 出力、ZIP ダウンロードを α リリースまでに提供。
- 成功指標: 1 バッチ 10 枚の画像を 30 秒以内で変換できること、100% クライアントサイド処理でデータ流出リスクが無いこと、Electron/Next.js のビルドが CI で安定完走すること。

## 2. スコープと非スコープ
| 区分 | 内容 |
| --- | --- |
| スコープ | Next.js(App Router) フロント、Electron ランタイム、Canvas を用いた画像変換、ZIP 生成、設定 UI、ドラッグ&ドロップアップロード、react-easy-crop による個別トリミング |
| 非スコープ | 画像をクラウドに同期する機能、多人数コラボ編集、サーバーサイド変換、ユーザーアカウント/課金機能 |

## 3. 成果物
- **MVP**: Web 版 (Vercel) + Windows/macOS バイナリ、ZIP ダウンロード、テンプレート 6 種、個別/グローバル設定。
- **ドキュメント**: 要件仕様、技術仕様、開発ワークフロー、進捗トラッカー、本計画書。
- **CI**: lint/test/build を GitHub Actions で自動化 (Electron は package-only 検証)。

## 4. フェーズ別マイルストーン
| フェーズ | 想定期間 | 目的 | 主な成果物 | 担当/関係者 |
| --- | --- | --- | --- | --- |
| 0. 企画固め | Day 0-1 | 既存要件と技術方針の確認、ドキュメント整備 | requirements, tech_spec, 本計画 | PM, Tech Lead |
| 1. UI フレーム | Day 2-4 | Next.js ベース UI、shadcn/ui 導入、レイアウト/アクセシビリティ整備 (In progress: App shell + dropzone) | layout, dropzone, image-grid、Storybook/Chromatic(optional) | Frontend |
| 2. 画像処理 | Day 5-7 | Canvas + react-easy-crop でトリミング・リサイズ、設定 UI と紐付け | image-process.ts, cropper, 変換ロジックテスト | Frontend, QA |
| 3. Electron 包装 | Day 8-9 | Electron main/preload 実装、IPC・ファイル保存、builder 設定 | main.ts, preload.ts, electron-builder 設定 | Desktop |
| 4. 統合/試験 | Day 10-12 | E2E, バッチ処理性能測定、CI/CD 固定化 | Playwright/Electron smoke、CI ワークフロー | QA, DevOps |
| 5. α リリース | Day 13-14 | α 配布、フィードバック収集、改善計画作成 | リリースノート、サポートFAQ | All |

## 5. リスク・対応
| リスク | 影響 | 対応策 |
| --- | --- | --- |
| Canvas パフォーマンス不足 | 大量画像処理が遅延 | 画像 10 枚/回 を基準にベンチマーク、必要なら OffscreenCanvas/pica を導入 |
| Electron & Web での設定差異 | UX の一貫性低下 | 共通 UI コンポーネントと Hooks を共有、環境分岐は adapter に隔離 |
| 画像 EXIF による回転問題 | 出力が想定外になる | load 時に EXIF orientation を正規化、検証用サンプルを進捗トラッカーに登録 |
| Security/ライセンス | 再配布阻害 | OSS 依存のライセンスチェックをリリース前に実施、NOTICE を作成 |

## 6. コミュニケーションとレビュー
- デイリースタンドアップ (15 分) で進捗トラッカーを更新。
- スプリント終盤で demo/QA を実施し、課題は GitHub Issue + docs/progress_tracker.md に反映。
- PR は GitHub で行い、Tech Lead がコードレビュー、PM が機能受け入れを確認。

## 7. 依存関係
- Node.js 20+, pnpm/yarn のどちらかを標準化。
- Vercel プロジェクト、GitHub リポジトリ、Electron ビルド証明書 (macOS の場合) を早期準備。

## 8. 次のアクション
1. 進捗トラッカーのタスク ID を GitHub Issue と紐づけ。
2. Canvas ロジックの PoC を `src/lib/image-process.ts` で先行確認。
3. Electron ビルド用の署名手順を development_workflow.md に従って整備。
