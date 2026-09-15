# API · 媒体项 / 资产 / 播放

鉴权：`Browse`（items/assets）/ `Play`（playback）。

---

## 媒体项

| 方法 路径 | 参数 | 响应 | 错误 |
|---|---|---|---|
| `GET /api/items/{id}` | — | `ItemDetailWebDto` | 404 / 403 |
| `GET /api/items/{id}/descendants` | `page` / `pageSize` | `ItemDescendantsResponse{items,total,next_cursor,has_more}` | 404 / 403 |

---

## 资产（二进制数据面）

| 方法 路径 | 说明 |
|---|---|
| `GET /api/assets/{blob_id}` | 二进制 body |

请求头支持：`Range`（部分内容）、`If-None-Match`（ETag 协商缓存）。

响应头：`ETag`、`Content-Range`（Range 请求时）。

状态码：`200` / `304`（未修改）/ `404`（无此 blob）/ `415`（不支持的媒体类型）/ `416`（Range 不满足）。

> 当前资产面只有这一个端点。前端契约里出现的 `/api/assets/items/{id}/images/{id}`、
> `/api/assets/subtitles` 等**尚未实现**（见 implementation-status G-13）。

---

## 播放

| 方法 路径 | 请求 | 响应 | 错误 |
|---|---|---|---|
| `POST /api/playback/resolve` | `{variantId}` | `PlaybackTarget{url_ref, kind}` | 403 / 404 |
| `POST /api/playback/report` | `{sessionId, progress}` | 204 | — |
| `POST /api/playback/sessions` | `{item_id}` | `PlaybackSessionCreateDto` | 404 / 403 |
| `POST /api/playback/sessions/{id}/progress` | `{position_ticks,duration_ticks,is_completed}` | 204 | 404 |
| `POST /api/playback/sessions/{id}/heartbeat` | `{position_ticks,paused}` | 204 | 404 |
| `POST /api/playback/sessions/{id}/stop` | `{position_ticks,duration_ticks,is_completed}` | 204 | 404 |
| `GET /api/playback/stream/{variant_id}` | — | `video/mp4` bytes | 404 / 403 |

### 播放流程（前端参考）

```text
1. 进入播放页 → POST /api/playback/sessions {item_id} → 得 session id
2. 选源 → POST /api/playback/resolve {variantId} → 得 {url_ref, kind}
3. 播放中 → 定时 POST /api/playback/sessions/{id}/heartbeat（暂停/进度）
           → 进度变化 POST .../progress
4. 结束 → POST /api/playback/sessions/{id}/stop
```

`url_ref` 可能是直链或需前端再请求的引用（依 `kind`）。
