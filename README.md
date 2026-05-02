# Bilog

自分の美容（髪型・ヘアカラー・ネイル等）を記録し、美容費も管理するアプリです。

過去の施術内容や写真をカテゴリ別に記録し、ビフォーアフター比較・時系列ビュー・月次予算管理ができます。

## 技術スタック

| 領域 | 技術 |
|------|------|
| ランタイム | Node.js 22 / npm |
| フロントエンド | React 19, TypeScript |
| ビルド | Vite |
| UI | Tailwind CSS v4, shadcn/ui v4 |
| DB / Auth / Storage | Supabase (PostgreSQL) |
| ホスティング | Firebase Hosting |
| テスト | Vitest, React Testing Library |
| CI/CD | GitHub Actions |
| その他ライブラリ | react-hook-form, zod, TanStack Query, react-router-dom, Recharts, react-select |


## 環境設定

### 1. リポジトリをクローン

```bash
git clone https://github.com/noseki/bilog.git
cd bilog
```

### 2. 依存関係のインストール

前提：**Node.js**がインストールされている必要があります

```bash
npm install
```

### 3. 環境変数の設定

[Supabase](https://supabase.com)にてアカウントおよびプロジェクトを作成し、
`.env_template`を`.env`(プロジェクトルート下に作成)にコピーし、Supabaseの認証情報を記入してください。

```bash
cp .env_template .env
```

`.env` に以下を設定します:

```bash
# SupabaseのプロジェクトID（「Project Settings」>「Data API」内のAPI URL ）
VITE_SUPABASE_URL=https://XXXXXXXXXXXXXXX.supabase.co
# SupabaseのAPI KEY（「Project Settings」>「API Keys」>「Legacy anon, service_role API keys」タブ内のanon/public key）
VITE_SUPABASE_ANON_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 4. DBの準備

Supabaseのプロジェクト内で下記4つのテーブルをそれぞれ準備してください。

`logs`
```
create table public.logs (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  category text not null,
  title text not null,
  detail text null,
  cost integer not null default 0,
  done_at date not null,
  next_interval_days smallint null,
  before_photo_url text null,
  after_photo_url text null,
  salon_name text null,
  staff_name text null,
  created_at timestamp with time zone not null default now(),
  constraint logs_pkey primary key (id),
  constraint logs_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint category check (
    (
      category = any (
        array[
          'hair'::text,
          'nail'::text,
          'lash'::text,
          'esthetic'::text,
          'medical'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;
```
**注）現時点でnext_interval_daysカラムは未使用（拡張時に使用予定）**

`salons`
```
create table public.salons (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  name text not null,
  address text null,
  map_url text null,
  created_at timestamp with time zone not null default now(),
  constraint salons_pkey primary key (id),
  constraint salons_user_id_name_unique unique (user_id, name),
  constraint salons_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;
```
**注）現時点でaddress, map_urlカラムは未使用（拡張時に使用予定）**

`staffs`
```
create table public.staffs (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  salon_id uuid not null,
  name text not null,
  rating smallint null,
  notes text null,
  created_at timestamp with time zone not null default now(),
  constraint staffs_pkey primary key (id),
  constraint staffs_user_id_salon_id_name_unique unique (user_id, salon_id, name),
  constraint staffs_salon_id_fkey foreign KEY (salon_id) references salons (id) on delete CASCADE,
  constraint staffs_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint rating check (
    (
      (rating >= 1)
      and (rating <= 5)
    )
  )
) TABLESPACE pg_default;
```
**注）現時点でrating, notesカラムは未使用（拡張時に使用予定）**

 `budgets`
```
create table public.budgets (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  year_month text not null,
  amount integer not null,
  constraint budgets_pkey primary key (id),
  constraint budgets_user_month_unique unique (user_id, year_month),
  constraint budgets_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;
```

`RLS`の設定として、下記も実行してください。

```
-- logs
alter table logs enable row level security;
create policy "logs: 自分のデータのみ" on logs
  for all using (auth.uid() = user_id);

-- salons
alter table salons enable row level security;
create policy "salons: 自分のデータのみ" on salons
  for all using (auth.uid() = user_id);

-- staffs
alter table staffs enable row level security;
create policy "staffs: 自分のサロンのみ" on staffs
  for all using (
    exists (
      select 1 from salons
      where salons.id = staffs.salon_id
      and salons.user_id = auth.uid()
    )
  );

-- budgets
alter table budgets enable row level security;
create policy "budgets: 自分のデータのみ" on budgets
  for all using (auth.uid() = user_id);
```

### 5. Supabase Storageの準備

画像の格納先にはSupabase Storageを用います。

【バケットの作成】
 1. Supabaseプロジェクトにログイン
 2. 左側メニュー → Storage → New bucketボタン押下
 3. バケット名：`images`
 4. Createをクリック

【バケットのRLS設定】
 1. Supabase管理画面 → Storage → 該当バケットを選択（images）
 2. 上部タブ「Policies」に移動
 3. New Policy を押して、それぞれ以下のように入力：

🛡 SELECT ポリシー

Name: Allow owner to read
Operation: SELECT
Expression:

```
bucket_id = 'images' AND auth.uid() = owner
```

🛡 INSERT ポリシー

Name: Allow any user to insert
Operation: INSERT
Expression:

```
auth.uid() IS NOT NULL
```

🛡 UPDATE ポリシー

Name: Allow owner to update
Operation: UPDATE
Expression:

```
bucket_id = 'images' AND auth.uid() = owner
```

🛡 DELETE ポリシー

Name: Allow owner to delete
Operation: DELETE
Expression:

```
bucket_id = 'images' AND auth.uid() = owner
```

### 6. メール認証

メール認証にはSupabase Authを用います。

メールのテンプレートメッセージを変更するには、
Supabaseプロジェクトの左側メニュー → Authentication → Email内の
`Templates`タブから各種テンプレートの編集ができます。

【Confirm sign up】

`Subject`
```
【Bilog】新規会員登録確認用URLの送付
```

`Body`
```
<h2>Bilogへようこそ！</h2>

<p>Bilogを活用すれば、今までの美容履歴を記録しながらコスト管理もできます！</p>
<p style="font-weight: bold">以下のURLをクリックして、メールアドレスの確認を行なってください。</p>
<p><a href="{{ .ConfirmationURL }}">登録を完了する</a></p>
```

【Reset password】

`Subject`
```
【Bilog】パスワード再設定用URLの送付
```

`Body`
```
<h2>パスワード再設定用URL</h2>

<p>パスワード再設定の申請を受け付けました。</p>
<br />
<p>下記URLより再設定してください。</p>
<p><a href="{{ .ConfirmationURL }}">パスワードを再設定する</a></p>
```

⚠️ Supabaseの無料プランはメール送信が1時間あたり3通に制限されておりますので、適宜カスタムSMTPを設定してください。

  例）Gmail SMTPを使う方法

  SupabaseのSMTP設定をGmailに向けることで上限を500通/日に引き上げられます。

  手順

  1. Googleアカウントで2段階認証を有効にする
  - Googleアカウント > セキュリティ > 2段階認証プロセス

  2. アプリパスワードを発行する
  - Googleアカウント > セキュリティ > 2段階認証 > アプリパスワード
  - アプリ名は任意（例: "Supabase"）→ 16桁のパスワードが発行される

  3. SupabaseのSMTP設定に入力する
  - Supabase Dashboard > Authentication > Email > SMTP Settingsタブ

  - 以下を入力:

| 項目 | 値 |
|------|------|
| Sender email | あなたのGmailアドレス |
| Sender name | Bilog |
| Host | smtp.gmail.com |
| Port | 587 |
| Username | あなたのGmailアドレス |
| Password | 手順2で発行した16桁のアプリパスワード |

## 起動方法（開発サーバー）

```bash
npm run dev       # 開発サーバー起動 (http://localhost:5173)
```

## その他コマンド

```bash
make test         # テスト実行
make deploy       # Firebase Hosting へビルド＆デプロイ
```
