# API · 管理面 · 媒体库与媒体条目

能力：`ManageLibrary`（删除叠加 `DangerousAction`）。

---

## 媒体库

| 方法 路径 | 说明 |
|---|---|
| `GET /api/manage/libraries` | 列表 → `RawListResponse<RawManagedLibraryRecord>` |
| `POST /api/manage/libraries` | 新建 |
| `GET /api/manage/libraries/{id}` | 详情 |
| `PATCH /api/manage/libraries/{id}` | 更新 |
| `DELETE /api/manage/libraries/{id}` | 删除（危险） |
| `GET /api/manage/libraries/deletions` | 删除中的库列表（**静态段先于 `{id}`**） |
| `PUT /api/manage/libraries/order` | 库排序（整表替换） |
| `POST /api/manage/libraries/{id}/scan` | 触发扫描 |
| `GET /api/manage/libraries/{id}/delete-status` | 删除进度 |
| `POST /api/manage/libraries/{id}/delete/retry` | 删除重试 |
| `GET /api/manage/libraries/{id}/cleanup-preview` | 清理预览（不落状态） |
| `POST /api/manage/libraries/{id}/cleanup` | 执行清理 |
| `GET /api/manage/libraries/{id}/media-reset-preview` | 媒体重置预览 |
| `POST /api/manage/libraries/{id}/media-reset` | 媒体重置 |
| `POST /api/manage/libraries/{id}/sources/{source_id}/purge` | 清除指定来源 |

---

## 媒体条目

| 方法 路径 | 说明 |
|---|---|
| `GET /api/manage/media-items` | 列表（分页/搜索）→ `RawListResponse<RawManagedMediaItemRecord>` |
| `GET /api/manage/media-items/{id}` | 详情 → `RawManagedMediaItemDetailRecord` |
| `DELETE /api/manage/media-items/{id}` | 删除（危险） |
| `GET /api/manage/media-items/{id}/pipeline` | 处理管道 → `RawManagedMediaItemPipelineRecord` |
| `PATCH /api/manage/media-items/{id}/metadata` | 改元数据 |
| `POST /api/manage/media-items/{id}/metadata/reset` | 重置元数据 |
| `POST /api/manage/media-items/{id}/refresh-metadata` | 刷新元数据 |
| `POST /api/manage/media-items/{id}/scrape` | 触发刮削 |
| `POST /api/manage/media-items/{id}/scrape/refresh` | 刷新刮削 |
| `POST /api/manage/media-items/{id}/scan` | 触发扫描 |
| `POST /api/manage/media-items/{id}/identify` | 触发识别（幂等入队） |
| `POST /api/manage/media-items/{id}/identity/manual-match` | 手工绑定身份（`?confirmed=true`） |
| `GET /api/manage/media-items/{id}/provider-search` | 刮削源候选搜索（**候选上限由后端硬截断**） |
| `POST /api/manage/media-items/{id}/artwork` | 上传图片 |
| `GET /api/manage/media-items/{id}/artwork/{kind}` | 读取图片（含来源标记） |
| `DELETE /api/manage/media-items/{id}/artwork/{override_id}` | 删除图片覆盖 |
| `POST /api/manage/media-items/{id}/subtitles` | 上传字幕 |
| `GET /api/manage/media-items/{id}/subtitles/{override_id}` | 读取字幕 |
| `PATCH /api/manage/media-items/{id}/subtitles/{override_id}` | 改字幕 |
| `DELETE /api/manage/media-items/{id}/subtitles/{override_id}` | 删字幕覆盖 |
| `POST /api/manage/media-items/{id}/subtitles/fetch-online` | 在线拉取字幕 |
| `DELETE /api/manage/media-items/{id}/sources/{source_id}` | 删除来源 |
| `POST /api/manage/media-items/{id}/visibility/{state}` | 可见性四态（admin + `DangerousAction`，`?confirmed=true`） |
| `POST /api/manage/media-items/ratings/backfill` | 评分回填 |

> ✅ 原记「子资源端点尚未实现（G-05）」早已过时：上表全部已实现（`api-fields` 同族 23+ 端点）。

---

## 媒体审核（media-reviews）

| 方法 路径 | 说明 |
|---|---|
| `GET /api/manage/media-reviews` | 审核队列列表 |
| `GET /api/manage/media-reviews/provider-search` | 审核面刮削源候选（**静态段先于 `{id}`**） |
| `GET /api/manage/media-reviews/{id}` | 详情 |
| `POST /api/manage/media-reviews/{id}/claim` | 认领 |
| `POST /api/manage/media-reviews/{id}/release` | 释放 |
| `POST /api/manage/media-reviews/{id}/resolve` | 裁决 |

---

## 探测任务

| 方法 路径 | 说明 |
|---|---|
| `GET /api/manage/probe-tasks` | 列表 |
| `POST /api/manage/probe-tasks` | 创建 |
| `GET /api/manage/probe-tasks/{id}` | 详情 |
| `POST /api/manage/probe-tasks/{id}/enqueue` | 入队 |
| `POST /api/manage/probe-tasks/{id}/refresh` | 刷新 |

> ✅ probe-tasks `/{id}`、`/{id}/enqueue`、`/{id}/refresh` **已实现**（api-fields 3 端点 implemented；原 G-10 登记已过时）。

---

## 命名与刮削

| 方法 路径 | 说明 |
|---|---|
| `GET/PUT /api/manage/naming-scrape` | 刮削设置 |
| `GET/PUT /api/manage/naming-cleanup` | 清理设置 |
| `POST /api/manage/naming-cleanup/preview` | 清理预览 |
| `POST /api/manage/naming-cleanup/replay-identify` | 重放识别 |
| `POST /api/manage/naming-scrape/batch-repair` | 批量修复 |
