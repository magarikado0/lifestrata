# LifeStrata

タスク管理と目標設計を統合したモバイルファーストのPWAアプリです。

## 機能

### タスク画面
- 週間カレンダービューでの日付ナビゲーション
- 時間帯別タスク表示（午前・午後・夜・時間未設定）
- 30分単位での時刻設定（0:00〜23:30）
- タスクの完了管理
- 目標へのリンク機能

### 目標画面
- 階層的な目標ツリー（無制限の深さ）
- ドラッグ&ドロップによる並び替え
- 期限設定（日付・時刻）
- 関連タスクのバッジ表示
- 展開・折りたたみ状態の保持

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| フレームワーク | React 19 + TypeScript |
| ビルドツール | Vite |
| スタイリング | Tailwind CSS |
| バックエンド | Supabase (認証・DB) |
| ドラッグ&ドロップ | dnd-kit |
| PWA | vite-plugin-pwa + Workbox |

## セットアップ

### 前提条件

- Node.js
- Supabaseアカウントとプロジェクト

### 環境変数の設定

```bash
cd frontend
cp .env.example .env
```

`.env` を編集してSupabaseの認証情報を設定します。

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### データベースのセットアップ

Supabaseのダッシュボードで `supabase/schema.sql` を実行してテーブルを作成します。

### インストールと起動

```bash
cd frontend
npm install
npm run dev
```

### ビルド

```bash
npm run build
```

## プロジェクト構成

```
lifestrata/
├── frontend/          # React + Vite アプリ
│   ├── src/
│   │   ├── components/
│   │   │   ├── TaskScreen/   # タスク管理画面
│   │   │   ├── GoalScreen/   # 目標管理画面
│   │   │   ├── auth/         # 認証画面
│   │   │   └── common/       # 共通コンポーネント
│   │   ├── hooks/            # useTasks, useGoals
│   │   ├── api/              # Supabase API呼び出し
│   │   ├── lib/              # Supabaseクライアント
│   │   └── types/            # TypeScript型定義
│   └── .env.example
├── supabase/
│   └── schema.sql    # DBスキーマ
└── spec.md           # 仕様書
```
