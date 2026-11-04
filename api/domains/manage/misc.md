# API · 管理面 · 其他（迁移 / 开发者 / 高级动作 / 密钥 / 积分等）

> 由清单自动生成的端点登记。**语义待人补**（何时调用 / 边界 / 错误码 / 能力门）。

---

> ⚠️ **本表由 `contracts/api-fields.json` 机械生成**（`scripts/gen-domain-docs.mjs`，可重跑）——
> 保证「端点 / 字段名」与后端 DTO 一致；**语义、边界、错误码、能力门待人补充**。
> 需要接口何时调用、失败如何分流，请连同源码一起确认后再补写。

本文件共 **21** 个端点。

### rewards

| 方法 路径 | 请求 | 响应 |
|---|---|---|
| `POST /api/rewards/checkins` | `CheckinRequest`{source} | `RewardsCheckinResultDto`{created, awarded_points, checkin_date, streak_days, total_checkin_days, status, checked_in_at} |
| `GET /api/rewards/me` | — | `RewardsMySummaryDto`{user_id, account, total_checkin_days, current_streak_days, latest_ledger} |
| `POST /api/rewards/media-requests` | `MediaRequestCreateRequest`{idempotencyKey, media_type, title, year, externalId, requestNote} | `MediaRequestCreateResponse`{mediaRequest, quota, created} |
| `POST /api/rewards/media-requests/{requestId}/cancel` | — | `MediaRequestTransitionResponse`{mediaRequest, quota, applied} |
| `GET /api/rewards/media-requests/quota` | — | `MediaRequestQuotaLedgerDto`{deltaAvailable, deltaReserved, transactionType, sourceType, sourceId, createdAt} |
| `POST /api/rewards/redemptions/media-request-credits` | `RedeemBody`{idempotency_key, quantity} | `RewardsRedemptionResultDto`{id, idempotency_key, applied, redemption_type, quantity, points_spent, rule_version, created_at, balance, valid_until_after} |
| `POST /api/rewards/redemptions/server-days` | `RedeemBody`{idempotency_key, quantity} | `RewardsRedemptionResultDto`{id, idempotency_key, applied, redemption_type, quantity, points_spent, rule_version, created_at, balance, valid_until_after} |
| `GET /api/rewards/rule` | — | `RewardsRuleVersionDto`{id, version, status, created_by, created_at, published_at, config} |

### manage/migration

| 方法 路径 | 请求 | 响应 |
|---|---|---|
| `GET /api/manage/migration/export` | — | `MigrationExportResponse`{entries} |
| `POST /api/manage/migration/export` | `ExportMigrationRequest`{security_code, selection} | `ExportMigrationResponse`{envelope} |
| `POST /api/manage/migration/import` | `ImportMigrationRequest`{security_code, envelope} | `ImportMigrationResponse`{report} |
| `GET /api/manage/migration/inspect` | — | `MigrationInspectResponse`{count, currentVersion, entries} |
| `POST /api/manage/migration/inspect` | `InspectMigrationRequest`{security_code, envelope} | `InspectMigrationResponse`{snapshot, conflicts} |

### manage/developer

| 方法 路径 | 请求 | 响应 |
|---|---|---|
| `GET /api/manage/developer/api-tokens` | — | `DeveloperApiTokenListResponse`{items} |
| `POST /api/manage/developer/api-tokens/{tokenId}/revoke` | `RevokeDeveloperApiTokenRequest`{reason} | `DeveloperApiTokenDto`{id, name, scopes, created_at} |
| `GET /api/manage/developer/endpoints` | `DeveloperApiCatalogRequest`{method, scope, q, page, pageSize} | `Value` |
| `GET /api/manage/developer/subjects` | `DeveloperApiSubjectQuery`{q, page, pageSize} | `DeveloperApiSubjectListResponse`{items, total} |

### manage/advanced

| 方法 路径 | 请求 | 响应 |
|---|---|---|
| `GET /api/manage/advanced` | — | `ManageAdvancedResponse`{refreshed_at, database, security, settings} |
| `POST /api/manage/advanced/actions/{action}` | `ConfirmQuery`{confirmed} | `AdvancedActionExecutedDto`{action, result, deleted_sessions, retained_revoked_expired_sessions, refreshed_at, message} |

### manage/login-risk

| 方法 路径 | 请求 | 响应 |
|---|---|---|
| `POST /api/manage/login-risk/ip/reset` | `ResetIpLoginRiskRequest`{ip_address} | `ManageActionResultDto`{id, result, message} |

### manage/secrets

| 方法 路径 | 请求 | 响应 |
|---|---|---|
| `POST /api/manage/secrets/test` | `SecretsTestRequest`{service} | `SecretsTestResponseDto`{ok, reason, latency_ms} |
