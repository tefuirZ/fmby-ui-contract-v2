# API · 浏览 / 检索 / 推荐

鉴权：`session`（能力 `Browse`）。

---

## 浏览

| 方法 路径 | 参数 | 响应 | 错误 |
|---|---|---|---|
| `GET /api/browse/roots` | `libraryId?`、`kind?`（**无分页/排序**） | `RootItemDto[]`（**裸数组**，无 total/cursor） | 403 / 404 |
| `GET /api/browse/home/bootstrap` | — | `HomeBootstrapResponse` | — |
| `GET /api/browse/libraries` | — | `LibraryListResponse` | — |
| `GET /api/browse/libraries/home` | — | 与 `/browse/libraries` **同形**（复用同一 handler；首页子集由前端自取） | — |
| `GET /api/browse/libraries/{id}` | `page` / `pageSize` / `cursor` / `mediaType`（非法媒体类型 ⇒ 400 `invalid_media_type`） | `LibraryDetailResponse`（含 `media_types[]` facet） | 404 / 403 / 400 |
| `GET /api/browse/history` | `page`（**>1 显式拒绝**）、`pageSize` | `BrowseHistoryResponse{items, total}` | 400 `validation` |
| `GET /api/browse/resume` | `page` / `pageSize` | 分页列表 | 403 |
| `GET /api/browse/recently-added` | `page` / `pageSize` | `RecentlyAddedResponse{items, next_cursor, has_more}`（**无 total**，keyset） | 403 |
| `GET /api/browse/items/{id}` | — | `ItemDetail` | 404 / 403 |

`LibraryDetailResponse`：

```jsonc
{
  "library": { "...": "..." },
  "hero_summary": "…|null",
  "items": [ "…" ],
  "total": 1234,
  "page": 1,
  "page_size": 40,
  "next_cursor": "…|null",
  "has_more": true,
  "media_types": [ { "value": "movie", "label": "电影", "count": 812 } ]
}
```

> `/api/browse/history` 的 `page > 1` **显式拒绝**（不假分页）——历史页当前只支持首页。
> `/api/browse/recently-added` 用 `next_cursor`/`has_more` 替代 `total`（V2 keyset 口径，
> 与 V1 `ListResponse` 的 total 语义不同）。

> **读面分页/过滤语义（2026-10-21 同步，#1851 F4/F6 修复 + #1882/#1863）**：
> - 库详情读面（`LibraryDetailResponse.items` + `next_cursor/has_more`）走 **keyset 游标**
>   （`fmby-v2-domain::cursor::keyset_id_after`，不重页、稳定排序）；
> - **全库口径**：`library_id` 缺省（None）= 跨库聚合——`kind` 过滤与 keyset 游标在
>   全库口径**同样生效**（此前 where 优先级曾吞掉两者，#1872 治本）；
> - **删除中库排除**：异步删除（pending/running）节点恒不可见，判据**先于** 0125 桶
>   快路径（#1882，`read_side_delete_hiding`）；
> - **facet 统计**（`count_nodes_by_kind`）同口径：全库 = 双 SQL 分支（有 libraryId 走
>   索引 SEARCH / 无则全量 GROUP BY），删除中库排除谓词保留（#1857/#1863）。

---

## 检索

### `GET /api/search`（索引检索）

| 参数 | 类型 | 语义 |
|---|---|---|
| `q` | string | 检索词（缺省 = 全部；**≤256 字符**） |
| `library_ids` | csv | 限定库（非空） |
| `media_types` | csv | 限定媒体类型（非空） |
| `root_only` | bool | 仅根节点 |
| `has_effective_source` | bool | 有有效源 |
| `has_poster` | bool | 有海报 |
| `has_subtitle` | bool | 有字幕 |
| `has_local_override` | bool | 有本地覆盖 |
| `source_status` | enum | `mounted` \| `missing` |
| `mount_status` | enum | `configured` \| `unavailable` \| `maintenance` \| `verified` |
| `metadata_status` | enum | `identified` \| `missing` \| `__fmby_metadata_missing__` |
| `offset` | number | 默认 0，**上限 10 000** |
| `limit` | number | 默认 50，上限 100 |
| `sort` | enum | **仅 `relevance`**（默认）；`title` / `year` ⇒ **400**（索引 schema 未扩展） |

响应 **`RootItemDto[]`（裸数组）**，不是 `Page<Item>`；非法参数 400，无权限 403（能力 `Browse`）。

### `GET /api/browse/search`（条目 + 合集合并检索）

与 `/api/search` **并存且语义不同**：它把 browse 条目与合集两路合并返回，响应为
`BrowseSearchResponse{items, total}`，参数 `q` / `limit` / `pageSize` / `page`。

> 早前文档把该路径判为「前端笔误 / 错误路径」——**该判断是错的**：后端已注册并实现
> （V1 `browse/routes.rs:20` 对位）。`/api/search` 与 `/api/browse/search` 是两个端点，
> 前端可任选；若只用 `/api/search`，合集检索需另行调用合集接口。

---

## 推荐

`GET /api/recommendations/for-you` → **`RecommendationItemDto[]`**（裸数组）。
参数 `limit?`；元素含 `reason`（投影标注或 `trending` 兜底）。能力 `Browse`。

---

## 合集（用户面）

| 方法 路径 | 说明 |
|---|---|
| `GET /api/collections` | 当前用户可见合集列表（分页 `page`/`pageSize`；Hidden 不出现） |
| `GET /api/collections/{id}` | 合集详情（Active 可见性闸） |
| `GET /api/collections/{id}/tracks/{track_key}` | 轨道视图（release / watch 双轨） |

鉴权：session + `Browse` + **Active 实例**闸；可见性按成员数两半判定。