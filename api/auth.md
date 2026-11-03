# API · 鉴权与能力

> 一方 WebUI API 的鉴权模型。**这是主题方必须理解的核心。**

---

## 会话鉴权流程

```text
1. POST /api/auth/login  {username, password, captcha_id?, captcha_code?}
   ← 200 LoginResponse{user_id?, expires_in_secs?, status, challenge_id?, expires_at?,
                       must_change_password, password_change_endpoint?}
   ← Set-Cookie: fmby_session=<token>; HttpOnly
   ← Set-Cookie: fmby_csrf=<hmac>;  （非 HttpOnly，前端可读）

2. 后续请求：浏览器自动带 fmby_session cookie
   写方法（POST/PUT/PATCH/DELETE）还需带 header:
   x-csrf-token: <fmby_csrf cookie 的值>

3. POST /api/auth/logout  → 204
```

> `status` 是 MFA 状态机：`status="ok"` 时 `user_id`/`expires_in_secs` 有值且建会话；
> `status="mfa_required"` 时 `challenge_id`/`expires_at` 有值，**未建会话、不发 cookie**，
> 需再走 `POST /api/auth/mfa/totp/verify {challenge_id, code}` 完成登录。
> `must_change_password=true` 时前端应跳改密页（端点见下方 `password_change_endpoint`）。

### CSRF 双匹配规则

- `fmby_csrf` cookie 与 `x-csrf-token` header **必须同时等于**服务端派生值
  `HMAC-SHA256(session_token, origin)`
- 写方法还经 **Origin 闸**
- `/auth/login`、`/auth/logout`：**无条件** Origin 校验
- **前缀族** `/auth/identity/`、`/auth/password-reset/` 同样只校 Origin（不要求双匹配）
- Bearer 请求、GET/HEAD/OPTIONS：跳过 CSRF；`/api/v1` Bearer 面整体豁免

---

## 端点总表

> 30 个注册端点（`crates/fmby-v2-http/src/routes/router_core.rs`）。
> 请求/响应类型名以 `contracts/api-fields.json` 为字段权威口径；本表补鉴权与语义。

### 会话 / 登录

| 方法 路径 | 鉴权 | 请求 | 响应 |
|---|---|---|---|
| `POST /api/auth/login` | 匿名（Origin 必校） | `LoginRequest{username, password, captcha_id?, captcha_code?}`；username≤128、password≤256、body≤8KB；验证码开关开启时后两字段必填 | `LoginResponse{user_id?, expires_in_secs?, status, challenge_id?, expires_at?, must_change_password, password_change_endpoint?}` + 双 cookie |
| `POST /api/auth/logout` | 会话 | — | 204（清双 cookie） |
| `GET /api/auth/me` | 会话 | — | `MeResponse{user_id, capabilities: string[]}`（**无 user 对象**） |
| `GET /api/auth/captcha` | 匿名 | `CaptchaQuery` | `CaptchaChallengeResponse` |
| `GET /api/auth/entry/status` | 匿名 | — | `SetupStatusResponse{needs_setup, registration_enabled, registration_requires_code}`；判定源与 `/auth/setup` 守卫同源，异常时 fail-closed 503 |

### 二因子（TOTP）

| 方法 路径 | 鉴权 | 请求 | 响应 |
|---|---|---|---|
| `POST /api/auth/mfa/totp/verify` | 匿名（凭 `challenge_id`） | `MfaVerifyRequest` | `{user_id, verified}`（成功后建会话） |
| `GET /api/auth/mfa/totp` | 会话 | — | `MfaStatusResponse{enabled, pending_confirmation, recovery_codes_remaining}` |
| `POST /api/auth/mfa/totp` | 会话 | — | `MfaEnrollmentResponse{secret, otpauth_url, qr_image_data_url?}` |
| `POST /api/auth/mfa/totp/confirm` | 会话 | `MfaCodeRequest` | `MfaRecoveryCodesResponse` |
| `POST /api/auth/mfa/totp/recovery-codes` | 会话 | `MfaPasswordRequest` | `MfaRecoveryCodesResponse`（重新生成） |
| `DELETE /api/auth/mfa/totp` | 会话 | `MfaPasswordRequest` | `MfaOkResponse{ok}` |

### 密码

| 方法 路径 | 鉴权 | 请求 | 响应 |
|---|---|---|---|
| `POST /api/auth/password/change-required` | 会话 | `ChangePasswordRequest` | `LoginResponse`（校验旧密码并清 `must_change_password`） |
| `POST /api/auth/password-reset/start` | 匿名 | `PasswordResetEmailStartRequest{email, session_id?}` | `PasswordResetEmailStartDto{accepted, delivery, challenge, expires_at_ms}`；**恒同形，不泄露账号是否存在** |
| `POST /api/auth/password-reset/complete` | 匿名 | `PasswordResetEmailCompleteRequest{ticket?, session_id?, email?, code?, new_password?}` | 204 |
| `POST /api/auth/password-reset/telegram/status` | 匿名（凭 ticket） | `PasswordResetStatusRequest` | `PasswordResetStatusDto{expires_at, totp_required}` |
| `POST /api/auth/password-reset/telegram/complete` | 匿名（凭 ticket） | `PasswordResetCompleteRequest` | 204 |

### 自助注册 / 初始化

| 方法 路径 | 鉴权 | 请求 | 响应 |
|---|---|---|---|
| `POST /api/auth/setup` | 匿名（仅 `needs_setup` 态） | `SetupRequest` | `{id, username}` |
| `POST /api/auth/register` | 匿名 | `RegisterRequest` | `RegisterResponse{status, message, user?}`；`user` 为不透明嵌套对象（含 token），**不得直接当 User 用** |

### 三方身份（自服务）

| 方法 路径 | 鉴权 | 请求 | 响应 |
|---|---|---|---|
| `GET /api/auth/identity/providers` | **免鉴权** | — | `IdentityProvidersPublicView`（登录页公开可用性） |
| `GET /api/auth/identity` | 会话 | — | `IdentityListResponse` |
| `POST /api/auth/identity/bind` | 会话 | `BindRequest` | `{challenge_id, ticket}`（201） |
| `POST /api/auth/identity/unbind` | 会话 | `UnbindRequest` | `UnbindResponse` |
| `GET /api/auth/identity/{provider}` | 会话 | — | `IdentityDetailResponse` |

### 三方身份（登录链，登录前无会话）

| 方法 路径 | 鉴权 | 请求 | 响应 |
|---|---|---|---|
| `POST /api/auth/identity/{provider}/login/start` | 免会话 | `IdentityLoginStartRequest` | `IdentityLoginStartResponse` |
| `POST /api/auth/identity/{provider}/login/complete` | 免会话 | `IdentityLoginCompleteRequest` | 建会话 + 双 cookie |
| `POST /api/auth/identity/{provider}/login/status` | 免会话 | `IdentityLoginStatusRequest` | `IdentityLoginStatusResponse` |
| `GET /api/auth/identity/{provider}/callback` | 免会话（回跳） | `IdentityCallbackQuery` | `IdentityCallbackCaptureResponse` |

> `login/status` 实际仅 Telegram 支持（路径参数为 `{provider}` 模板，前端硬编码 telegram 的
> 字面差异已在契约清单 `known_drift` 登记）。

### 账号绑定面（`/api/account/*`）

| 方法 路径 | 鉴权 | 请求 | 响应 |
|---|---|---|---|
| `GET /api/account/identity-bindings` | 会话 | — | `AccountIdentityBindingsResponse` |
| `POST /api/account/identity-bindings/{provider}/start` | 会话 | `StartIdentityBindingRequest` | `StartIdentityFlowResponse` |
| `POST /api/account/identity-bindings/{provider}/complete` | 会话 | `CompleteIdentityBindingRequest` | `CompleteIdentityBindingResponse` |

> 身份恒取当前会话主体（不接受请求体任意 `user_id`）；凭据仅存 hash；ticket 仅绑定响应返回一次。

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
| `ManageMount` | 挂载/凭据独立管理位（115 账号·图床、139 账号） | ✅ 使用中 |
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

`GET /api/auth/me` → `{user_id, capabilities: string[]}`（**无 user 对象、无 username**；
前端如需用户名，依赖登录响应或本地缓存兜底）。

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
