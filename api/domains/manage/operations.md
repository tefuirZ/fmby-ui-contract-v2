# API · 管理面 · 运维面（任务 / 事件 / 运行日志 / 探测）

> 由清单自动生成的端点登记。**语义待人补**（何时调用 / 边界 / 错误码 / 能力门）。

---

> ⚠️ **本表由 `contracts/api-fields.json` 机械生成**（`scripts/gen-domain-docs.mjs`，可重跑）——
> 保证「端点 / 字段名」与后端 DTO 一致；**语义、边界、错误码、能力门待人补充**。
> 需要接口何时调用、失败如何分流，请连同源码一起确认后再补写。

本文件共 **22** 个端点。

### manage/operations

| 方法 路径 | 请求 | 响应 |
|---|---|---|
| `GET /api/manage/operations/data-sources/load` | — | `ManageDataSourceLoadResponse`{sampledAt, cacheStatus, items} |
| `GET /api/manage/operations/media-reprocess` | `MediaReprocessListQuery`{limit} | `MediaReprocessTaskDto`{id, scope_library_id, mode, status, cursor_media_item_id, cursor_source_id, batch_size, stats, requested_by_user_id, lease_owner, lease_token, lease_expires_at, …(共18)} |
| `POST /api/manage/operations/media-reprocess` | `MediaReprocessCreateRequest`{mode, library_id, batch_size, confirm_action, session_confirmation, current_password} | `MediaReprocessTaskDto`{id, scope_library_id, mode, status, cursor_media_item_id, cursor_source_id, batch_size, stats, requested_by_user_id, lease_owner, lease_token, lease_expires_at, …(共18)} |
| `GET /api/manage/operations/media-reprocess/{id}` | — | `MediaReprocessTaskDto`{id, scope_library_id, mode, status, cursor_media_item_id, cursor_source_id, batch_size, stats, requested_by_user_id, lease_owner, lease_token, lease_expires_at, …(共18)} |
| `POST /api/manage/operations/media-reprocess/{id}/cancel` | — | `Value` |
| `POST /api/manage/operations/media-reprocess/{id}/resume` | — | `MediaReprocessTaskDto`{id, scope_library_id, mode, status, cursor_media_item_id, cursor_source_id, batch_size, stats, requested_by_user_id, lease_owner, lease_token, lease_expires_at, …(共18)} |
| `GET /api/manage/operations/media-visibility-governance` | — | `GovernanceTaskDto`{id, mode, status, restoreFromTaskId, cursorMediaItemId, batchSize, policyVersion, stats, requestedByUserId, leaseOwner, leaseToken, leaseExpiresAt, …(共18)} |
| `POST /api/manage/operations/media-visibility-governance` | `GovernanceCreateRequest`{mode, batchSize, policyVersion, restoreFromTaskId} | `GovernanceTaskDto`{id, mode, status, restoreFromTaskId, cursorMediaItemId, batchSize, policyVersion, stats, requestedByUserId, leaseOwner, leaseToken, leaseExpiresAt, …(共18)} |
| `GET /api/manage/operations/media-visibility-governance/{taskId}` | — | `GovernanceTaskDto`{id, mode, status, restoreFromTaskId, cursorMediaItemId, batchSize, policyVersion, stats, requestedByUserId, leaseOwner, leaseToken, leaseExpiresAt, …(共18)} |
| `POST /api/manage/operations/media-visibility-governance/{taskId}/cancel` | — | `GovernanceCancelResponse`{cancelled} |
| `GET /api/manage/operations/overview` | `OperationsOverviewRequest`{days} | `Value` |
| `GET /api/manage/operations/playback/active` | `ActivePlaybackRequest`{limit} | `ManageActivePlaybackResponse`{sampledAt, cacheStatus, limit, totalReturned, sessions} |
| `GET /api/manage/operations/runtime` | — | `ManageRuntimeObservabilityResponse`{sampledAt, processHostCacheStatus, redisCacheStatus, startupLatencyCacheStatus, workerHealthCacheStatus, process, host, pgPool, runtimeThreads, databasePools, workloadGovernor, redis, …(共14)} |

### manage/events

| 方法 路径 | 请求 | 响应 |
|---|---|---|
| `GET /api/manage/events` | `EventsListRequest`{kind, requestId, actor, action, search, page, pageSize} | `Value` |
| `GET /api/manage/events/{request_id}` | — | `Value` |

### manage/system

| 方法 路径 | 请求 | 响应 |
|---|---|---|
| `GET /api/manage/system/about` | — | `SystemAboutResponse`{generated_at, app, links, runtime, dependencies, warnings} |
| `GET /api/manage/system/storage-footprint` | — | `StorageFootprintResponse`{backend, supported, reason, generated_at, postgres, file_search} |

### manage/runtime-log-archives

| 方法 路径 | 请求 | 响应 |
|---|---|---|
| `GET /api/manage/runtime-log-archives` | `RuntimeLogArchivesQuery`{page, pageSize} | `ManagedRuntimeLogArchivesResponse`{items, total, log_dir, retention_days} |
| `GET /api/manage/runtime-log-archives/{archiveId}/download` | — | — |

### manage/scans

| 方法 路径 | 请求 | 响应 |
|---|---|---|
| `GET /api/manage/scans` | `ScanListRequest`{status, taskType, libraryId, mountId, librarySourceId, page, size} | `ScanTaskListResponse`{items, total, page, size} |

### manage/cdn-probe

| 方法 路径 | 请求 | 响应 |
|---|---|---|
| `GET /api/manage/cdn-probe/status` | — | `Value` |

### manage/runtime-logs

| 方法 路径 | 请求 | 响应 |
|---|---|---|
| `GET /api/manage/runtime-logs/export` | `RuntimeLogsQuery`{page, pageSize, level, target, search, method, path, client, ip, user, requestId, all, …(共15)} | — |
