# Repository Guidelines

## Project Structure & Module Organization
- `docs/` holds requirements, technical specs, plans, and progress trackers—update these before major feature work.
- Application code lives under `src/` (Next.js App Router) and `main/` (Electron main/preload). Shared utilities such as `image-process.ts` go in `src/lib/`.
- UI components belong to `src/components/` (with `components/ui/` reserved for shadcn/ui exports). Tests mirror the source tree under `tests/` or `src/**/__tests__`.

## Build, Test, and Development Commands
- `pnpm install` — install dependencies with Node.js 20+/pnpm 9+.
- `pnpm dev:web` — start the Next.js dev server.
- `pnpm dev:desktop` — run Electron with the bundled Next.js renderer.
- `pnpm test` — execute unit tests (Vitest/Jest) and fail on coverage regressions.
- `pnpm lint` / `pnpm format` — run ESLint (Next.js preset + tailor rules) and Prettier before committing.
- `pnpm build:web` / `pnpm build:desktop` — produce Vercel-ready artifacts and electron-builder packages.

## Coding Style & Naming Conventions
- TypeScript strict mode; avoid `any` unless accompanied by a TODO to refine.
- React components use PascalCase files (e.g., `ImageGrid.tsx`); hooks/utilities use kebab-case (e.g., `use-image-drop.ts`).
- Tailwind CSS provides layout/styles; share theme tokens through `src/components/providers/`.
- Keep image-processing logic pure and centralized in `src/lib/image-process.ts` for testability.

## Testing Guidelines
- Prefer colocated tests named `<file>.test.ts` or `<feature>.spec.tsx`.
- Cover Canvas conversions with deterministic fixtures (10 images/30s KPI). Add Playwright/Electron smoke tests for E2E flows when touching UX-critical paths.
- Run `pnpm test --runInBand` before large refactors to ensure deterministic snapshots.

## Commit & Pull Request Guidelines
- Use `feature/<issue-id>-short-desc` branches; commits should follow imperative Conventional Commit-style summaries (e.g., `feat: add crop modal state`).
- Reference the matching GitHub Issue ID in the PR body and update `docs/progress_tracker.md` when status changes.
- PR description must include: purpose, summary of major changes, testing evidence (`pnpm test`, `pnpm lint`), and UI screenshots/GIFs when visual output changes.
- Require at least one reviewer (Desktop lead for Electron work); resolve all comments before merging `develop` into `main`.

## Security & Configuration Tips
- Keep processing entirely client-side; never upload images to third parties.
- Store environment secrets (if any) in `.env.local` and never commit them. Use `.env.example` to document required keys.

## Current Development Status (2025-11-19)
- App shell（ヘッダー / 設定 / ドロップゾーン / 画像グリッド）は実装済みで、日本語UIへ翻訳済み。
- `src/store/use-image-store.ts` と `src/lib/image-process.ts` を追加済み。まだUIから処理を呼び出していないため PoC を継続すること。
- Electron 側 `pnpm dev:desktop` は `scripts/dev-desktop.mjs` の stub。Phase 3 で本実装予定。
- 最新TODOは `TODO.md` に整理しているので、着手前に更新・参照すること。

## Near-Term Focus
1. issue-02（画像トリミングPoC）: react-easy-crop の導入と `image-process.ts` 連携。
2. issue-03: Canvas ベンチマーク/テスト（10枚/30秒 KPI）を満たす検証。
3. issue-04 以降を見据え、書き出し済みファイルのZIPダウンロードと Electron IPC 設計を並行検討。
