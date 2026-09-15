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
| `theme` | — | ⚠️ **值域前后端不一致，见下** |
| `poster_density` | `compact` \| `comfortable` \| `spacious` | 海报密度 |
| `reduced_motion` | bool | 减少动效 |
| `home_sections` | string[] | 首页分区顺序 |

> ⚠️ **G-16（确凿 bug）**：后端校验 `theme ∈ ["dark","template","light"]`；前端类型是
> `'system' | 'dark' | 'light'`。**两集合不等**——前端提交 `system` 会被后端 400。
> 另外后端把「明暗模式（dark/light）」与「主题 id（template）」混在同一字段。
> 主题作者**不要**依赖此字段做主题切换（host 的 `useTheme()` 才是主题真相）。

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
