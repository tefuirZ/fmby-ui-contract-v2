# API · 管理面 · 合集 / 任务中心 / 日志 / License / 密钥 / Telegram / 站点

---

## 合集（`ManageLibrary`；删除叠加 `DangerousAction`）

| 方法 路径 | 说明 |
|---|---|
| `GET /api/manage/collections` | 列表 → `RawManagedCollectionRecord[]` |
| `POST /api/manage/collections` | 创建 `{title, overview?, poster_url?, visibility}` |
| `GET /api/manage/collections/{id}` | 详情 `{collection, members[]}` |
| `PATCH /api/manage/collections/{id}` | 更新 |
| `DELETE /api/manage/collections/{id}` | 删除（级联成员，幂等） |
| `DELETE /api/manage/collections/{id}/members/{member_id}` | 移除成员（幂等） |

---

## 任务中心（`ManageAccess`）

| 方法 路径 | 说明 |
|---|---|
| `GET /api/manage/task-center/overview` | 概览 → `RawTaskCenterOverview` |
| `GET /api/manage/task-center/items` | 列表（category/filter） |
| `GET /api/manage/task-center/items/{category}/{id}` | 详情 |
| `POST /api/manage/task-center/items/{category}/{id}/actions` | 动作 |

---

## 日志 / 会话

| 方法 路径 | 能力 | 说明 |
|---|---|---|
| `GET /api/manage/audit-logs` | `ViewAudit` | 审计日志列表 |
| `GET /api/manage/runtime-logs` | `ViewAudit` | 运行日志 |
| `GET /api/manage/sessions` | `ManageAccess` | 当前会话列表 |
| `DELETE /api/manage/sessions/{id}` | `ManageAccess` | 踢会话 |

---

## License（`ManageSettings`）

> ⚠️ `LicenseStatusDto` 是 **33 字段主对象 + 嵌套** 的复杂契约。任何字段名/嵌套/枚举值域偏差
> 都会导致前端映射器解析失败。字段全量见主仓 `docs/interfaces/webui.md`，前端类型见
> `apps/shared/src/contracts/manage/license/types.ts`。

| 方法 路径 | 响应 |
|---|---|
| `GET /api/manage/license/status` | `LicenseStatusDto`（状态对象本体，非 `{status}` 包裹） |
| `POST /api/manage/license/device-flow` | `{status}` |
| `POST /api/manage/license/device-flow/poll` | `{status, poll_status}`（`pending`/`authorized`/`expired`/`denied`） |
| `POST /api/manage/license/activation-token` | `{status}`（`{activation_token}` 入参；空串/纯空白 400） |
| `POST /api/manage/license/heartbeat` | `{status}` |

关键字段：`runtime_state`（六态 `unactivated`/`pending`/`active`/`grace`/`expired`/`invalid`）、
`business_access_allowed`（功能门放行位，仅 active/grace 为真）、时间字段一律 epoch ms。

---

## 密钥链（`ManageSettings`）

| 方法 路径 | 说明 |
|---|---|
| `GET /api/manage/secrets/status` | `SecretsStatusDto`（entries[]：key/source/configured；零明文值） |
| `PUT /api/manage/secrets/overrides?confirmed=true` | `{overrides:{"<白名单键>": value\|null}}`（null=删除覆盖） |

响应 `SecretsOverrideResponseDto{ok, applied[], restart_required:true}`，**不回显明文**。

---

## Telegram

| 方法 路径 | 能力 | 说明 |
|---|---|---|
| `GET /api/manage/telegram-bot/status` | `ManageSettings` | 状态（health/enabled/configured/mode/allowed_chat_count；不含 token 明文） |
| `GET /api/manage/telegram-bot/config` | `ManageSettings` | `{enabled, api_base(空=官方默认), allowed_chat_ids}` |
| `PUT /api/manage/telegram-bot/config` | `ManageSettings` | 全量替换（`deny_unknown_fields`） |
| `POST /api/integrations/telegram/bot/webhook` | **免会话**（secret token 即凭证） | Telegram 官方入站（body ≤256KB） |

校验：`api_base` 非 https 拒绝、chat id 非整数拒绝、>64 项拒绝。

---

## 站点设置 / 管理杂项

| 方法 路径 | 能力 | 说明 |
|---|---|---|
| `GET /api/admin/overview`、`GET /api/manage/overview` | `ManageAccess` | 统计快照 |
| `GET /api/admin/tasks` | `ManageLibrary` | 任务列表（`?state=`） |
| `DELETE /api/admin/media/{id}` | `DangerousAction` | 删媒体（危险） |
| `GET /api/admin/audit` | `ViewAudit` | 审计（分页/过滤） |
| `GET/PUT /api/admin/site-settings` | `ManageSettings` | 站点设置 |
| `POST/GET /api/admin/api-tokens` | `ManageSettings` | API token 签发/列表 |
| `DELETE /api/admin/api-tokens/{id}` | `ManageSettings` | 吊销 |
