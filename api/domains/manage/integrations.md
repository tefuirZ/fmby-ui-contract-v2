# API · 管理面 · 集成面（公告 / 通知 / Telegram / AI 辅助 / 登录方式）

> 由清单自动生成的端点登记。**语义待人补**（何时调用 / 边界 / 错误码 / 能力门）。

---

> ⚠️ **本表由 `contracts/api-fields.json` 机械生成**（`scripts/gen-domain-docs.mjs`，可重跑）——
> 保证「端点 / 字段名」与后端 DTO 一致；**语义、边界、错误码、能力门待人补充**。
> 需要接口何时调用、失败如何分流，请连同源码一起确认后再补写。

本文件共 **26** 个端点。

### manage/ai-interventions

| 方法 路径 | 请求 | 响应 |
|---|---|---|
| `GET /api/manage/ai-interventions/media/{id}` | — | `ThreadDetail`{thread, messages, runs} |
| `POST /api/manage/ai-interventions/media/{id}/apply` | `ApplyBody`{session_id} | `AiInterventionThread` |
| `POST /api/manage/ai-interventions/media/{id}/session/open` | `OpenSessionBody`{preferred_skill_key} | `AiInterventionThread` |
| `POST /api/manage/ai-interventions/media/{id}/suggest` | — | `AiSuggestResponse`{mediaItemId, suggestedTitle, suggestedYear, suggestedSeason, suggestedEpisode, externalId, confidence, reasoning, wouldAutoBind} |
| `POST /api/manage/ai-interventions/session/close` | `CloseSessionBody`{session_id} | `AiInterventionThread` |
| `POST /api/manage/ai-interventions/session/message` | `SendMessageBody`{session_id, message} | `AiInterventionSessionMessage` |
| `GET /api/manage/ai-interventions/threads` | `ThreadListQuery`{limit, offset} | `AiInterventionThread` |

### manage/announcements

| 方法 路径 | 请求 | 响应 |
|---|---|---|
| `GET /api/manage/announcements` | `AnnouncementsQuery`{status, limit, cursor} | `AnnouncementPageDto`{items, next_cursor} |
| `POST /api/manage/announcements` | `CreateAnnouncementRequest`{title, body, level, bodyFormat, audienceKind, audienceRef, startsAt, endsAt, pinned} | `AnnouncementDto`{id, level, title, body, body_format, audience_kind, audience_ref, status, starts_at, ends_at, pinned, published_by, …(共17)} |
| `GET /api/manage/announcements/{id}` | — | `AnnouncementDto`{id, level, title, body, body_format, audience_kind, audience_ref, status, starts_at, ends_at, pinned, published_by, …(共17)} |
| `PATCH /api/manage/announcements/{id}` | `UpdateAnnouncementRequest`{title, body, bodyFormat, level, audienceKind, audienceRef, startsAt, endsAt, pinned} | `AnnouncementDto`{id, level, title, body, body_format, audience_kind, audience_ref, status, starts_at, ends_at, pinned, published_by, …(共17)} |
| `POST /api/manage/announcements/{id}/archive` | — | `AnnouncementDto`{id, level, title, body, body_format, audience_kind, audience_ref, status, starts_at, ends_at, pinned, published_by, …(共17)} |
| `POST /api/manage/announcements/{id}/publish` | — | `AnnouncementDto`{id, level, title, body, body_format, audience_kind, audience_ref, status, starts_at, ends_at, pinned, published_by, …(共17)} |

### notifications

| 方法 路径 | 请求 | 响应 |
|---|---|---|
| `GET /api/notifications` | `NotificationsQuery`{cursor, limit, unreadOnly, kind} | `NotificationPageDto`{items, next_cursor} |
| `POST /api/notifications/{id}/read` | — | — |
| `POST /api/notifications/read` | `MarkReadBatchRequest`{ids} | — |
| `POST /api/notifications/read-all` | `ReadAllRequest`{kind} | — |
| `GET /api/notifications/unread-count` | — | `UnreadCountDto`{total, by_kind, announcement_unread} |

### manage/auth-providers

| 方法 路径 | 请求 | 响应 |
|---|---|---|
| `GET /api/manage/auth-providers` | — | `AuthProviderConfigsView` |
| `PUT /api/manage/auth-providers` | `UpdateAuthProviderConfigsRequest` | `AuthProviderConfigsView` |
| `POST /api/manage/auth-providers/{provider}/diagnostics` | `AuthProviderDiagnosticRequest` | `AuthProviderDiagnosticResponse` |

### announcements

| 方法 路径 | 请求 | 响应 |
|---|---|---|
| `GET /api/announcements/active` | — | `ActiveAnnouncementDto`{id, level, title, body, body_format, pinned, starts_at, ends_at, read_at} |
| `POST /api/announcements/read` | `MarkAnnouncementsReadRequest`{ids} | — |

### manage/telegram-bot

| 方法 路径 | 请求 | 响应 |
|---|---|---|
| `POST /api/manage/telegram-bot/test` | `TelegramSendTestRequest`{chat_id} | `TelegramSendTestResponseDto`{sent, chat_id} |
| `POST /api/manage/telegram-bot/verify-token` | `TelegramVerifyTokenRequest`{token} | `TelegramVerifyTokenResponseDto`{valid, bot_id, username, first_name} |

### manage/notifications

| 方法 路径 | 请求 | 响应 |
|---|---|---|
| `POST /api/manage/notifications/send` | `SendNotificationRequest`{kind, audienceKind, audienceRef, level, title, body, linkHref, payload, dedupeKey} | `SendNotificationResponseDto`{delivered, skipped} |
