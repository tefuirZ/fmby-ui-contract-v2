# API · 管理面 · 用户 / 权限 / 注册码

能力：`ManageAccess`（删除叠加 `DangerousAction`）。

---

## 用户

| 方法 路径 | 说明 |
|---|---|
| `GET /api/manage/users` | 列表（分页）→ `RawListResponse<RawManagedUserRecord>` |
| `POST /api/manage/users` | 创建 |
| `GET /api/manage/users/{id}` | 详情 |
| `PATCH /api/manage/users/{id}` | 更新属性 |
| `DELETE /api/manage/users/{id}` | 删除（危险） |
| `PATCH /api/manage/users/{id}/status` | 启用/禁用 → 204 |
| `POST /api/manage/users/{id}/reset-password` | 重置口令（`?confirmed=true`） |
| `POST /api/manage/users/{id}/telegram-password-reset` | 经 Telegram 重置口令 |
| `POST /api/manage/users/{id}/login-risk/reset` | 清除登录风险标记 |
| `POST /api/manage/users/{id}/mfa/totp/reset` | 重置该用户的 TOTP |
| `POST /api/manage/users/{id}/approve-registration` | 通过待审注册 |
| `POST /api/manage/users/{id}/reject-registration` | 拒绝待审注册 |
| `POST /api/manage/users/batch/update` | 批量更新 |
| `POST /api/manage/users/batch/disable` | 批量禁用 |
| `POST /api/manage/users/batch/permanent-delete` | 批量永久删除（危险） |
| `GET /api/manage/users/direct-registration/settings` / `PUT` 同路径 | 直接注册设置 |
| `GET /api/manage/users/expiry-notifications/settings` / `PUT` 同路径 | 到期通知设置 |
| `POST /api/manage/users/reports` | 生成报表 |
| `GET /api/manage/users/reports/{report_id}/rows` | 报表行（分页） |

> 前端契约里 `/{id}/reset-password`、`/{id}/approve-registration`、`/{id}/reject-registration`、
> ✅ 原记「`/{id}/reset-password`…、`/batch/{delete,disable,update}` 未实现（G-04）」**已过时**：这些端点**已实现**（api-fields `/api/manage/users` 15 端点；V2 落地名为 `batch/permanent-delete`）。

---

## 角色模板

| 方法 路径 | 说明 |
|---|---|
| `GET /api/manage/role-templates` | 列表 |
| `POST /api/manage/role-templates` | 创建 |
| `PATCH /api/manage/role-templates/{id}` | 更新模板 |
| `DELETE /api/manage/role-templates/{id}` | 删除模板 |
| `POST /api/manage/role-templates/{id}/enable` | 启用/停用 |

> ⚠️ **无单条详情端点**：后端未注册 role-templates 的 GET-`{id}` 详情（本表此前误列，已删）。
> 需要单条数据时从列表取，或按 `PATCH` 的错误反馈判断存在性。

---

## 注册码

| 方法 路径 | 说明 |
|---|---|
| `GET /api/manage/registration-codes` | 列表 |
| `POST /api/manage/registration-codes` | 创建（批量/单个） |
| `PATCH /api/manage/registration-codes/{id}` | 改码 |
| `PATCH /api/manage/registration-codes/{id}/status` | 改单码状态 |
| `DELETE /api/manage/registration-codes/{id}` | 删除码 |
| `POST /api/manage/registration-codes/batch/delete` | 批量删（**静态段先于 `{id}`**） |
| `PATCH /api/manage/registration-codes/batches/{id}` | 改批次 |
| `PATCH /api/manage/registration-codes/batches/{id}/status` | 批次级启停（批内全码） |

> ✅ 注册码 `/{id}`、`/{id}/status`、`/batches/{id}`、`/batch/delete` **已实现**（api-fields 7 端点 implemented；原 G-11 登记已过时）。

---

## 积分与签到

| 方法 路径 | 说明 |
|---|---|
| `GET /api/manage/rewards/accounts/{user_id}` | 账户摘要（account 可为 null = 未建账） |
| `GET /api/manage/rewards/accounts/{user_id}/ledger` | 流水（`limit` 默认 50） |
| `GET /api/manage/rewards/config` | 事件配置（`checkin_enabled` / `daily_checkin_points` / `streak_bonus_points` / `max_streak_days`） |
| `PUT /api/manage/rewards/config` | 全量替换（`deny_unknown_fields`） |
| `GET /api/manage/rewards/media-requests` | 求片列表 |
| `POST /api/manage/rewards/media-requests/{id}/transition` | 求片状态流转 |
| `POST /api/manage/rewards/points/adjust` | 人工调分 |
| `GET /api/manage/rewards/rule` / `POST` 同路径 | 规则读 / 写 |
| `GET /api/manage/rewards/stats` | 积分统计 |

校验：积分 > 100 拒绝、streak 天数 > 365 拒绝、负值类型拒绝。
未持久化 → 诚实缺省；KV 损坏 → 显式 5xx（不静默降级）。
