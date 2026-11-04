# API · 管理面 · admin 面（CAS / 资产下载）

> 由清单自动生成的端点登记。**语义待人补**（何时调用 / 边界 / 错误码 / 能力门）。

---

> ⚠️ **本表由 `contracts/api-fields.json` 机械生成**（`scripts/gen-domain-docs.mjs`，可重跑）——
> 保证「端点 / 字段名」与后端 DTO 一致；**语义、边界、错误码、能力门待人补充**。
> 需要接口何时调用、失败如何分流，请连同源码一起确认后再补写。

本文件共 **10** 个端点。

### admin/cas

| 方法 路径 | 请求 | 响应 |
|---|---|---|
| `GET /api/admin/cas/contents` | `CasContentsQuery`{page, pageSize, sort} | `CasContentListItemDto`{content_id, fingerprint, media_item_id, drives, has_local_entity, source_kind, lease, deferred_gate, grace_remaining_ms, updated_at} |
| `GET /api/admin/cas/drives` | — | `CasDriveConfigDto`{provider_type, drive_ref, enabled, priority} |
| `PUT /api/admin/cas/drives` | `UpsertCasDriveConfigRequest`{provider_type, drive_ref, enabled, priority} | `CasDriveConfigDto`{provider_type, drive_ref, enabled, priority} |
| `GET /api/admin/cas/fanout/{content_id}` | — | `CasFanoutStatusDto`{content_id, drives, deferred} |
| `POST /api/admin/cas/fanout/{content_id}/drives/{drive_id}/retry` | `ConfirmQuery`{confirmed} | `CasRetryCopyDto`{drive_id, copy_state, reason_code, reason_detail} |
| `POST /api/admin/cas/fanout/{content_id}/trigger` | `ConfirmQuery`{confirmed} | `CasFanoutTriggerResultDto`{content_id, drives, summary, status} |
| `GET /api/admin/cas/reconcile` | — | `CasReconcileReportDto`{report_id, source, identified, reconciled, generated_at_ms} |
| `POST /api/admin/cas/reconcile/trigger` | `ConfirmQuery`{confirmed} | `CasReconcileTriggerDto`{task_id, created} |

### admin/asset

| 方法 路径 | 请求 | 响应 |
|---|---|---|
| `GET /api/admin/asset/download-tasks` | `WaitingReviewQuery`{offset, limit} | `AssetDownloadTaskDto`{id, variant_ref, state, retry_count} |
| `POST /api/admin/asset/download-tasks/{id}/requeue` | `ConfirmQuery`{confirmed} | `AssetRequeueResultDto`{id, changed} |
