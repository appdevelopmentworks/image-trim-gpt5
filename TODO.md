# TODOリスト（フェーズ1：UI & 画像トリミング）

## ✅ 完了済み
- Next.js + Tailwind ベースのワークスペースを作成し、`pnpm dev:web` で起動確認
- AppShell（ヘッダー / 設定パネル / ドロップゾーン / ステータスカード / 画像カード）を実装し、日本語UIへ反映
- Zustand ストアで画像キュー管理・メタデータ取得・ドラッグ状態を制御
- UI から `src/lib/image-process.ts` を呼び出し、バッチ出力フローを構築（issue-02）
- react-easy-crop を導入して個別画像のトリミングUIを提供（issue-02）
- react-easy-crop で保存したクロップ結果のプレビューをミニサムネイル表示
- Canvas 変換ロジックの単体テストと 10 枚/30 秒 KPI ベンチマークを整備（issue-03）
- 複数ファイルの ZIP 出力と単ファイル直接ダウンロードを実装し、UI ボタンに反映（issue-04）
- GitHub Actions CI（lint / vitest / bench:canvas / build:web）を整備（issue-05）
- αリリース向けリリースノート・FAQ 草案を追加（issue-06）
- Electron preload/main に保存ダイアログ付き IPC を追加し、書き出し時にデスクトップ保存へ分岐
- `docs/AppImg.jpg` を元に Web ファビコンと Electron アプリアイコンを作成・適用
- 縦横比を自動計算して指定サイズ内へフィットするリサイズ設定と縦横の自動判別（幅/高さ入替）を実装（オン/オフ切替可）
- プリセットに「自動調整（縦横判別）」を追加し、デフォルト選択・説明文折り返し・ボタン高さ/レイアウトを調整
- フォントサイズと行間を全体的に引き上げ、サイドパネル幅を拡大して視認性を改善

## 🔄 進行中 / 要フォロー
- ベンチスクリプト/ZIP 処理を Electron 側（Phase 3）でも再利用できるよう実行環境を整理
- Electron (`pnpm dev:desktop`) での IPC/Zip 連携と保存ダイアログ実装を計画

## 🔜 今後着手する項目
- Canvas ベンチ/テストのCI組み込みと定期計測（issue-03 フォロー）
- Electron メインプロセスとの連携設計（Phase 3 / `pnpm dev:desktop` の本実装）
- GitHub Actions での Electron ビルド/配布（Phase 3 以降）
