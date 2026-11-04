# API · 管理面 · 上游源（Upstream 接入 / 映射 / Apple CMS）

> 由清单自动生成的端点登记。**语义待人补**（何时调用 / 边界 / 错误码 / 能力门）。

---

> ⚠️ **本表由 `contracts/api-fields.json` 机械生成**（`scripts/gen-domain-docs.mjs`，可重跑）——
> 保证「端点 / 字段名」与后端 DTO 一致；**语义、边界、错误码、能力门待人补充**。
> 需要接口何时调用、失败如何分流，请连同源码一起确认后再补写。

本文件共 **23** 个端点。

### manage/upstreams

| 方法 路径 | 请求 | 响应 |
|---|---|---|
| `GET /api/manage/upstreams` | `UpstreamSourceListQuery`{sourceType, status} | `UpstreamSourceListDto`{items, total} |
| `POST /api/manage/upstreams` | `UpstreamSourceWriteDto`{name, sourceType, baseUrl, authMethod, username, password, apiKey, userAgent, referer, extraHeaders, retainSecret, enabled} | `UpstreamSourceDto`{id, name, source_type, source_type_label, base_url, auth_method, status, username, user_agent, referer, extra_headers, has_secret, …(共19)} |
| `DELETE /api/manage/upstreams/{id}` | — | `UpstreamOkDto`{ok} |
| `GET /api/manage/upstreams/{id}` | — | `UpstreamSourceDto`{id, name, source_type, source_type_label, base_url, auth_method, status, username, user_agent, referer, extra_headers, has_secret, …(共19)} |
| `PATCH /api/manage/upstreams/{id}` | `UpstreamSourceWriteDto`{name, sourceType, baseUrl, authMethod, username, password, apiKey, userAgent, referer, extraHeaders, retainSecret, enabled} | `UpstreamSourceDto`{id, name, source_type, source_type_label, base_url, auth_method, status, username, user_agent, referer, extra_headers, has_secret, …(共19)} |
| `GET /api/manage/upstreams/{id}/apple-cms/categories` | — | `UpstreamCategoryListDto`{items, total} |
| `PUT /api/manage/upstreams/{id}/apple-cms/category-bindings` | `UpstreamCategoryBindingsWriteDto`{bindings} | `UpstreamCategoryListDto`{items, total} |
| `POST /api/manage/upstreams/{id}/apple-cms/discover-categories` | — | `UpstreamCategoryListDto`{items, total} |
| `POST /api/manage/upstreams/{id}/apple-cms/sync` | `UpstreamAppleCmsSyncRequest`{categoryId, pageSize, workerCount} | `UpstreamAppleCmsSyncDto`{source_id, page_size, worker_count, category_count, discovered_category_count, bound_category_count, skipped_unbound_category_count, imported_item_count, imported_variant_count, categories, skipped_unbound_categories, synced_at} |
| `POST /api/manage/upstreams/{id}/apple-cms/sync-page` | `UpstreamAppleCmsSyncPageRequest`{categoryId, page, pageSize} | `UpstreamAppleCmsSyncPageDto`{source_id, category_id, library_id, page, page_count, total, imported_item_count, imported_variant_count, synced_at} |
| `GET /api/manage/upstreams/{id}/bindings` | `BindingListQuery`{libraryId} | `UpstreamCategoryListDto`{items, total} |
| `POST /api/manage/upstreams/{id}/disable` | — | `UpstreamSourceDto`{id, name, source_type, source_type_label, base_url, auth_method, status, username, user_agent, referer, extra_headers, has_secret, …(共19)} |
| `POST /api/manage/upstreams/{id}/enable` | — | `UpstreamSourceDto`{id, name, source_type, source_type_label, base_url, auth_method, status, username, user_agent, referer, extra_headers, has_secret, …(共19)} |
| `POST /api/manage/upstreams/{id}/health-check` | — | `CredentialHealthDto`{ok, reason} |
| `POST /api/manage/upstreams/{id}/mapping/apply` | `UpstreamMappingApplyDto`{preview, savePresetName} | `UpstreamMappingApplyResultDto`{source_id, created_library_count, bound_category_count, submitted_sync_job_count, sync_jobs, preset} |
| `GET /api/manage/upstreams/{id}/mapping/presets` | — | `UpstreamMappingPresetListDto`{items, total} |
| `POST /api/manage/upstreams/{id}/mapping/presets` | `UpstreamMappingPresetWriteDto`{name, includeKeywords, excludeKeywords, includeCategoryIds, excludeCategoryIds, defaultLibraryType, createMissingLibraries, enabled} | `UpstreamMappingPresetDto`{id, source_id, name, include_keywords, exclude_keywords, include_category_ids, exclude_category_ids, default_library_type, create_missing_libraries, enabled, created_by, created_at, …(共13)} |
| `DELETE /api/manage/upstreams/{id}/mapping/presets/{preset_id}` | — | — |
| `PUT /api/manage/upstreams/{id}/mapping/presets/{preset_id}` | `UpstreamMappingPresetWriteDto`{name, includeKeywords, excludeKeywords, includeCategoryIds, excludeCategoryIds, defaultLibraryType, createMissingLibraries, enabled} | `UpstreamMappingPresetDto`{id, source_id, name, include_keywords, exclude_keywords, include_category_ids, exclude_category_ids, default_library_type, create_missing_libraries, enabled, created_by, created_at, …(共13)} |
| `POST /api/manage/upstreams/{id}/mapping/preview` | `UpstreamMappingPreviewDto`{presetId, includeKeywords, excludeKeywords, includeCategoryIds, excludeCategoryIds, selectedCategoryIds, defaultLibraryType, createMissingLibraries, overrides} | `UpstreamMappingPreviewResultDto`{source_id, items, creates, bind_count, create_count, skip_count, conflict_count} |
| `GET /api/manage/upstreams/{id}/sync-jobs` | — | `UpstreamSyncJobListDto`{items, total} |
| `GET /api/manage/upstreams/{id}/sync-jobs/{job_id}` | — | `UpstreamSyncJobDto`{id, source_id, job_kind, status, category_ids, page_size, worker_count, result_summary, last_error_message, attempt_count, max_attempts, created_by, …(共16)} |
| `GET /api/manage/upstreams/health` | `UpstreamHealthQuery`{status} | `UpstreamHealthListDto`{items, total} |
