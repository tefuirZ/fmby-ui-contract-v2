# API · 管理面 · Microsoft 365（授权 / 账号池 / 挂载面）

> 由清单自动生成的端点登记。**语义待人补**（何时调用 / 边界 / 错误码 / 能力门）。

---

> ⚠️ **本表由 `contracts/api-fields.json` 机械生成**（`scripts/gen-domain-docs.mjs`，可重跑）——
> 保证「端点 / 字段名」与后端 DTO 一致；**语义、边界、错误码、能力门待人补充**。
> 需要接口何时调用、失败如何分流，请连同源码一起确认后再补写。

本文件共 **35** 个端点。

### manage/microsoft

| 方法 路径 | 请求 | 响应 |
|---|---|---|
| `DELETE /api/manage/microsoft/auth/accounts/{account_id}` | `ConfirmQuery`{confirmed} | `ManageActionResultDto`{id, result, message} |
| `POST /api/manage/microsoft/auth/accounts/{account_id}/delta` | `MicrosoftDeltaRequest`{path, delta_link} | `MicrosoftDeltaResponse`{items, delta_link, next_link} |
| `POST /api/manage/microsoft/auth/accounts/{account_id}/disable` | — | `MicrosoftAuthAccountDto`{id, auth_profile_id, provider_type, tenant_id, drive_id, service_kind, oauth_client_kind, note, status, principal_id, user_principal_name, display_name, …(共20)} |
| `GET /api/manage/microsoft/auth/accounts/{account_id}/drives` | — | `MicrosoftDriveListResponse`{items} |
| `GET /api/manage/microsoft/auth/accounts/{account_id}/drives/{drive_id}/quota` | — | `MicrosoftDriveDto`{id, name, drive_type, web_url, quota} |
| `POST /api/manage/microsoft/auth/accounts/{account_id}/enable` | — | `MicrosoftAuthAccountDto`{id, auth_profile_id, provider_type, tenant_id, drive_id, service_kind, oauth_client_kind, note, status, principal_id, user_principal_name, display_name, …(共20)} |
| `POST /api/manage/microsoft/auth/accounts/{account_id}/note` | `UpdateMicrosoftAuthAccountNoteRequest`{note} | `MicrosoftAuthAccountDto`{id, auth_profile_id, provider_type, tenant_id, drive_id, service_kind, oauth_client_kind, note, status, principal_id, user_principal_name, display_name, …(共20)} |
| `POST /api/manage/microsoft/auth/accounts/{account_id}/recover` | — | `MicrosoftAuthAccountDto`{id, auth_profile_id, provider_type, tenant_id, drive_id, service_kind, oauth_client_kind, note, status, principal_id, user_principal_name, display_name, …(共20)} |
| `GET /api/manage/microsoft/auth/accounts/{account_id}/sites` | `MicrosoftSiteSearchQuery`{q} | `MicrosoftSiteListResponse`{items} |
| `GET /api/manage/microsoft/auth/accounts/{account_id}/sites/{site_id}/drives` | — | `MicrosoftDriveListResponse`{items} |
| `POST /api/manage/microsoft/auth/accounts/{account_id}/write/create-folder` | `MicrosoftCreateFolderRequest`{parent_path, name} | `MicrosoftDriveItemDto`{id, name, web_url} |
| `POST /api/manage/microsoft/auth/accounts/{account_id}/write/delete` | `MicrosoftDeleteItemRequest`{item_path} | `ManageActionResultDto`{id, result, message} |
| `POST /api/manage/microsoft/auth/accounts/{account_id}/write/move` | `MicrosoftMoveItemRequest`{item_path, target_parent_path, name} | `MicrosoftDriveItemDto`{id, name, web_url} |
| `POST /api/manage/microsoft/auth/accounts/{account_id}/write/rename` | `MicrosoftRenameItemRequest`{item_path, name} | `MicrosoftDriveItemDto`{id, name, web_url} |
| `POST /api/manage/microsoft/auth/accounts/{account_id}/write/upload-session` | `MicrosoftCreateUploadSessionRequest`{item_path, conflict_behavior} | `MicrosoftUploadSessionResponse`{upload_url, expiration_date_time} |
| `POST /api/manage/microsoft/auth/complete` | `CompleteMicrosoftAuthRequest`{authorizationId, callbackUrl} | `CompleteMicrosoftAuthResponse`{authorization_id, auth_profile_id, provider_type, tenant_id, drive_id, service_kind, status, principal_id, user_principal_name, display_name} |
| `GET /api/manage/microsoft/auth/config-status` | — | `MicrosoftAppConfigStatusResponse`{items} |
| `GET /api/manage/microsoft/auth/profiles` | `ManageMicrosoftAuthProfilesQuery`{providerType, authProfileId, accountId, tenantId, driveId, serviceKind} | `MicrosoftAuthProfilesResponse`{items} |
| `POST /api/manage/microsoft/auth/start` | `StartMicrosoftAuthRequest`{providerType, tenantId, driveId, serviceKind, oauthClient, authProfileId, note} | `StartMicrosoftAuthResponse`{authorization_id, auth_profile_id, provider_type, tenant_id, drive_id, service_kind, redirect_uri, authorize_url} |
| `POST /api/manage/microsoft/auth/token/complete` | `CompleteMicrosoftTokenAuthRequest`{authorizationId, callbackUrl} | `CompleteMicrosoftTokenAuthResponse`{authorization_id, provider_type, tenant_id, service_kind, access_token, refresh_token, expires_at, principal_id, user_principal_name, display_name, oauth_client_kind} |
| `POST /api/manage/microsoft/auth/token/drives` | `MicrosoftTokenDriveListRequest`{providerType, accessToken, refreshToken, siteId, oauthClient} | `MicrosoftDriveListResponse`{items} |
| `POST /api/manage/microsoft/auth/token/import` | `ImportMicrosoftTokenAccountRequest`{providerType, serviceKind, accessToken, refreshToken, tenantId, driveId, authProfileId, siteId, oauthClient, note} | `MicrosoftAuthAccountDto`{id, auth_profile_id, provider_type, tenant_id, drive_id, service_kind, oauth_client_kind, note, status, principal_id, user_principal_name, display_name, …(共20)} |
| `POST /api/manage/microsoft/auth/token/sites` | `MicrosoftTokenSiteSearchRequest`{providerType, accessToken, refreshToken, q, oauthClient} | `MicrosoftSiteListResponse`{items} |
| `POST /api/manage/microsoft/auth/token/start` | `StartMicrosoftTokenAuthRequest`{providerType, serviceKind, oauthClient} | `StartMicrosoftTokenAuthResponse`{authorization_id, provider_type, tenant_id, service_kind, redirect_uri, authorize_url, oauth_client_kind} |
| `GET /api/manage/microsoft/pools` | — | `MicrosoftAccountPoolsResponse`{items} |
| `POST /api/manage/microsoft/pools` | `MicrosoftCreateAccountPoolRequest`{name, description, strategy, cooldown_seconds, max_concurrent} | `MicrosoftAccountPoolResponse`{pool} |
| `DELETE /api/manage/microsoft/pools/{pool_id}` | — | `OkResponse` |
| `GET /api/manage/microsoft/pools/{pool_id}` | — | `MicrosoftAccountPoolResponse`{pool} |
| `PATCH /api/manage/microsoft/pools/{pool_id}` | `MicrosoftUpdateAccountPoolRequest`{name, description, strategy, cooldown_seconds, max_concurrent, is_enabled} | `MicrosoftAccountPoolResponse`{pool} |
| `POST /api/manage/microsoft/pools/{pool_id}/lease` | `MicrosoftLeaseRequest`{sticky_key} | `MicrosoftLeaseResponse`{pool_id, lease_id, account_id, expires_at} |
| `GET /api/manage/microsoft/pools/{pool_id}/members` | — | `MicrosoftAccountPoolMembersResponse`{items} |
| `POST /api/manage/microsoft/pools/{pool_id}/members` | `MicrosoftAddAccountPoolMemberRequest`{account_id, weight} | `MicrosoftAccountPoolMembersResponse`{items} |
| `DELETE /api/manage/microsoft/pools/{pool_id}/members/{account_id}` | — | `OkResponse` |
| `PATCH /api/manage/microsoft/pools/{pool_id}/members/{account_id}` | `MicrosoftUpdateAccountPoolMemberRequest`{weight, is_enabled} | `MicrosoftAccountPoolMembersResponse`{items} |
| `POST /api/manage/microsoft/pools/{pool_id}/report` | `MicrosoftReportRequest`{account_id, lease_id, success} | `OkResponse` |
