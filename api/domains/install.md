# API · 安装引导

> 首次部署 / 恢复模式下可用。**端点可用性按端点不同**（见「下线判据」）——
> 不是「整体 404」，否则恢复流程无法进入。
> 不向未授权调用方确认安装子系统存在性。

鉴权：**公开**（带独立限流桶）。安装模式另有无条件 **Origin 闸**（见「错误」）。

---

## 端点

| 方法 路径 | 限流 | 请求 | 响应 | 错误 |
|---|---|---|---|---|
| `GET /api/install/status` | 读 60/min | — | `InstallStatusDto{state, database_configured, can_probe}` | 429 / 503 |
| `POST /api/install/probe/database` | 每目标 10/min ＋ 全局 60/min | `{kind, path?, url?}` | `InstallDatabaseProbeDto{kind, reachable, error_code?}` | 429 / 404 / 503 / 400 |
| `POST /api/install/probe/redis` | 端点桶 10/min ＋ 全局 60/min | `{url, password?, db?}` | `{ok}` | 429 / 404 / 503 / 400 |
| `POST /api/install/apply` | 同上 | `{database, cache?, admin, setup_token?}` | `InstallApplyDto{applied, auto_login, kind, id?, username?}` | 403 / 429 / 404 / 503 / 400 |
| `POST /api/install/complete` | 同上 | `{confirm_action}` | `InstallCompleteDto{completed, restart_required}` | 403 / 429 / 404 / 503 / 400 |

### probe/database 的 `error_code`

`reachable=true` 时省略；`reachable=false` 且为 PG 预检失败时携带五类之一
（DNS / TCP / 认证 / 库 / schema，SCREAMING_SNAKE），供安装页精确提示，不要只显示「不可达」。

---

## 一次性收全（apply）

`POST /api/install/apply` 同时收三组配置，成功后建管理员并自动登录：

- `database`（必填）：`{kind, path?, url?}` —— `kind` 与探测端点同口径。
- `cache`（可选）：`{kind?, url?, password?, db?}`；缺省 `kind="builtin"`。
- `admin`（必填）：`{username, password, display_name?}`。
- `setup_token`（字符串，**顶层字段**）。

### 安装口令（setup_token）

- **来源**：服务端启动时读取 `FMBY_SETUP_TOKEN`（未设置则生成），并**打印到启动日志横幅**。
  安装页第一步要求用户填写该口令。
- **校验**：缺失或不符 ⇒ **403 `install_setup_token_required`**。注意该字段是
  `#[serde(default)]` ⇒ **缺失不会 422**，而是走「口令不正确」的统一失败路径。
- **定位**：安装面是**匿名可写面**（无需登录），口令是唯一的接管闸；不要当作可选提示。

### complete 的确认串

`POST /api/install/complete` 的 `confirm_action` 必须**精确等于** `"complete-install"`，
否则 400。该常量同时存在于前端 `shared/src/contracts/auth/api.ts`。

### 热切换

成功完成后返回 `restart_required: false`（#640：进程内热切换，无需重启）。

---

## 下线判据（按端点，不统一）

| 端点 | 何时 404 |
|---|---|
| `GET /api/install/status` | **永不下线**（恢复流程入口） |
| `POST /api/install/probe/database` | `database_configured=true` |
| `POST /api/install/probe/redis` / `apply` | `database_configured=true` |
| `POST /api/install/complete` | **lock 文件已存在**（不是「已配置」）——apply 建完管理员正是 complete 的前提 |

> 四种判据各有理由（恢复流程 / INSTALL-APPLY-RETRY-TRAP 重试陷阱），不要合并成「已安装即整体 404」。

---

## 安全边界

- SQLite 探测**只读**（不建库）
- PG 探测有 **8s 超时**边界
- 错误响应**不含连接串原文**
- 写类限流：**每目标 10/min**（PG 按 `host:port`、SQLite 按 canonical path 分桶，防慢扫聚合绕过）
  **＋ 全局写帽 60/min**（防轮换目标绕过）
- 安装模式有**无条件 Origin 闸**：Origin 不符 ⇒ **403 `csrf_origin`**
  （安装 router 不经过主应用 CSRF 中间件，是独立实现）

---

## 错误

| HTTP | error_code | 场景 |
|---|---|---|
| 403 | `install_setup_token_required` | 安装口令缺失 / 不正确 |
| 403 | `csrf_origin` | 安装态 Origin 不符 |
| 429 | `rate_limited` | 读 / 端点桶 / 全局写帽超限 |
| 404 | — | 端点按上述判据下线 |
| 503 | — | 安装服务未装配 |

---

## 前端用法

安装页（`/install`）：读 status → 探测（database / redis）→ `apply`（含口令）→ `complete`。

> `POST /api/auth/setup`、`POST /api/auth/register` 已实现（api-fields implemented）；
> 前端注册/初始化页仍缺，见 [`../../features/implementation-status.md`](../../features/implementation-status.md) G-02。