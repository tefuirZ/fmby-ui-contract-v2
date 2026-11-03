# API · 设置（个人 + 服务器）

---

## 个人设置（仅需登录，无能力闸）

| 方法 路径 | 请求 | 响应 |
|---|---|---|
| `GET /api/settings/user/profile` | — | `RawUserProfileResponse` |
| `PUT /api/settings/user/profile` | 见契约 | — |
| `GET /api/settings/user/playback` | — | `RawUserPlaybackResponse` |
| `PUT /api/settings/user/playback` | 见契约 | — |
| `GET /api/settings/user/appearance` | — | `RawUserAppearanceResponse` |
| `PUT /api/settings/user/appearance` | 四键（下） | — |

### appearance 字段

后端 KV `user.appearance.{user_id}` 承载，四键：

| 字段 | 值域 | 说明 |
|---|---|---|
| `theme` | `system` \| `dark` \| `light` | ✅ 已对齐（G-16 已修） |
| `poster_density` | `compact` \| `comfortable` \| `spacious` | 海报密度 |
| `reduced_motion` | bool | 减少动效 |
| `home_sections` | string[] | 首页分区顺序 |

> **未知键一律 400**（`unknown appearance field`，fail-closed）：客户端多带一个字段即被拒，
> 不允许任意键入库。

> ✅ **G-16 已修复（2026-09-19）**：后端白名单为 `["system","dark","light"]`
> （`crates/fmby-v2-bridges/src/bridges/settings.rs:380`）——前端「跟随系统」不再 400；
> 原 `"template"`（笔误）已移除。主题作者仍以 host `useTheme()` 为真相。

> ⚠️ **G-01（**已收窄**）**：**用户级**主题 id 仍只存 localStorage（后端无 per-user 字段，
> 跨端同步待补）。但**站点级**主题启停**已实现**，见下「站点主题」。

---

## 服务器设置（能力 `ManageSettings`）

| 方法 路径 | 说明 |
|---|---|
| `GET /api/settings/server/general` / `PUT` 同路径 | 通用设置 |
| `GET /api/settings/server/security` / `PUT` 同路径 | 安全设置 |
| `GET /api/settings/server/session-policy` / `PUT` 同路径 | 会话策略（下表） |
| `GET /api/settings/server/email` / `PUT` 同路径 | 邮件通道配置（密码密封写、读面掩码） |
| `POST /api/settings/server/email/test` | 发测试信（**副作用：真实发信**） |
| `GET /api/settings/server/cdn-operations` / `PUT` 同路径 | CDN 运维配置 |
| `POST /api/settings/server/cdn-operations/test` | 连通性自检 |
| `POST /api/settings/server/cdn-operations/refresh` | 刷新缓存（**副作用：回源**） |
| `POST /api/settings/server/cdn-operations/preheat` | 预热（**副作用：回源**） |
| `GET /api/settings/integrations/ai-assist` / `PUT` 同路径 | AI 辅助配置（`api_key` 密封写、读面仅掩码） |
| `GET /api/settings/integrations/outbound-http` / `PUT` 同路径 | 出站 HTTP 统一层（代理密码密封写） |
| `POST /api/settings/integrations/outbound-http/test` | 出站自检 |

> 上述 4 个设置族（email / cdn-operations / ai-assist / outbound-http）此前无文档；
> `test` 类端点带真实副作用（发信 / 回源），调用方需自行确认。

### session-policy 字段

| 字段 | 边界 | 含义 |
|---|---|---|
| `remember_me_ttl_days` | 1..3650 | 记住我时长 |
| `single_session_for_admins` | bool | 管理员单会话 |
| `compat_legacy_session_fallback_enabled` | bool | 兼容面旧会话回退（Emby/Jellyfin 客户端） |

> 前端把 `general` / `security` / `session-policy` 三页**收敛到** `/manage/site/settings`——
> 这是**前端路由**重定向，**API 路径不变**（仍是 `/api/settings/server/*`），老书签不会 404。

---

## 站点主题（session + `Browse`）

| 方法 路径 | 说明 |
|---|---|
| `GET /api/site/themes` | 主题清单（fail-closed，不 500） |
| `POST /api/site/themes/install` | 安装主题 |
| `POST /api/site/themes/{id}/enable` | 启用/停用主题（真写状态 + 审计 `site.theme.enable`） |

---

## 站点设置

| 方法 路径 | 能力 | 请求/响应 |
|---|---|---|
| `GET /api/admin/site-settings` | `ManageSettings` | `SiteSettingsDto` |
| `PUT /api/admin/site-settings` | `ManageSettings` | 同四字段 |

`SiteSettingsDto` 四字段：

| 字段 | 值域 / 校验 |
|---|---|
| `theme_mode` | `dark` \| `light`（**站点级明暗；不含 `system`**） |
| `timezone_display` | 时区展示名 |
| `site_name` | 可选；有长度上限 |
| `brand_logo_url` | 可选；必须是同源路径或 `http(s)` 绝对 URL |

> ⚠️ **易混**：站点级 `theme_mode` 只认 `dark`/`light`；**用户级** `appearance.theme`
> 认 `system`/`dark`/`light`。两者同名不同意，前端不要复用同一枚举。