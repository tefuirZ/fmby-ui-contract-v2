# API · 管理面 · 挂载（mounts）与 115

能力：`ManageLibrary`（删除叠加 `DangerousAction`）。

---

## 挂载端点

| 方法 路径 | 说明 |
|---|---|
| `GET /api/manage/mounts` | 列表（§10 查询参数） |
| `POST /api/manage/mounts` | 新建（Create 7 字段） |
| `GET /api/manage/mounts/{id}` | 详情（Detail 全量） |
| `PATCH /api/manage/mounts/{id}` | 编辑（PATCH 6 字段） |
| `DELETE /api/manage/mounts/{id}` | 删除（危险） |
| `POST /api/manage/mounts/{id}/verify` | 校验可访问性 |
| `POST /api/manage/mounts/browse-directories` | 目录浏览（契约 §9 三分支） |
| `GET /api/manage/mounts/{id}/libraries` | 已绑定媒体库 |
| `POST /api/manage/mounts/{id}/libraries` | 绑定库 |
| `DELETE /api/manage/mounts/{id}/libraries/{library_id}` | 解绑 |
| `POST /api/manage/source-availability/{id}/recover` | 恢复来源可用性 |

---

## 列表查询参数（契约 §10）

⚠️ **主名为 `camelCase`**（snake_case 为兼容别名，双收）：

| 参数 | 别名 | 说明 |
|---|---|---|
| `page` | — | 页码 |
| `pageSize` | `page_size` | 每页条数（默认 20） |
| `search` | — | 搜索词 |
| `healthStatus` | `health_status` | 健康状态过滤 |
| `providerType` | `provider_type` | provider 类型过滤 |
| `libraryId` | `library_id` | 按库过滤 |

> 这是 v2 里**唯一**用 camelCase 主名的列表端点（P-MOUNTS-QUERY-01 修复）。
> 其余端点查询参数都是 snake_case。

---

## Provider 类型（14 种，canonical 值）

| canonical | 中文 label | 可新建 | 目录浏览 |
|---|---|---|---|
| `Local` | 本地文件系统 | ✅ | ✅ |
| `AList` | AList | ✅ | ✅ |
| `OpenList` | OpenList | ✅ | ✅ |
| `RcloneRc` | Rclone RC | ✅ | ✅ |
| `MicrosoftGlobal` | Microsoft 365（国际版） | ✅ | ✅ |
| `MicrosoftChina` | Microsoft 365（世纪互联版） | ✅ | ✅ |
| `P115` | P115 | ✅ | ✅（专用 API） |
| `Pan115` | 115 网盘 | ✅ | ✅（专用 API） |
| `Pan115Share` | 115 分享 | ✅ | ✅ |
| `Yun139` | 139 云盘 | ✅ | ✅ |
| `Yun139Share` | 139 分享 | ✅ | ✅ |
| `WebDAV` | WebDAV | ⛔ 历史预留 | ⛔ |
| `S3Compatible` | S3 兼容存储 | ⛔ 历史预留 | ⛔ |
| `UpstreamBridge` | 上游桥接 | ⛔ 系统内部 | ⛔ |

别名：解析时 trim + 去 `_`/`-`/空格 + 小写（如 `microsoft_global` 等）。未命中 400（fail-closed）。

---

## Create 7 字段

`POST /api/manage/mounts`（`deny_unknown_fields`，未知字段 400；旧名 `mount_type` 已废弃）：

| 字段 | 类型 | 必填 | 默认 | 校验 |
|---|---|---|---|---|
| `name` | string | ✅ | — | 非空、trim 非空、≤128 |
| `provider_type` | string | ✅ | — | canonical 或别名；禁建 3 → 400 |
| `root_path` | string | ✅ | — | 四分支（见下），≤1024 |
| `config_json` | object | ❌ | `{}` | 必须 object；敏感键值必须 `__sealed:` 引用 |
| `status` | string | ❌ | `configured` | 四态 `configured`/`unavailable`/`maintenance`/`verified` |
| `capabilities` | object(5 bool) | ❌ | provider 默认矩阵 | 提供即显式覆盖 |
| `path_policies` | array | ❌ | `[]` | `{id?, path_prefix?(≤512), priority, max_concurrent_streams?}`；整表替换 |

**`root_path` 四分支**：

- `Local`：必须绝对路径
- `AList` / `OpenList` / `RcloneRc`：禁 `..` 段
- `Pan115Share` / `Yun139Share`：归一 `/`
- 其余：trim

## PATCH 6 字段

即上表**去掉 `provider_type`**。`provider_type` 是不可变身份字段，载荷携带即反序列化层拒绝。
全字段缺省 → 400（不静默 no-op）。

**响应**：Create / PATCH 均返回**挂载 Detail 全量**。

---

## 目录浏览（契约 §9.1 三分支）

`POST /api/manage/mounts/browse-directories`

请求：`{provider_type, config_json?, mount_id?, preview_id?, root_path?, path?}`

响应：`{current_path, parent_path?, directories: [{name, path}]}`

| 分支 | 条件 | 行为 |
|---|---|---|
| 1 | 有存量 `mount_id` | 按该挂载配置列举 |
| 2 | 创建态 + 非 115 原生 | 可无 `preview_id` |
| 3 | 创建态 + `P115`/`Pan115` | **必须** `preview_id`，否则拒绝 |

错误：400（非法）/ 503。

> ⚠️ 当前 provider runtime 注入**部分完成**（P2-06-R5 在途）：未注入时 fail-closed 显式失败，
> **不伪装空目录**。

---

## 115 账号（Pan115）

| 方法 路径 | 说明 |
|---|---|
| `POST /api/manage/pan115/qr-login` | 发起扫码 → `{session_id, uid, qr_url, qr_image}` |
| `GET /api/manage/pan115/qr-status` | `?session_id=` → `{status}` |
| `POST /api/manage/pan115/activate` | `{session_id, mount_id, cookie_app, cookie_header}` |
| `GET /api/manage/pan115/accounts/{mount_id}` | 账号档案（uid/has_cookie/has_open_token/时间） |
| `POST /api/manage/pan115/accounts/{mount_id}/refresh` | 刷新 open token |
| `POST /api/manage/pan115/accounts/{mount_id}/health` | `Pan115HealthReport{ok, reason\|null}` |
| `POST /api/manage/pan115/accounts/{mount_id}/browse` | `{path?}` → 目录列举 |
| `DELETE /api/manage/pan115/accounts/{mount_id}` | 解绑 |

错误：400 / 401 / 404 / 503。

> 真实 115 账号的网络往返（列目录/直链播放）**只在你自己的环境 + 真账号**下测得，
> 见 [`../../../features/implementation-status.md`](../../../features/implementation-status.md) §需人工验收。
