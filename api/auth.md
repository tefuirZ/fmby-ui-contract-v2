# API · 鉴权与能力

> 一方 WebUI API 的鉴权模型。**这是主题方必须理解的核心。**

---

## 会话鉴权流程

```text
1. POST /api/auth/login  {username, password}
   ← 200 {user, session}
   ← Set-Cookie: fmby_session=<token>; HttpOnly
   ← Set-Cookie: fmby_csrf=<hmac>;  （非 HttpOnly，前端可读）

2. 后续请求：浏览器自动带 fmby_session cookie
   写方法（POST/PUT/PATCH/DELETE）还需带 header:
   x-csrf-token: <fmby_csrf cookie 的值>

3. POST /api/auth/logout  → 204
```

### CSRF 双匹配规则

- `fmby_csrf` cookie 与 `x-csrf-token` header **必须同时等于**服务端派生值
  `HMAC-SHA256(session_token, origin)`
- 写方法还经 **Origin 闸**
- `/auth/login`、`/auth/logout`：**无条件** Origin 校验
- Bearer 请求、GET/HEAD/OPTIONS：跳过 CSRF

> 前端 `shared` 的 http client 对写方法**自动回显** `fmby_csrf`，主题无需处理。

---

## 能力（Capability）模型

共 **8 个能力**：

| 能力 | 含义 | 典型端点域 |
|---|---|---|
| `Browse` | 浏览 / 详情 / 检索 / 资产读取 | `/browse/*`、`/items/*`、`/assets/*`、`/search` |
| `Play` | 播放 | `/playback/*` |
| `ManageAccess` | 用户 / 权限 / 注册码 / 积分 | `/manage/users*`、`/manage/role-templates*`、`/manage/registration-codes*`、`/manage/rewards*` |
| `ManageLibrary` | 媒体库 / 合集 / 命名 / 来源 | `/manage/libraries*`、`/manage/mounts*`、`/manage/collections*`、`/manage/naming-*`、`/manage/media-items*`、`/manage/pan115/*` |
| `ManageMount` | 挂载独立管理位 | 预留 |
| `ManageSettings` | 站点 / 密钥 / 授权 / telegram 配置 | `/manage/secrets/*`、`/manage/license/*`、`/manage/telegram-bot/*`、`/settings/server/*`、`/admin/site-settings` |
| `DangerousAction` | 危险删除（叠加 `?confirmed=true`） | `DELETE /manage/**/{id}`、`DELETE /admin/media/{id}` |
| `ViewAudit` | 审计 / 日志只读 | `/manage/audit-logs`、`/manage/runtime-logs`、`/admin/audit` |

### 角色 → 能力（静态基准）

| 角色 | 能力集 | 可见面 |
|---|---|---|
| `Admin` | 全部 8 项 | 浏览 + 播放 + 全部管理面 |
| `User` | `Browse`、`Play` | 浏览 + 播放 + 个人设置 |
| `RestrictedUser` | `Browse` | 仅浏览 |
| 未知角色 | 空（fail-closed） | 仅登录 |

> 本表是静态基准；会话实际能力以 DB 为准。前端以 `GET /api/auth/me` 返回的
> `capabilities` 数组为运行时真相。

---

## 前端如何用能力

`GET /api/auth/me` → `{user, capabilities: string[]}`。

前端 `useSession().hasCapability(name)` 把能力名归一小写并去 `: _ -`
（`manage:access` ≡ `ManageAccess`），再做匹配。

**当前前端只用了一个粗粒度守卫**：

```tsx
<CapabilityGuard required="manage:access">   // 守整个 /manage/* 子树
```

> ⚠️ 已知缺口（G-07）：更细粒度的每页守卫（审计页应 `ViewAudit`、设置页应 `ManageSettings`）
> 尚未落地——目前只要 `ManageAccess` 就能进所有管理页（后端仍会按端点能力拦截请求）。

---

## 端点鉴权辅助（后端视角）

```rust
let principal = authenticate_request(&state, &headers).await?;   // 失败 401
require_capability(&principal, capability::MANAGE_LIBRARY).map_err(map_error)?;  // 失败 403
```

---

## 三方身份自服务（`/api/auth/identity/*`）

普通用户可绑/解绑三方身份（Google / Telegram / Email / GitHub / OIDC）：

| 方法 路径 | 说明 |
|---|---|
| `GET /api/auth/identity` | 列出已绑定身份 |
| `POST /api/auth/identity/bind` | 发起绑定 → `{challenge_id, ticket}`（201） |
| `POST /api/auth/identity/unbind` | 解绑 |
| `GET /api/auth/identity/{provider}` | 单 provider 绑定状态 |

> **安全**：身份恒取当前 session 主体，不接受请求体任意 `user_id`；凭据仅存 hash；
> ticket 仅绑定响应返回一次。

---

## 其他两面鉴权（主题不碰，仅供了解）

- **开放 API** `/api/v1/*`：`Authorization: Bearer <token>` → scope 闸（`read` /
  `media:read` / `media:write`）→ 每请求审计。见 [`open-v1.md`](./open-v1.md)。
- **兼容面** `/emby/*`、`/jellyfin/*`：`X-Emby-Token` / `X-MediaBrowser-Token` header
  或 `api_key` query。与一方会话完全隔离。
