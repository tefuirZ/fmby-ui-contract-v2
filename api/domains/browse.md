# API · 浏览 / 检索 / 推荐

鉴权：`session`（能力 `Browse`）。

---

## 浏览

| 方法 路径 | 参数 | 响应 | 错误 |
|---|---|---|---|
| `GET /api/browse/roots` | `libraryId?`、`kind?`、分页/排序 | `Page<RootItem>` | 403 / 404 |
| `GET /api/browse/home/bootstrap` | — | `HomeBootstrapResponse` | — |
| `GET /api/browse/libraries` | — | `LibraryListResponse` | — |
| `GET /api/browse/libraries/{id}` | `page` / `pageSize` | `LibraryDetailResponse` | 404 / 403 |
| `GET /api/browse/history` | `page`（>1 显式拒绝） | `BrowseHistoryResponse{items, total}` | — |
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
  "has_more": true
}
```

> `/api/browse/history` 的 `page > 1` **显式拒绝**（不假分页）——历史页当前只支持首页。

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

`GET /api/search`

| 参数 | 类型 | 语义 |
|---|---|---|
| `q` | string | 检索词（缺省 = 全部；索引命中时参与检索） |
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
| `offset` | number | 默认 0 |
| `limit` | number | 默认 50，上限 100 |
| `sort` | enum | `relevance` \| `title` \| `year`（默认 `relevance`） |

响应 `Page<Item>`；非法参数 400，无权限 403（能力 `Browse`）。

> ⚠️ 前端契约里曾出现 `/api/browse/search`（错误路径）——正确路径是 **`/api/search`**。

---

## 推荐

`GET /api/recommendations/for-you` → `ForYouList`（过滤后再去重）。能力 `Browse`。
