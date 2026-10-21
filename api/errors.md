# API · 错误模型

## 统一错误体

```json
{
  "error_code": "not_found",
  "message": "item 42",
  "trace_id": "01J..."
}
```

- `error_code`：稳定枚举，**前端按它分支**
- `message`：面向人的说明（部分已脱敏，**不要解析**）
- `trace_id`：排查用（可选）

---

## error_code 值域

wire 值域为**两族并存**（真源 = 主仓 `fmby-v2-contracts/src/error_code.rs`）：

- **基础错误族**（`AppError` 12 类直配，小写蛇形；`http/src/errors.rs` `error_code_of`）——下表；
- **Coded 目录族**（`ErrorCode::as_slug()`，SCREAMING_SNAKE_CASE，201 slug，唯一真源
  `error_code/slug.rs`，机械目录 `docs/plans/v2-dev/contracts/error-catalog.md`）——
  全量值域见 **`api/errors.coded.generated.md`**（由
  `scripts/generate-error-catalog.mjs` 从主仓 catalog 生成，`--check` 门模式，
  **勿手改**；2026-10-21 快照 = 主仓 `126abf54a`，分布 400×95 / 401×11 / 403×11 /
  404×21 / 409×22 / 413×3 / **429×3** / 500×5 / 501×1 / 502×5 / 503×23 / 504×1）。

**基础错误族**：

| error_code | HTTP | 含义 | message 是否脱敏 |
|---|---|---|---|
| `validation` | 400 | 入参不合法 | 原文（业务语义） |
| `not_found` | 404 | 资源不存在 | 原文 |
| `conflict` | 409 | 冲突（状态不允许） | 原文 |
| `forbidden` | 403 | 无权限 / 能力不足 | 固定串 |
| `unauthorized` | 401 | 未登录 / 凭据无效 | 固定串 |
| `dependency_timeout` | 504 | 上游超时 | 泛化（"upstream timed out; try again later"） |
| `dependency_rate_limited` | 429 | 上游限流 | 泛化 |
| `dependency_unavailable` | 503 | 上游不可用 | 泛化 |
| `credential_invalid` | 500* | 凭据无效 | 泛化（"contact administrator"） |
| `retryable_storage` | 500* | 存储暂时不可用 | 泛化 |
| `cancelled` | 500* | 操作被取消 | 泛化 |
| `internal` | 500 | 内部错误 | 泛化（"internal error"） |

\* `credential_invalid` / `retryable_storage` / `cancelled` 在 HTTP 映射上落到 500
（`AppError` 非穷尽匹配的兜底分支）。

> **脱敏规则**：`dependency*` / `credential_invalid` / `retryable_storage` / `internal` /
> `cancelled` 的具体细节（SQL 片段、provider 响应、内部路径）**只进服务端日志**，绝不发给客户端。

---

## 特殊状态码

| 状态 | 场景 |
|---|---|
| **501** `{"error_code":"NOT_IMPLEMENTED"}` | 端点已鉴权但**能力尚未实现**（前端提示"功能未开放"） |
| **500** | 装配 / 部署错误（fail-closed），前端按通用错误处理 |
| **429** | 限流（登录、探测、Telegram webhook 等有独立限流桶） |
| **413** | 请求体超限（如登录 body、Telegram update 256KB） |
| **304** | 资源未修改（`/api/assets/{blob_id}` 带 `If-None-Match`） |
| **416** | Range 不满足（资产 Range 请求） |

---

## 前端处理建议

1. `401` → 跳登录（保留 `next`）
2. `403` → 渲染 403 页（无权限）
3. `404` → 空状态（资源没了），不是错误页
4. `429` → 提示稍后重试（读 `Retry-After` 若有）
5. `501` → 提示"该功能尚未开放"
6. `5xx` → 通用错误 + `trace_id`（便于报障）

`shared/errors` 提供 `getErrorMessage(error)` 统一取文案（已处理脱敏）。
