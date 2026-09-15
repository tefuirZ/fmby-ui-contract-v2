# API · 通用约定

> 一方 WebUI API（`/api/*`）的通用规则。所有端点都满足。

---

## 基址

- 所有一方 API 以 `/api/` 开头，**同源相对路径**
- 不要传 `http://`、`https://`、`//host` 或含反斜杠的 URL
- `/api` 与 `/api/*` 未命中时返回 **JSON 404**，不能返回 SPA 的 `index.html`
- **路径段 `kebab-case`**：`/api/manage/registration-codes`、`/api/manage/task-center/overview`
- **路径参数 `{snake_case}`**：`/api/manage/mounts/{id}`、`/api/manage/users/{id}`
- **查询参数 `snake_case`**；**但 §10 mounts 列表查询契约为 `camelCase` 主名 + snake 别名双收**
  （见 [`domains/manage/mounts.md`](./domains/manage/mounts.md)）

---

## HTTP 方法

| 方法 | 语义 |
|---|---|
| `GET` | 读取，幂等 |
| `POST` | 创建 / 触发动作（`scan`、`qr-login`、`browse-directories`） |
| `PUT` | 整体替换（设置类） |
| `PATCH` | 部分更新 |
| `DELETE` | 删除（危险操作需能力 + 确认） |

---

## 请求 / 响应 Body

- `Content-Type: application/json; charset=utf-8`（除二进制/流式端点）
- 所有 JSON 字段 **`snake_case`**
- 成功响应**直接返回 DTO**，不包 `{"data": ...}`
- 空响应用 **`204 No Content`**，不返回 `{}`
- 错误响应也是 JSON，见 [`errors.md`](./errors.md)

---

## 时间与 ID

- **时间**：响应内一律 UTC **epoch 毫秒**（`number | null`）。前端负责转 `Asia/Shanghai` 展示。
- **ID**：`EntityId`（wire 为 number）。**不透明**——前端不得解析语义。
- **时间展示口径**：持久化/协议用 UTC，展示/日志/审计统一 `Asia/Shanghai`

---

## 分页

v2 有几种分页形状（按端点不同）：

| 形状 | 字段 | 用在哪 |
|---|---|---|
| `Page<T>` | 各端点定义 | 检索等 |
| `ManagedListResponse<T>` | `{items: T[], total: u64}` | 管理列表 |
| `LibraryDetailResponse` | `{library, hero_summary, items, total, page, page_size, next_cursor, has_more}` | 库详情 |
| `ItemDescendantsResponse` | `{items, total, next_cursor, has_more}` | 子节点 |

检索（`/api/search`）用 `offset` + `limit`（默认 50，上限 100）。

---

## 错误处理

统一错误体（见 [`errors.md`](./errors.md)）：

```json
{ "error_code": "not_found", "message": "...", "trace_id": "..." }
```

前端应依 `error_code` 分支，**不要**解析 `message` 文案（会脱敏）。

---

## 幂等性

- `GET` / `PUT` / `DELETE`：幂等
- `POST`：**不一定**幂等；触发类端点（scan、identify）内部有幂等键挡重投递
- 危险删除：同请求重复提交结果一致（幂等）

---

## CSRF

写方法（POST/PUT/PATCH/DELETE）会话请求需 CSRF 双匹配。详见 [`auth.md`](./auth.md)。

---

## 未实现端点的响应

管理面中**尚无 service 端口支撑**的能力端点，经鉴权 + 能力校验后统一返回：

- **501** `{"error_code":"NOT_IMPLEMENTED"}` —— 能力尚未实现（前端提示"功能未开放"）
- **500** —— 装配 / 部署错误（fail-closed）

区分：501 = 功能没做；500 = 本该能用但装配错了。
