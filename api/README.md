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
| [`domains/manage/README.md`](./domains/manage/README.md) | 按业务域索引 |
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

| 域 | 前缀 | 文档 |
|---|---|---|
| 安装引导 | `/api/install/*` | [`domains/install.md`](./domains/install.md) |
| 鉴权/身份 | `/api/auth/*`、`/api/account/*` | [`auth.md`](./auth.md) |
| 浏览 | `/api/browse/*` | [`domains/browse.md`](./domains/browse.md) |
| 检索/推荐 | `/api/search`、`/api/browse/search`、`/api/recommendations/*` | [`domains/browse.md`](./domains/browse.md) |
| 媒体项 | `/api/items/*` | [`domains/playback.md`](./domains/playback.md) |
| 资产 | `/api/assets/*` | [`domains/playback.md`](./domains/playback.md) |
| 播放 | `/api/playback/*` | [`domains/playback.md`](./domains/playback.md) |
| 个人设置 | `/api/settings/user/*` | [`domains/settings.md`](./domains/settings.md) |
| 服务器设置 | `/api/settings/server/*`、`/api/settings/integrations/*` | [`domains/settings.md`](./domains/settings.md) |
| 挂载管理 | `/api/manage/mounts/*`、`/api/manage/pan115/*` | [`domains/manage/mounts.md`](./domains/manage/mounts.md) |
| 139 账号 | `/api/manage/yun139/*` | [`domains/manage/yun139.md`](./domains/manage/yun139.md) |
| 媒体库/条目/审核 | `/api/manage/libraries*`、`/media-items*`、`/media-reviews*`、`/probe-tasks*` | [`domains/manage/libraries.md`](./domains/manage/libraries.md) |
| 用户/权限/注册码/积分 | `/api/manage/users*`、`/role-templates*`、`/registration-codes*`、`/rewards/*` | [`domains/manage/users.md`](./domains/manage/users.md) |
| **Microsoft 365** | `/api/manage/microsoft/*` | [`domains/manage/microsoft.md`](./domains/manage/microsoft.md) |
| **上游源** | `/api/manage/upstreams/*` | [`domains/manage/upstreams.md`](./domains/manage/upstreams.md) |
| **运维面** | `/api/manage/{operations,scans,events,system,runtime-log*}*` | [`domains/manage/operations.md`](./domains/manage/operations.md) |
| **集成面** | `/api/manage/{announcements,notifications,telegram-bot,ai-interventions,auth-providers}*` | [`domains/manage/integrations.md`](./domains/manage/integrations.md) |
| **admin 面** | `/api/admin/*` | [`domains/manage/admin.md`](./domains/manage/admin.md) |
| **其他** | 迁移 / 开发者 / 高级动作 / 密钥 / 积分等 | [`domains/manage/misc.md`](./domains/manage/misc.md) |
| 合集 | `/api/manage/collections*` | [`domains/manage/README.md`](./domains/manage/README.md) |
| 任务中心/命名 | `/api/manage/task-center/*`、`/naming-*` | [`domains/manage/README.md`](./domains/manage/README.md) |
| 日志/会话 | `/api/manage/{audit-logs,runtime-logs,sessions}*` | [`domains/manage/README.md`](./domains/manage/README.md) |
| License | `/api/manage/license/*` | [`domains/manage/README.md`](./domains/manage/README.md) |
| 密钥链 | `/api/manage/secrets/*` | [`domains/manage/README.md`](./domains/manage/README.md) |
| Telegram | `/api/manage/telegram-bot/*` | [`domains/manage/README.md`](./domains/manage/README.md) |
| 站点设置/管理杂项 | `/api/admin/*`、`/api/manage/{overview,source-availability}`、`/api/site/themes*` | [`domains/manage/README.md`](./domains/manage/README.md) |
| **兼容面（Emby/Jellyfin）** | `/emby/*`、`/jellyfin/*` | [`domains/compat-emby.md`](./domains/compat-emby.md) |

> 逐条端点以各域文档的表为准（本表不再抄数字——数量会腐化，且每域文档已给全表）。
> 机器真源 = `contracts/api-fields.json`（**483 端点**），它**只覆盖 `/api/*`**；
> `/api/v1` 与 `/emby`/`/jellyfin` 不在其内（见 `open-v1.md` 与 `compat-emby.md`）。
>
> **文档自检**：`node scripts/check-doc-paths.mjs` —— 文档里每个 `METHOD /path`
> 必须能在清单中找到；找不到即失败（防「文档写了不存在的端点」）。
>
> **清单 → 文档生成**：`node scripts/gen-domain-docs.mjs [--write]` —— 把清单里
> **尚未登记**的端点按语义域生成/追加进 `domains/manage/*.md`（幂等，可重跑）。
> 生成段只含「端点 + 请求/响应类型 + 字段」（这些清单里有、机械可靠），
> **语义/边界/错误码/能力门仍需人补**，故生成段带 `⚠️ 自动生成` 标示。
> 当前清单 **483/483 端点已全部有文档登记**（语义完整度另计）。

---

## 与主仓文档的关系

主仓 `docs/interfaces/webui.md` 是**机器门禁核对面**（CI 逐条对账路由）。
本仓库是**面向主题作者的语义版**——更强调"什么时候调、边界是什么、页面怎么用"。

两者内容应一致；若冲突，以**代码**为准，并同时修正两处。
