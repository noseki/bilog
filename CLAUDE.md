# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイドです。

## コマンド

```bash
npm run dev      # 開発サーバー起動 (Vite)
npm run build    # 型チェック + 本番ビルド
npm run lint     # ESLint
npm run preview  # 本番ビルドのプレビュー
```

テストランナーは未設定。

## 環境構築

`.env_template` を `.env` にコピーし、Supabase の認証情報を記入する。

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## アプリ概要

**Bilog** は「自分の美容（髪型・ヘアカラー・ネイル等）の変遷を記録し、お金も管理する」アプリ。主なターゲットは10〜20代女性。

解決する課題:
- 過去の美容履歴（施術内容・写真）がすぐに思い出せない
- 美容費がいつの間にか膨らんでいて可視化できていない

差別化ポイント: 予約・検索系アプリではなく、**記録・比較・予算管理**に特化。施術前後の比較ビューや変遷ビューも差別化要素。

### MVPロードマップ

現在 **MVP1** から開発中。

| MVP | 内容 |
|-----|------|
| 1 | Supabase接続 & メール認証 / DB設計 / 記録一覧画面（タイムライン）/ デプロイ（Firebase Hosting）+ CI/CD（GitHub Actions）/ テスト |
| 2 | 記録追加・編集・削除画面（カテゴリ/日付/金額/メモ/サロン名/担当者名）/ 写真アップロード（Supabase Storage）/ テスト |
| 3 | 記録詳細画面（ビフォーアフター）/ 同カテゴリ時系列比較ビュー / テスト |
| 4 | 月の美容予算設定 / ホームに残予算・使用額・カテゴリ別グラフ表示 / 予算超過アラート / テスト |
| 5 | 全体動作確認・修正 / UI磨き込み / README / 記事投稿 / 余力: リマインダー・担当者満足度 |

### AI への依頼方針

React・TypeScript の学習目的で開発しているため、**実装はユーザー自身が行う**。AIへの依頼はバグ修正とスタイリング（Tailwind / shadcn）を中心とする。
本アプリはスマホユーザー向けであるが、PCで見ても違和感のないスタイリングにすること。

---

## アーキテクチャ

**Bilog** は美容ログ (hair/nail/lash/esthetic/medical) を記録するアプリ。React 19 + Vite + TypeScript + Supabase + Tailwind CSS v4 で構成。

### ルーティングと認証 (`src/App.tsx`)

セッション状態は `App` レベルで `supabase.auth.getSession()` と `onAuthStateChange` により管理される。2つのルートガードがページをラップする:

- `ProtectedRoute` — 未認証ユーザーを `/login` へリダイレクト
- `PublicRoute` — 認証済みユーザーを `/home` へリダイレクト

ルート: `/login`, `/signup`, `/reset-password`, `/update-password`, `/home`

### フィーチャー構成

ページは `src/features/` に配置。認証ページ (`LoginPage`, `SignUpPage`, `ResetPasswordPage`, `UpdatePasswordPage`) はそれぞれ **react-hook-form** + **zod** でフォームロジックを持つ。

認証フォーム共通の zod スキーマと型は `src/features/auth/schema.ts` にまとめられているが、`LoginPage` は現状インラインで独自スキーマを定義しており重複している。

### データ層

- `src/lib/supabase/client.ts` — Supabase クライアントのシングルトン
- `src/api/logs.ts` — データ取得関数 (現状 `fetchLogs` のみ)
- `src/types/index.ts` — 共通 TypeScript 型 (`Logs`)

`Logs` テーブルのカラム: `id`, `user_id`, `category` (hair/nail/lash/esthetic/medical), `title`, `detail`, `cost`, `done_at`, `next_interval_days`, `before_photo_url`, `after_photo_url`, `salon_name`, `staff_name`, `created_at`

### UI コンポーネント

`src/components/ui/` に shadcn/ui のプリミティブ (Button, Card, Input, Label) が入っている。`src/lib/utils.ts` に `cn()` ヘルパーがある。`src/components/` 以下にレガシーなコンポーネントファイル (`login-form.tsx` 等) が残っているが未使用。フィーチャーレベルのページコンポーネントを優先すること。

### パスエイリアス

`@/` は `src/` にマップされる (Vite + tsconfig で設定済み)。
