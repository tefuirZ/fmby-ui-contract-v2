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
| `GET /api/manage/media-items/{id}/pipeline` | 处理管道 → `RawManagedMediaItemPipelineRecord` |

> 前端契约里出现的 `/{id}/artwork`、`/{id}/metadata`、`/{id}/scrape`、`/{id}/scan`、
> ✅ 原记「子资源端点尚未实现（G-05）」**已过时**：`/{id}/artwork`、`/{id}/metadata`、`/{id}/scrape`、`/{id}/scan`、`/{id}/subtitles`、`/{id}/sources/{id}` 等**已实现**（api-fields `/api/manage/media-items` 23 端点）。

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
