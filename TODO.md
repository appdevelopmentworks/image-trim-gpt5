# TODOリスト（フェーズ1：UI & 画像トリミング）

## ✅ 完了済み
- Next.js + Tailwind ベースのワークスペースを作成し、`pnpm dev:web` で起動確認
- AppShell（ヘッダー / 設定パネル / ドロップゾーン / ステータスカード / 画像カード）を実装し、日本語UIへ反映
- Zustand ストアで画像キュー管理・メタデータ取得・ドラッグ状態を制御
- UI から `src/lib/image-process.ts` を呼び出し、バッチ出力フローを構築（issue-02）
- react-easy-crop を導入して個別画像のトリミングUIを提供（issue-02）
- Canvas 変換ロジックの単体テストと 10 枚/30 秒 KPI ベンチマークを整備（issue-03）
- 複数ファイルの ZIP 出力と単ファイル直接ダウンロードを実装し、UI ボタンに反映（issue-04）
- GitHub Actions CI（lint / vitest / bench:canvas / build:web）を整備（issue-05）
- αリリース向けリリースノート・FAQ 草案を追加（issue-06）

## 🔄 進行中 / 要フォロー
- react-easy-crop で保存したクロップ結果のプレビュー（ミニサムネイルなど）が必要か検討
- ベンチスクリプト/ZIP 処理を Electron 側（Phase 3）でも再利用できるよう実行環境を整理
- Electron (`pnpm dev:desktop`) での IPC/Zip 連携と保存ダイアログ実装を計画

## 🔜 今後着手する項目
- Canvas ベンチ/テストのCI組み込みと定期計測（issue-03 フォロー）
- Electron メインプロセスとの連携設計（Phase 3 / `pnpm dev:desktop` の本実装）
- GitHub Actions での Electron ビルド/配布（Phase 3 以降）
