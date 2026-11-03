# API · 管理面 · 挂载（mounts）与 115

能力：`ManageLibrary`（删除叠加 `DangerousAction`）。

---

## 挂载端点

| 方法 路径 | 说明 |
|---|---|
| `GET /api/manage/mounts` | 列表（§列表查询参数） |
| `POST /api/manage/mounts` | 新建（Create 7 字段） |
| `GET /api/manage/mounts/{id}` | 详情（**Detail 响应形状**见下） |
| `PATCH /api/manage/mounts/{id}` | 编辑（PATCH 6 字段） |
| `DELETE /api/manage/mounts/{id}` | 删除（危险） |
| `GET /api/manage/mounts/health` | 全部挂载健康概览（**静态段注册在 `{id}` 之前**） |
| `POST /api/manage/mounts/{id}/probe` | 探测连通性（不落状态） |
| `POST /api/manage/mounts/{id}/validate` | 校验配置有效性 |
| `POST /api/manage/mounts/{id}/verify` | 校验可访问性 |
| `POST /api/manage/mounts/{id}/refresh-access` | 刷新访问凭据（115/139 等需 token 的 provider） |
| `POST /api/manage/mounts/batch/refresh-abnormal` | 批量刷新异常挂载 |
| `POST /api/manage/mounts/{id}/scan` | 触发扫描 |
| `GET /api/manage/mounts/{id}/scan` | 查询扫描进度 |
| `POST /api/manage/mounts/browse-directories` | 目录浏览（§目录浏览三分支） |
| `GET /api/manage/mounts/{id}/libraries` | 已绑定媒体库 |
| `POST /api/manage/mounts/{id}/libraries` | 绑定库 |
| `DELETE /api/manage/mounts/{id}/libraries/{library_id}` | 解绑 |
| `POST /api/manage/source-availability/{id}/recover` | 恢复来源可用性（`{id}` 为 `mount:library` 复合键） |

---

## Detail 响应形状

`GET /api/manage/mounts/{id}`（Create / PATCH 亦返回同形）：

```jsonc
{
  "mount": { "...": "嵌套挂载实体" },
  // 以下字段在顶层**平铺**，与 mount.* 同值（历史兼容，双写）
  "provider_type": "Local",
  "root_path": "/data",
  "config_json": { "...": "..." },
  "capability_state": { "...": "..." },
  "path_policies": [ "..." ],
  "linked_sources": [ "..." ],
  "recent_scan_tasks": [ "..." ],
  "credential_status": "bound"
}
```

> **嵌套 `mount` 与顶层平铺同名并存**是既定 wire 形态（e2e 断言两者同值）。
> 新代码请优先读 `mount.*`。

### `credential_status` 四态（派生，非存储）

| 值 | 条件 |
|---|---|
| `not_required` | provider 为 `Local` 等无需凭据者 |
| `unbound` | 需要凭据但挂载未绑定 |
| `expired` | 已绑定且 `expires_at <= now` |
| `bound` | 已绑定且未过期（无 per-mount 统一过期源时**诚实降级**为 `bound`） |

> 列表 / Detail 顶层 / `mount.credential_status` 三处**同源同值**。
> ⚠️ 判定只认 `mount.config_json` 里的 `__sealed:` 引用——凭据密文实际存于 settings KV，
> 绑定动作必须同时写入该引用，否则 UI 会恒显示「未绑定」。

---

## 列表查询参数

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

> `Pan115` / `Yun139` 等云端 provider 的 `root_path` 允许为空（装配时回落 `/`）。

## PATCH 6 字段

即上表**去掉 `provider_type`**。`provider_type` 是不可变身份字段，载荷携带即反序列化层拒绝。
全字段缺省 → 400（不静默 no-op）。

**响应**：Create / PATCH 均返回**挂载 Detail 全量**（见上）。

---

## 目录浏览（三分支）

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

错误：400 / 401 / 403（受 license 功能门）/ 404 / 503。

> 真实 115 账号的网络往返（列目录/直链播放）**只在你自己的环境 + 真账号**下测得，
> 见 [`../../../features/implementation-status.md`](../../../features/implementation-status.md) §需人工验收。

## 115 图床（imghost）

| 方法 路径 | 说明 |
|---|---|
| `POST /api/manage/pan115/imghost/qr-login` | 图床账号扫码 |
| `GET /api/manage/pan115/imghost/qr-status` | 扫码状态 |
| `POST /api/manage/pan115/imghost/activate` | 激活图床账号 |
| `GET /api/manage/pan115/imghost/credentials` | 凭据状态（掩码） |
| `DELETE /api/manage/pan115/imghost/credentials` | 清除凭据 |
| `POST /api/manage/pan115/imghost/upload` | 上传图片 |
| `GET /api/manage/pan115/imghost/assets` | 资产列表 |
| `GET /api/manage/pan115/imghost/raw/{sha1}` | 取原图 |
| `GET /api/manage/pan115/imghost/_debug/permanent-url/{sha1}` | **调试**：永久直链 |
| `GET /api/manage/pan115/imghost/_debug/final-url/{sha1}` | **调试**：最终直链 |

> 服务**未装配**时图床族 fail-closed 返回 **404**（与同族其余端点的 503 不一致，属既有一致性欠账）。

## 115 同步

| 方法 路径 | 说明 |
|---|---|
| `GET /api/manage/pan115/sync/mounts/{mount_id}` | 同步状态 |
| `POST /api/manage/pan115/sync/mounts/{mount_id}/enqueue` | 入队同步 |

> 响应字段为 **camelCase**（`mountId` / `providerType` / `supportedActions`）——
> manage 面其余端点均为 snake_case，这是**例外**。

## 115 分享挂载（share-mounts）

| 方法 路径 | 说明 |
|---|---|
| `POST /api/manage/pan115/share-mounts/{mount_id}/qr-login` | 分享账号扫码 |
| `GET /api/manage/pan115/share-mounts/{mount_id}/qr-status` | 扫码状态 |
| `POST /api/manage/pan115/share-mounts/{mount_id}/activate` | 激活 |
| `GET /api/manage/pan115/share-mounts/{mount_id}/credentials` | 凭据状态 |
| `DELETE /api/manage/pan115/share-mounts/{mount_id}/credentials` | 清除凭据 |

## 115 分享浏览 / 预览

| 方法 路径 | 说明 |
|---|---|
| `POST /api/manage/pan115/share-items/browse` | 匿名浏览分享目录 |
| `POST /api/manage/pan115/share-download-preview/qr-login` | 下载用分享账号扫码 |
| `GET /api/manage/pan115/share-download-preview/qr-status` | 扫码状态 |
| `POST /api/manage/pan115/share-download-preview/create` | 创建分享下载预览 |
| `POST /api/manage/pan115/previews` | 创建**自有网盘**预览会话（V1 字面路径） |
| `POST /api/manage/pan115/previews/{preview_id}/browse` | 用预览凭据浏览 |

## 115 分享记录

| 方法 路径 | 说明 |
|---|---|
| `GET /api/manage/pan115/shares` | 分享记录列表 |
| `POST /api/manage/pan115/shares` | 创建分享记录 |
| `PATCH /api/manage/pan115/shares/{id}` | 改提取码等 |
| `POST /api/manage/pan115/shares/{id}/cancel` | 取消分享 |
