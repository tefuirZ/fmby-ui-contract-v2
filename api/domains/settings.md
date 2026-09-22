# API · 设置（个人 + 服务器）

---

## 个人设置（仅需登录，无能力闸）

| 方法 路径 | 响应 |
|---|---|
| `GET/PUT /api/settings/user/profile` | `RawUserProfileResponse` |
| `GET/PUT /api/settings/user/playback` | `RawUserPlaybackResponse` |
| `GET/PUT /api/settings/user/appearance` | `RawUserAppearanceResponse` |

### appearance 字段（★含已知缺口）

后端 KV `user.appearance.{user_id}` 承载，四键：

| 字段 | 值域 | 说明 |
|---|---|---|
| `theme` | `system` \| `dark` \| `light`（后端 `bridges/settings.rs:380`） | ✅ **已对齐（G-16 已修）** |
| `poster_density` | `compact` \| `comfortable` \| `spacious` | 海报密度 |
| `reduced_motion` | bool | 减少动效 |
| `home_sections` | string[] | 首页分区顺序 |

> ✅ **G-16 已修复（2026-09-19）**：后端白名单现为 `["system","dark","light"]`
> （`crates/fmby-v2-server/src/bridges/settings.rs:380`）——前端「跟随系统」不再 400；
> 原 `"template"`（笔误）已移除。主题作者仍以 host `useTheme()` 为真相。

> ⚠️ **G-01**：用户所选**主题 id（darkroom/template）**只存 localStorage，后端无该字段。
> 跨端同步待后端补字段。

---

## 服务器设置（能力 `ManageSettings`）

| 方法 路径 | 响应 |
|---|---|
| `GET/PUT /api/settings/server/general` | `RawServerGeneralResponse` |
| `GET/PUT /api/settings/server/security` | `RawServerSecurityResponse` |
| `GET/PUT /api/settings/server/session-policy` | `RawServerSessionPolicyResponse` |

> 前端已把这三页**统一收敛到** `/manage/site/settings`（旧路径 `/settings/server/*`
> 保留为重定向，避免老书签 404）。

---

## 站点设置

| 方法 路径 | 能力 | 响应 |
|---|---|---|
| `GET/PUT /api/admin/site-settings` | `ManageSettings` | `SiteSettingsDto` |

`SiteSettingsDto` 含 `theme_mode`（`dark` / `light`，**站点级明暗**）、`timezone_display` 等。
