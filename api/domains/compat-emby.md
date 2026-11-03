# API · 兼容面（Emby / Jellyfin 客户端）

> **定位**：这不是一方 WebUI 的 API，而是让**第三方 Emby / Jellyfin 客户端**直连本服务的兼容层
> （`crates/fmby-v2-compat`）。服务端内部（用户面/播放面）与它**完全隔离**。

---

## 契约状态（重要）

- 本文件是**人读文档**；兼容面**当前不在** `contracts/api-fields.json` 与
  `scripts/check-contract-sync.mjs` 的扫描面内（清单里 `/emby` 前缀条目为 **0**）。
- ⇒ 兼容面**没有字段级机械闸**，形状变更只能靠 compat 侧自带测试兜底。
- 「是否把兼容面纳入契约真源（会立刻把基线 483 → 600+ 端点）」是**待裁决项**；
  在裁决前，本文件只描述现状，不冒充机械契约。

规模（当次实测）：**131 个方法级路由 / 111 个去重路径 / 26 个族**。
其中约 20 条是**大小写双挂**（同一 handler 同时注册 `PascalCase` 与 `lowercase` 两种路径，
适配不同客户端），下文族表按族合并计数。

---

## 前缀

- `/emby/*` 与 `/jellyfin/*` **同表同 handler**（仅前缀不同）。
- 部分族路径**大小写双挂**（如 `System/Info` 与 `system/info`、`Videos/{id}/stream` 与
  `videos/{id}/stream`）；客户端可任选，行为一致。

---

## 鉴权（token 通道，按优先级）

compat 面**不使用一方会话 cookie**。Token 按以下顺序提取（命中即用，sanitize 失败落到下一通道）：

| 序 | 通道 | 说明 |
|---|---|---|
| ① | `X-Emby-Token` / `X-MediaBrowser-Token` / `X-MediaBrowser-ApiKey` | 直接 token header |
| ② | `apikey` header | 同上口径 |
| ③ | `Authorization` / `X-Emby-Authorization` / `X-MediaBrowser-Authorization` | 兼容**简形** `MediaBrowser Token=xxx` **与真实客户端多参形态** `MediaBrowser Client="…", Device="…", DeviceId="…", Version="…", Token="…"` |
| ④ | query `?api_key=` | V1 同面 |

均缺失 ⇒ **401**（`missing compat api key`）。

> 真实客户端（Jellyfin `jellyfin-apiclient-python`、Emby 官方客户端）发的是**带引号的多参形态**；
> 只认简形的实现会把整串当 key → 401。本实现按 V1 `parse_authorization_token` 口径补齐。

---

## 端点族

| 族 | 方法与计数 | 代表路径 | 说明 |
|---|---|---|---|
| **System** | GET ×6（＋小写双挂 5） | `/emby/System/Info`、`/Info/Public`、`/Ping`、`/Endpoint`、`/WakeOnLanInfo` | 握手/发现 |
| **Users** | GET/DELETE/POST ×33（＋小写双挂） | `/emby/Users/Public`、`/Users/{id}/Views`、`/Users/{id}/Items`(+Latest/Resume/RecentlyAdded)、`/Users/authenticatebyname` | 登录与用户视图 |
| **UserItems** | POST/DELETE ×2（＋双挂） | `/emby/UserItems/{id}/Rating` | 评分 |
| **Items** | GET/POST ×11 | `/emby/Items`、`/Items/{id}`、`/Items/{id}/Images/{kind}`、`/Items/{id}/PlaybackInfo`、`/Items/Filters2`、`/Items/Counts` | 条目面（含播放信息协商） |
| **Persons / persons** | GET ×4（双挂） | `/emby/Persons`、`/Persons/{id}`、`/Persons/{id}/Images/{kind}` | 人物 |
| **Videos / videos** | GET/HEAD ×15（双挂） | `/emby/Videos/{id}/stream`、`/original`、`/{id}/{mediaSourceId}/stream`、`/main.m3u8`、`/{id}/{source}/Subtitles/{index}/Stream.{format}` | **取流/字幕/转码清单**；HEAD 用于探测 |
| **Sessions** | GET/POST ×7 | `/emby/Sessions`、`/Sessions/Playing`(+`Ping`/`Progress`/`Stopped`)、`/Sessions/Capabilities/Full` | 播放进度回传 |
| **Sync** | GET/POST ×2 | `/emby/Sync/{id}/Status` | 同步状态 |
| **Shows** | GET ×5 | `/emby/Shows/NextUp`、`/Upcoming`、`/Shows/{id}/Episodes`、`/Seasons`、`/Similar` | 剧集 |
| **Collections** | GET ×2（双挂） | `/emby/Collections` | 合集 |
| **Genres / Studios / Tags / Years / OfficialRatings** | GET ×5 | 同族名路径 | 分类面 |
| **Movies** | GET ×1 | `/emby/Movies/Recommendations` | 推荐 |
| **LiveTv** | GET ×2 | `/emby/LiveTv/Channels`、`/Programs` | 电视 |
| **DisplayPreferences** | GET ×2（双挂） | `/emby/DisplayPreferences/UserSettings` | 显示偏好 |
| **CustomCssJS** | GET ×1 | `/emby/CustomCssJS/Scripts` | 客户端脚本位（通常返回空） |
| **WebSocket** | GET ×2 | `/emby/embywebsocket`、`/jellyfinwebsocket` | 实时通道 |

---

## 取流复用（一条实现、三个入口）

`/emby/Videos/{id}/stream` 的取流**委托**服务端 `playback::playback_stream` —— 会话票据、SSRF 防护、
`Range` 全部复用。同一实现的其他入口：

| 入口 | 面向 |
|---|---|
| `/emby/Videos/{id}/stream`（+ `/jellyfin`） | 第三方客户端 |
| `/api/playback/stream/{variant_id}` | 一方 WebUI 播放器 |
| `/api/assets/streams/{source_id}` | 资产面 |

> 排查「某端能播、另一端不能播」时，先确认是否命中同一实现与同一票据校验。

---

## 与一方会话隔离

- compat token **不能**用于 `/api/*` 一方接口；一方 cookie **也不能**直接用于 compat 面。
- 兼容面不接受 CSRF 双匹配（无 cookie 语义）；接入方按上表 token 通道调用。
- `parse` 与 `/api/v1`（Bearer + scope）也是两套：`/api/v1` 是**开放 API**，
  见 [`../open-v1.md`](../open-v1.md)；compat 面面向 Emby/Jellyfin 协议本身。

---

## 已知缺口

1. 无字段级机械契约（见上「契约状态」）——响应形状变更不会被任何闸捕获。
2. `/emby` 兼容面的**能力边界**（哪些 Emby 端点未覆盖）没有清单，只能按族对照上游协议文档。
3. `CustomCssJS` / `LiveTv` 等族多为**最小实现**（返回空或占位），不要按完整 Emby 语义预期。