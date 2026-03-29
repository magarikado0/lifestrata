-- LifeStrata schema
-- Supabase ダッシュボードの SQL Editor で実行する

create table if not exists goals (
  id               bigint primary key generated always as identity,
  user_id          uuid references auth.users not null,
  parent_id        bigint references goals(id) on delete cascade,
  text             text not null,
  "order"          integer not null default 0,
  open             boolean not null default true,
  deadline         date,
  deadline_minutes integer,
  created_at       timestamptz not null default now()
);

create table if not exists tasks (
  id          bigint primary key generated always as identity,
  user_id     uuid references auth.users not null,
  text        text not null,
  date        date not null,
  has_time    boolean not null default false,
  minutes     integer,
  end_minutes integer,
  done        boolean not null default false,
  goal_id     bigint references goals(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- 既存テーブルへのマイグレーション
-- alter table tasks add column if not exists end_minutes integer;

-- インデックス
create index if not exists tasks_user_date on tasks(user_id, date);
create index if not exists goals_user_parent on goals(user_id, parent_id);

-- RLS 有効化
alter table tasks enable row level security;
alter table goals enable row level security;

-- ポリシー: 自分のデータのみ操作可能
create policy "tasks: own data" on tasks for all using (auth.uid() = user_id);
create policy "goals: own data" on goals for all using (auth.uid() = user_id);
