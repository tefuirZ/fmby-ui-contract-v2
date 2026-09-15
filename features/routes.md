# Features · 路由表与权限矩阵

> 完整路由清单（与 `apps/host/src/app/router/index.tsx` 对齐）。
> 主题可调整**导航组织与视觉呈现**，但不得漏掉契约功能、不得新增/删除路由。

---

## 公开 / 未登录

| Path | 守卫 | 用途 | 关联 API |
|---|---|---|---|
| `/install` | 无 | 首次安装 / 恢复模式 | `GET /api/install/status` |
| `/login` | 无 | 登录 | `POST /api/auth/login` |

> `/register`（注册页）、`/setup`（初始化）**尚未实现**（G-02）。

---

## 普通用户（已登录，`AuthGuard`）

| Path | 用途 | 关联 API |
|---|---|---|
| `/` | 首页 | `GET /api/browse/home/bootstrap` |
| `/history` | 播放历史 | `GET /api/browse/history` |
| `/libraries` | 媒体库列表 | `GET /api/browse/libraries` |
| `/libraries/:libraryId` | 单库浏览 | `GET /api/browse/libraries/{id}` |
| `/item/:itemId` | 条目详情 | `GET /api/items/{id}`、`/api/browse/items/{id}` |
| `/play/:itemId` | 播放页（全屏） | `/api/playback/*` |
| `/settings/profile` | 个人资料 | `GET/PUT /api/settings/user/profile` |
| `/settings/playback` | 播放设置 | `GET/PUT /api/settings/user/playback` |
| `/settings/appearance` | 外观 / 主题选择 | `GET/PUT /api/settings/user/appearance` |

**个人设置子布局**（`SettingsLayout`）：

- `/settings` → 重定向 `profile`
- `/settings/server/general` → 重定向 `/manage/site/settings`（旧路径保留）
- `/settings/server/security` → 重定向 `/manage/site/settings`
- `/settings/server/session-policy` → 重定向 `/manage/site/settings`

---

## 管理面（`manage:access`，`CapabilityGuard` + `ManageLayout`）

| Path | 用途 | 关联 API |
|---|---|---|
| `/manage` | 管理首页 | `GET /api/manage/overview` |
| `/manage/task-center` | 任务中心 | `/api/manage/task-center/*` |
| `/manage/media/add` | 添加媒体引导 | mounts / browse-directories |
| `/manage/media/items` | 媒体条目 | `GET /api/manage/media-items` |
| `/manage/media/items/:itemId` | 条目详情 | `GET /api/manage/media-items/{id}` |
| `/manage/media/libraries` | 媒体库 | `/api/manage/libraries/*` |
| `/manage/media/mounts` | 媒体来源 | `/api/manage/mounts/*` |
| `/manage/media/probe-tasks` | 媒体信息检测 | `/api/manage/probe-tasks` |
| `/manage/media/naming-scrape` | 命名与刮削 | `/api/manage/naming-scrape` |
| `/manage/collections` | 收藏合集 | `/api/manage/collections/*` |
| `/manage/site/users/registration-codes` | 邀请与注册码 | `/api/manage/registration-codes` |
| `/manage/site/users/accounts` | 用户账号 | `/api/manage/users` |
| `/manage/site/users/role-templates` | 权限模板 | `/api/manage/role-templates` |
| `/manage/site/rewards` | 积分与签到 | `/api/manage/rewards/*` |
| `/manage/site/security/sessions` | 当前会话 | `/api/manage/sessions` |
| `/manage/site/security/audit-logs` | 操作记录 | `/api/manage/audit-logs` |
| `/manage/site/security/runtime-logs` | 运行日志 | `/api/manage/runtime-logs` |
| `/manage/site/settings` | 站点设置 | `/api/admin/site-settings`、`/api/settings/server/*` |
| `/manage/site/license` | 授权与订阅 | `/api/manage/license/*` |
| `/manage/site/telegram` | Telegram Bot 配置 | `/api/manage/telegram-bot/*` |
| `/manage/site/secrets` | 密钥链管理 | `/api/manage/secrets/*` |
| `/manage/site/advanced` | 高级维护 | `/api/admin/*` |
| `/manage/site/tools/pan115-imghost` | 115 图床 | ⛔ 未实现（G-14） |

### 旧路径重定向（host 内置）

`/manage/media-items`、`/manage/libraries`、`/manage/mounts`、`/manage/probe-tasks`、
`/manage/naming-cleanup`、`/manage/registration-codes`、`/manage/users`、`/manage/role-templates`、
`/manage/sessions`、`/manage/audit-logs`、`/manage/runtime-logs`、`/manage/advanced`、
`/manage/site/config/{general,security,session-policy}`、`/manage/site/telegram-bot`、
`/manage/site/users/rewards` 等，均**重定向**到新路径（老书签不 404）。

---

## 落地策略

- 已登录访问 `/login` → 重定向 `/`
- 未登录访问受保护路由 → 重定向 `/login?next=...`
- 无 `manage:access` 访问 `/manage/*` → 渲染 403 页
- `/api/*` 未命中 → JSON 404（不当 SPA 页面）
- `/admin/*` 路径 → 兼容重定向到 `/manage/*`

---

## 权限矩阵（按能力）

| 能力 | 可见路由 |
|---|---|
| 无（公开） | `/install`、`/login` |
| 登录即可 | `/`、`/history`、`/libraries*`、`/item/*`、`/play/*`、`/settings/{profile,playback,appearance}` |
| `Browse` | 同「登录即可」的浏览类 |
| `Play` | `/play/:itemId` |
| `manage:access`（前端当前唯一管理守卫） | 整个 `/manage/*` |
| 端点级（后端仍校验） | 见 [`../api/auth.md`](../api/auth.md) §能力表 |

> ⚠️ 前端**尚未**按细粒度能力分守卫（G-07）——只要 `manage:access` 即能进所有管理页；
> 具体操作由后端按端点能力拦截（403）。
