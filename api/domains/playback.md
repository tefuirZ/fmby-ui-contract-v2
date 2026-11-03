# API · 媒体项 / 资产 / 播放

鉴权：`Browse`（items/assets）/ `Play`（playback）。

---

## 媒体项

| 方法 路径 | 参数 | 响应 | 错误 |
|---|---|---|---|
| `GET /api/items/{id}` | — | `ItemDetailWebDto` | 404 / 403 |
| `GET /api/items/{id}/descendants` | `page` / `pageSize` | `ItemDescendantsResponse{items,total,next_cursor,has_more}` | 404 / 403 |
| `GET /api/items/{id}/children` | `page` / `pageSize` | 与 descendants 同形（**只取一层**，不递归） | 404 / 403 |
| `POST /api/items/{id}/played` | — | 204 | 404 / 403 |
| `DELETE /api/items/{id}/played` | — | 204 | 404 / 403 |
| `GET /api/items/{id}/likes` | — | 当前点赞状态（字段以 `contracts/api-fields.json` 为准） | 404 / 403 |
| `PUT /api/items/{id}/likes` | 见响应契约 | 写入后状态（幂等） | 404 / 403 |
| `DELETE /api/items/{id}/likes` | — | 清除后状态（幂等） | 404 / 403 |
| `GET /api/items/people/{id}` | — | 人物详情 | 404 / 403 |
| `GET /api/items/people/{id}/items` | `page` / `pageSize` | 人物作品列表 | 404 / 403 |

> 观看状态与 likes 在 V2 归 **items 域**（V1 曾挂 `/api/playback/items/...`）；
> `/api/playback/**` 只负责取流与会话。

---

## 资产（二进制数据面）

| 方法 路径 | 说明 |
|---|---|
| `GET /api/assets/{blob_id}` | 二进制 body（`Range` / `ETag`） |
| `GET /api/assets/image-proxy` | 只读图片代理（豆瓣/TMDB 反防盗链透传 + 本地缓存） |
| `GET /api/assets/items/{item_id}/images/{kind}` | 条目图片 |
| `GET /api/assets/collections/{collection_id}/images/{kind}` | 合集图片（collage 合成 + 内容寻址缓存） |
| `GET /api/assets/libraries/{library_id}/images/{kind}` | 库级图片（**已实现**，G-13 关闭） |
| `GET /api/assets/media-items/{item_id}/subtitles/{override_id}` | 字幕文件（寻址键 = 覆写行） |
| `GET /api/assets/people/{person_id}/primary` | 人物主图 |
| `GET /api/assets/streams/{source_id}` | 取流入口：**委托** `playback::playback_stream`（会话票据/SSRF/Range 全部复用），`source_id` 按 V2 variant id 解释 |

`GET /api/assets/{blob_id}` 的协议细节：

- 请求头：`Range`（部分内容）、`If-None-Match`（ETag 协商缓存）
- 响应头：`ETag`、`Content-Range`（Range 请求时）
- 状态码：`200` / `206` / `304` / `404` / `415` / `416`
- **归属闸（fail-closed）**：任一 owner 可见即放行；**归属不可判定 ⇒ 404**。
  因此 404 同时表示「无此 blob」与「无权 / 不可判定」，前端不要据此区分存在性。

---

## 播放

| 方法 路径 | 请求 | 响应 | 错误 |
|---|---|---|---|
| `POST /api/playback/resolve` | `{variant_id}`（**snake**） | `PlaybackTargetDto{url_ref, kind, quality, container?}` | 403 / 404 |
| `POST /api/playback/report` | `{session_id, progress}`（**snake**；`progress` 为 0..1 比例） | 204 | — |
| `POST /api/playback/sessions` | `{item_id}` | `PlaybackSessionCreateDto` | 404 / 403 |
| `POST /api/playback/sessions/{id}/progress` | `{position_ticks, duration_ticks, is_completed}` | 204 | 404 |
| `POST /api/playback/sessions/{id}/heartbeat` | `{position_ticks, paused}` | 204 | 404 |
| `POST /api/playback/sessions/{id}/stop` | `{position_ticks, duration_ticks, is_completed}` | 204 | 404 |
| `GET /api/playback/stream/{variant_id}?session=<票据>` | `session` **必填** | 本地：`video/mp4`（200/206，支持 `Range`）；远程：**302 + `Location`**（`Cache-Control: no-store`，不返 body） | 400 / 401 / 403 / 404 / 409 / 502 / 504 |
| `GET /api/playback/stream/{variant_id}/{session}` | 票据走**路径**（与 `stream_url` 对齐） | 同上 | 同上 |
| `GET /api/playback/realtime/ws?scope=<…>` | WebSocket；`scope=task_center` ⇒ 任务中心流式，缺省/其它 ⇒ 播放实时面 | WS 帧流 | 403 |

> **票据必填**：无有效会话票据的取流请求会被拒绝（不是匿名可播）。
> `kind` 区分本地（`file://`）与远程（302）两种形态，前端选源逻辑须按 `kind` 分支。

### 播放流程（前端参考）

```text
1. 进入播放页 → POST /api/playback/sessions {item_id} → 得 session id 与 stream_url
2. 选源 → POST /api/playback/resolve {variant_id}
          → 得 {url_ref, kind, quality, container?}
3. 播放中 → POST /api/playback/sessions/{id}/heartbeat（暂停/进度）
           → 进度变化 POST .../progress
4. 结束 → POST /api/playback/sessions/{id}/stop
```

`url_ref` 可能是直链或需按 `kind` 再请求的引用；远程源的取流端点会以 302 重定向到真实地址，
前端播放器应允许跨源重定向并**不要把 Location 写日志**。