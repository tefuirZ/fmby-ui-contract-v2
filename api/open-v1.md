# API · 第三方开放接口（`/api/v1/*`）

> 面向**外部程序**（脚本、第三方集成）的接口，鉴权模型独立于一方 WebUI。

---

## 鉴权：API Token

```http
Authorization: Bearer <token>
```

服务端：sha256(token) → 查 `access_api_token`（未撤销 + 未过期）→ **scope 闸** →
每请求写审计 `api.token.call`（含 scope / decision / token_id / trace_id，**永不含 token 明文**）。

Token 由管理员在管理面签发：`POST /api/admin/api-tokens` → 明文**仅签发时返回一次**。

---

## scope 值域

| scope | 含义 |
|---|---|
| `read` | 只读 |
| `media:read` | 媒体读 |
| `media:write` | 媒体写（触发识别/扫描） |

（管理类 scope 预留。）

---

## 端点

| 方法 路径 | scope | 说明 |
|---|---|---|
| `GET /api/v1/health` | 免鉴权 | 健康检查 |
| `GET /api/v1/libraries` | `read` | 库列表 |
| `GET /api/v1/media` | `media:read` | 媒体列表（分页） |
| `GET /api/v1/media/{id}` | `media:read` | 媒体详情 |
| `POST /api/v1/media/{id}/identify` | `media:write` | 触发识别 |
| `GET /api/v1/tasks/{id}` | `read` | 任务状态 |
| `POST /api/v1/scan` | `media:write` | 触发库扫描 |

---

## 错误

- `401` 无 token / token 无效
- `403` `{"error_code":"forbidden","message":"insufficient scope"}` scope 不足

---

## 与一方接口的区别

| | 一方 `/api/*` | 开放 `/api/v1/*` |
|---|---|---|
| 鉴权实体 | `SessionCredential` | `ApiTokenCredential` |
| 用途 | 浏览器（host + skin） | 外部程序 |
| CSRF | 写方法需要 | 不需要（Bearer） |
| 审计 | 会话审计 | 每请求 token 审计 |

**主题不应调用 `/api/v1/*`**——它是给程序化访问的。
