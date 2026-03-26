# タスク管理 × 人生設計アプリ 仕様書

## 概要

PWA対応のスマホファーストアプリ。タスク管理（週カレンダー）と人生設計（目標ツリー）を
タブで切り替えられる1画面構成。

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | React + Vite + Tailwind CSS |
| バックエンド | Go（REST API） |
| インフラ | Oracle Cloud + Ubuntu Server + Nginx |
| DB | PostgreSQL（Oracle Cloud上） |
| PWA | vite-plugin-pwa（Workbox） |

---

## 画面構成

```
App
├── TabBar（下部固定）
│   ├── タスクタブ（週カレンダー）
│   └── 人生設計タブ（目標ツリー）
│
├── TaskScreen
│   ├── Header（日付ナビ）
│   │   ├── 週ストリップ（7日 × 曜日ピル）
│   │   └── 時間帯フィルター（すべて/午前/午後/夜/時間なし）
│   ├── TaskList（セクション別ソート済みリスト）
│   └── AddBar（テキスト入力 + 時間スライダー）
│
└── GoalScreen
    ├── Header
    ├── GoalTree（再帰ツリー、深さ任意）
    └── AddBar（ルートゴール追加）
```

---

## タスク仕様

### データモデル

```go
type Task struct {
    ID        uint      `json:"id"`
    UserID    uint      `json:"user_id"`
    Text      string    `json:"text"`
    Date      time.Time `json:"date"`       // 日付（時刻なしの場合もある）
    HasTime   bool      `json:"has_time"`   // 時刻指定があるか
    Minutes   *int      `json:"minutes"`    // 0:00からの分数（HasTime=trueのとき）
    Done      bool      `json:"done"`
    GoalID    *uint     `json:"goal_id"`    // 紐付けゴールのID（任意）
    CreatedAt time.Time `json:"created_at"`
}
```

### 表示ルール

- 時刻あり → 午前（〜12:00）/ 午後（12:00〜17:00）/ 夜（17:00〜）に自動振り分け
- 時刻なし → 「時間なし」セクション
- 各セクション内は時刻順ソート
- 完了タスクは最下部にまとめる

### 時間入力UI

- 「時間なし」テキストをタップ → スライダーが出現
- スライダー範囲: 0:00 〜 23:30（30分刻み、step=1で47ステップ）
- 時刻表示: HH:MM形式
- 「× 時間なし」ボタンで時刻を外せる

### 日付ナビ

- 週ストリップ（月〜日の7ピル）をスワイプで前後週に移動
- タスクがある日はオレンジの点インジケーター
- 「今日」ボタンで今日に戻る

---

## 人生設計（目標ツリー）仕様

### データモデル

```go
type Goal struct {
    ID        uint      `json:"id"`
    UserID    uint      `json:"user_id"`
    ParentID  *uint     `json:"parent_id"` // nilならルートノード
    Text      string    `json:"text"`
    Order     int       `json:"order"`     // 同階層内の並び順
    Open      bool      `json:"open"`      // 展開/折りたたみ状態
    CreatedAt time.Time `json:"created_at"`
}
```

- スケール（人生/年/四半期/月）はラベルなし。テキストと階層の深さで表現する。
- 深さは任意（制限なし）

### ツリー操作

| 操作 | UI |
|---|---|
| 展開/折りたたみ | ▸/▾ トグルボタン |
| 子ゴール追加 | ＋ボタン → モーダル入力 |
| タスクと紐付け | ⇢ボタン → タスクIDを紐付け（オレンジバッジで表示） |
| 削除 | ✕ボタン（子ごと削除） |
| ルート追加 | 下部AddBarから |

### タスクとの紐付け

- ゴールノードにタスクIDを複数紐付け可能
- タスク側にも `goal_id` を持つ（双方向参照）
- 紐付けバッジをタップすると紐付け解除

---

## API設計（Go）

### エンドポイント一覧

```
# Tasks
GET    /api/tasks?date=2026-03-26        # 指定日のタスク一覧
GET    /api/tasks?from=2026-03-23&to=2026-03-29  # 期間指定
POST   /api/tasks                         # タスク作成
PATCH  /api/tasks/:id                     # タスク更新（done切替など）
DELETE /api/tasks/:id                     # タスク削除

# Goals
GET    /api/goals                         # ツリー全体（ネスト済みJSON）
POST   /api/goals                         # ゴール作成
PATCH  /api/goals/:id                     # ゴール更新（テキスト/open状態）
DELETE /api/goals/:id                     # ゴール削除（子ごと）
PATCH  /api/goals/:id/link                # タスクと紐付け { task_id: number }
DELETE /api/goals/:id/link/:task_id       # 紐付け解除
```

### レスポンス例

```json
// GET /api/goals（ネスト済み）
[
  {
    "id": 1,
    "text": "深層研究で起業する",
    "parent_id": null,
    "open": true,
    "linked_tasks": [
      { "id": 3, "text": "ABM実装の続き", "done": false }
    ],
    "children": [
      {
        "id": 2,
        "text": "修士で研究成果を出す",
        "parent_id": 1,
        "open": true,
        "linked_tasks": [],
        "children": []
      }
    ]
  }
]
```

---

## UI設計

### カラー・スタイル

```css
/* ベース */
--bg: #FAFAF8;
--text-primary: #1a1a1a;
--text-secondary: #888;
--text-muted: #bbb;
--border: #EEEDEA;

/* アクセント */
--amber: #F9A825;   /* 今日インジケーター、紐付けバッジ */
--morning: #F9A825; /* 午前セクション */
--afternoon: #42A5F5; /* 午後セクション */
--evening: #AB47BC;   /* 夜セクション */
```

### タブバー（下部固定）

```
[  タスク  |  人生設計  ]
```

- アイコン + ラベルのシンプルな2タブ
- アクティブタブは `#1a1a1a`、非アクティブは `#bbb`

### アニメーション

- タブ切り替え: フェード（150ms）
- タスク完了: チェックアニメーション + テキストに打ち消し線
- ツリー展開/折りたたみ: 高さのトランジション（200ms）

---

## PWA設定

```json
// vite-plugin-pwa の manifest
{
  "name": "LifeStrata",
  "short_name": "LifeStrata",
  "display": "standalone",
  "background_color": "#FAFAF8",
  "theme_color": "#1a1a1a",
  "orientation": "portrait"
}
```

- オフライン対応: タスクと目標をIndexedDBにキャッシュ、オンライン復帰時に同期
- ホーム画面追加プロンプトを表示

---

## ディレクトリ構成（フロントエンド）

```
src/
├── components/
│   ├── TaskScreen/
│   │   ├── TaskScreen.tsx
│   │   ├── WeekStrip.tsx
│   │   ├── TaskList.tsx
│   │   ├── TaskItem.tsx
│   │   ├── TimeSlider.tsx
│   │   └── AddBar.tsx
│   ├── GoalScreen/
│   │   ├── GoalScreen.tsx
│   │   ├── GoalTree.tsx
│   │   ├── GoalNode.tsx
│   │   └── AddBar.tsx
│   └── common/
│       ├── TabBar.tsx
│       └── Modal.tsx
├── hooks/
│   ├── useTasks.ts
│   └── useGoals.ts
├── api/
│   ├── tasks.ts
│   └── goals.ts
├── types/
│   └── index.ts
└── App.tsx
```

## ディレクトリ構成（バックエンド）

```
backend/
├── main.go
├── handler/
│   ├── task.go
│   └── goal.go
├── model/
│   ├── task.go
│   └── goal.go
├── db/
│   └── db.go
└── middleware/
    └── cors.go
```

---

## インフラ（Oracle Cloud）

- Ubuntu Server 22.04
- Nginx: フロントエンドの静的ファイル配信 + `/api/*` をGoにリバースプロキシ
- Go: systemdでデーモン管理
- PostgreSQL: ローカルで動かす（同一インスタンス）
- HTTPS: Let's Encrypt（Certbot）

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    location / {
        root /var/www/planner/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080;
    }
}
```

---

## 実装優先順位

1. **フロントエンドのみでローカル動作**（APIなし、useState管理）
2. **GoバックエンドのAPIを実装**（PostgreSQL接続）
3. **フロントをAPIに繋ぎ込む**（useTasks / useGoals フック）
4. **Oracle Cloudにデプロイ**（Nginx + systemd）
5. **PWA対応**（オフラインキャッシュ）
