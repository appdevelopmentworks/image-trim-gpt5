# 進捗トラッカー運用ガイド

プロジェクト全体の状態を 1 つのファイルで把握できるよう、以下のルールで更新します。

## 1. 更新ルール
1. デイリースタンドアップ前に担当者が担当タスクの「状況」「備考」を更新。
2. 新規タスクは PM/Tech Lead が ID を払い出し、`issue-<番号>` と GitHub Issue を紐付け。
3. 完了条件 (DoD) を備考に記載し、レビュー完了後に `Done` に移行。
4. ブロッカーは備考欄に `BLOCKER:` で明記し、対策 Issue も追記。

## 2. タスクボード (バックログ/進行中/完了)
| ID | タイトル | カテゴリ | 優先度 | 担当 | 状況 | 期限 | 備考 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| issue-01 | UI レイアウト初期構築 | Frontend | High | TBD | Done | Day 3 | App Router ページと shadcn/ui 導入済み |
| issue-02 | 画像トリミング PoC | Frontend | High | TBD | Done | Day 6 | react-easy-crop + Canvas トリミング / プレビュー付き出力 PoC 完了 |
| issue-03 | 変換ロジック単体テスト | QA | Medium | TBD | Done | Day 7 | 10 枚/30 秒 KPI ベンチ + Vitest を整備 |
| issue-04 | Electron IPC/保存処理 | Desktop | Medium | TBD | In Progress | Day 9 | 保存ダイアログ付き IPC save-file とアイコン適用を完了。残: ZIP/IPC 再利用と配布設計 |
| issue-05 | CI (Lint/Test/Build) パイプライン | DevOps | Medium | TBD | Done | Day 10 | GitHub Actions で lint/test/bench/build を自動実行 |
| issue-06 | α リリース準備 | PM | Medium | TBD | Done | Day 14 | リリースノート・FAQ を docs/ に追加済み |

> 必要に応じてこの表に行を追加/更新してください。

## 3. スプリントログ
| スプリント | 期間 | ゴール | 実績 / 振り返り |
| --- | --- | --- | --- |
| Sprint 1 | Day 1-5 | UI フレーム + 変換 PoC | App shell + dropzone scaffolded |
| Sprint 2 | Day 6-10 | Electron 統合 + CI パイプライン | _未着手_ |
| Sprint 3 | Day 11-14 | QA/リリース準備 | _未着手_ |

## 4. レポートテンプレート
```
### 日次レポート (例)
日付: 2025-11-20
担当: Alice
進捗: issue-01 UI レイアウト 80% 完了 (残: ドロップゾーン animation)
課題: BLOCKER - shadcn/ui のテーマ切替で CSS ずれ。PR #12 参照。
翌日対応: テーマ修正、issue-02 着手。
```

## 5. KPI メモ
- 1 回のバッチ処理 (10 枚) が 30 秒以内。
- Electron/Next.js ビルド警告 0。
- α 版で 5 名以上からフィードバック取得。
