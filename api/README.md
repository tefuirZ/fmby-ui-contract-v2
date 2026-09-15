# API 契约总览

> FMBY v2 后端给 skin 提供的所有 HTTP 接口。这是主题调用后端的**唯一权威入口**。

---

## 三个接口面

| 面 | 前缀 | 鉴权 | 主题是否需要 |
|---|---|---|---|
| **一方 WebUI** | `/api/*` | session cookie + CSRF / capability | ✅ **是**（经 shared 的 api client） |
| 第三方开放 | `/api/v1/*` | API Token（scope） | ❌ |
| Emby/Jellyfin 兼容 | `/emby/*`、`/jellyfin/*` | 兼容层 API-Key | ❌ |

本目录（`api/domains/*`）只描述**一方 WebUI** 面。

---

## 怎么读

| 文档 | 用途 |
|---|---|
| [`conventions.md`](./conventions.md) | 通用约定：URL、JSON、时间、分页、ID、CSRF |
| [`auth.md`](./auth.md) | 鉴权流程 + 能力（capability）模型 |
| [`errors.md`](./errors.md) | 错误结构、错误码、状态码 |
| [`open-v1.md`](./open-v1.md) | 第三方开放 API `/api/v1/*` |
| [`domains/README.md`](./domains/README.md) | 按业务域索引 |
| [`domains/*`](./domains/) | 各域端点详解 |

---

## DTO 字段的权威来源

- **Markdown（本仓库）** 负责：语义、流程、边界、示例、错误
- **字段类型 / 必填 / 枚举**：以后端 DTO 为准（后端提供 OpenAPI 3.1 规格）
- **机器可读字段清单**：`contracts/api-fields.json`（CONTRACT-SYNC-01）——「端点 →
  请求/响应 wire 字段」的单一来源。主仓 `scripts/check-contract-sync.mjs` 以它为准，
  三方对账**后端 serde DTO ↔ 前端 mapper ↔ 本清单**，任一不一致即 FAIL。
  生成：`node scripts/check-contract-sync.mjs --write`（在**主仓**执行，会同步写本仓
  与主仓镜像 `docs/interfaces/api-contract-fields.json`）。
  清单内 `planned`/`exempt`/`known_drift` 三张表为**人工维护**（`--write` 不覆盖）：
  `known_drift` 是已核实的漂移基线（基线内不阻断，基线外新漂移 FAIL）。

字段冲突时以后端为准，并在本仓库补文档。

---

## 端点全景

| 域 | 前缀 | 端点数（注册） | 文档 |
|---|---|---|---|
| 安装引导 | `/api/install/*` | 2 | [`domains/install.md`](./domains/install.md) |
| 鉴权/身份 | `/api/auth/*` | 7 | [`auth.md`](./auth.md) |
| 浏览 | `/api/browse/*` | 6 | [`domains/browse.md`](./domains/browse.md) |
| 检索/推荐 | `/api/search`、`/api/recommendations/*` | 2 | [`domains/browse.md`](./domains/browse.md) |
| 媒体项 | `/api/items/*` | 2 | [`domains/items.md`](./domains/items.md) |
| 资产 | `/api/assets/*` | 1 | [`domains/assets.md`](./domains/assets.md) |
| 播放 | `/api/playback/*` | 7 | [`domains/playback.md`](./domains/playback.md) |
| 个人设置 | `/api/settings/user/*` | 6 | [`domains/settings.md`](./domains/settings.md) |
| 服务器设置 | `/api/settings/server/*` | 6 | [`domains/settings.md`](./domains/settings.md) |
| 挂载管理 | `/api/manage/mounts/*` + pan115 | ~20 | [`domains/manage/mounts.md`](./domains/manage/mounts.md) |
| 媒体库/条目 | `/api/manage/libraries*`、`/media-items*` | ~10 | [`domains/manage/libraries.md`](./domains/manage/libraries.md) |
| 用户/权限 | `/api/manage/users*`、`/role-templates*`、`/registration-codes*` | ~12 | [`domains/manage/users.md`](./domains/manage/users.md) |
| 合集/积分 | `/api/manage/collections*`、`/rewards/*` | ~10 | [`domains/manage/collections.md`](./domains/manage/collections.md) |
| 任务中心/命名 | `/api/manage/task-center/*`、`/naming-*` | ~14 | [`domains/manage/tasks.md`](./domains/manage/tasks.md) |
| 日志/会话 | `/api/manage/{audit-logs,runtime-logs,sessions}*` | ~5 | [`domains/manage/logs.md`](./domains/manage/logs.md) |
| License | `/api/manage/license/*` | 5 | [`domains/manage/license.md`](./domains/manage/license.md) |
| 密钥链 | `/api/manage/secrets/*` | 2 | [`domains/manage/secrets.md`](./domains/manage/secrets.md) |
| Telegram | `/api/manage/telegram-bot/*` | 3 | [`domains/manage/telegram.md`](./domains/manage/telegram.md) |
| 站点设置/管理杂项 | `/api/admin/*`、`/api/manage/{overview,source-availability}` | ~8 | [`domains/site.md`](./domains/site.md) |

> 数量以 v0.1.105 代码实测；完整逐条清单见后端路由装配 + 主仓 `docs/interfaces/webui.md`。

---

## 与主仓文档的关系

主仓 `docs/interfaces/webui.md` 是**机器门禁核对面**（CI 逐条对账路由）。
本仓库是**面向主题作者的语义版**——更强调"什么时候调、边界是什么、页面怎么用"。

两者内容应一致；若冲突，以**代码**为准，并同时修正两处。
