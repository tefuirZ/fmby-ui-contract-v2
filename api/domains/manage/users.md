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

> 前端契约里 `/{id}/reset-password`、`/{id}/approve-registration`、`/{id}/reject-registration`、
> ✅ 原记「`/{id}/reset-password`…、`/batch/{delete,disable,update}` 未实现（G-04）」**已过时**：这些端点**已实现**（api-fields `/api/manage/users` 15 端点；V2 落地名为 `batch/permanent-delete`）。

---

## 角色模板

| 方法 路径 | 说明 |
|---|---|
| `GET /api/manage/role-templates` | 列表 |
| `POST /api/manage/role-templates` | 创建 |
| `GET /api/manage/role-templates/{id}` | 详情 |

---

## 注册码

| 方法 路径 | 说明 |
|---|---|
| `GET /api/manage/registration-codes` | 列表 |
| `POST /api/manage/registration-codes` | 创建（批量/单个） |

> ✅ 注册码 `/{id}`、`/{id}/status`、`/batches/{id}`、`/batch/delete` **已实现**（api-fields 7 端点 implemented；原 G-11 登记已过时）。

---

## 积分与签到

| 方法 路径 | 说明 |
|---|---|
| `GET /api/manage/rewards/accounts/{user_id}` | 账户摘要（account 可为 null = 未建账） |
| `GET /api/manage/rewards/accounts/{user_id}/ledger` | 流水（`limit` 默认 50） |
| `GET /api/manage/rewards/config` | 事件配置（`checkin_enabled` / `daily_checkin_points` / `streak_bonus_points` / `max_streak_days`） |
| `PUT /api/manage/rewards/config` | 全量替换（`deny_unknown_fields`） |

校验：积分 > 100 拒绝、streak 天数 > 365 拒绝、负值类型拒绝。
未持久化 → 诚实缺省；KV 损坏 → 显式 5xx（不静默降级）。
