# Features · 功能清单索引

> 主题必须覆盖的**功能矩阵**。每个功能落点对应一个或多个 [`../api/domains/`](../api/domains/) 端点。

---

## 先读这个

★ [**implementation-status.md**](./implementation-status.md) —— 完整实现进度（已实现/未实现/计划）。
**做主题前必读**，避免为后端还没做的功能设计界面。

---

## 顶层结构

```text
/install                            首次安装 / 恢复
/login                              登录
/                                   首页
/history                            播放历史
/libraries                          媒体库列表
/libraries/:libraryId               单库浏览
/item/:itemId                       条目详情
/play/:itemId                       播放页
/settings/{profile,playback,appearance}  个人设置
/manage/*                           管理面（manage:access）
```

详见 [routes.md](./routes.md)、[states.md](./states.md)。

---

## 子文档

### 普通用户侧

| 文档 | 范围 | 状态 |
|---|---|---|
| 见 [routes.md](./routes.md) | 首页 / 历史 / 库 / 详情 / 播放 / 设置 | ✅ |
| （人物合集页） | v1 有 `/people/:id`，v2 前端**未实现** | ⛔ |

### 管理侧

| 文档 | 范围 | 关联 API |
|---|---|---|
| [manage/mounts.md](../api/domains/manage/mounts.md) | 媒体来源（挂载 + 115 扫码 + 目录浏览） | [`api/domains/manage/mounts.md`](../api/domains/manage/mounts.md) |
| [manage/libraries.md](../api/domains/manage/libraries.md) | 媒体库 + 条目 + 探测 + 命名刮削 | [`api/domains/manage/libraries.md`](../api/domains/manage/libraries.md) |
| [manage/users.md](../api/domains/manage/users.md) | 用户 + 权限模板 + 注册码 + 积分 | [`api/domains/manage/users.md`](../api/domains/manage/users.md) |
| [manage/operations.md](../api/domains/manage/README.md) | 首页看板 + 任务中心 + 合集 + 日志 + 站点设置 | [`api/domains/manage/README.md`](../api/domains/manage/README.md) |

---

## 与 v1 契约仓库的功能差异

v2 相比 v1 契约仓库的 `features/`：

| v1 有 | v2 状态 |
|---|---|
| `browse/person-detail.md`（人物合集） | ⛔ 未实现 |
| `manage/media-reviews.md`（审核工单） | ✅ 后端已实现（`/api/manage/media-reviews` 6 端点；前端页待接） |
| `manage/upstreams.md`（上游源网关） | ✅ 后端已实现（`/api/manage/upstreams` 32 端点；前端页待接） |
| `manage/microsoft.md`（微软授权页） | ⛔ 未实现（数据面 stub） |
| `manage/pan115-imghost.md`（115 图床） | ✅ 后端已实现（`/api/manage/pan115/imghost` 8 端点；前端页待接） |
| `manage/developer-api.md`（开放 API 管理） | 🟡 `/api/admin/api-tokens` 已实现，前端页 ⛔ |
| `manage/system-about.md`（系统关于） | ⛔ 未实现 |
| `browse/login.md` 含注册 | 🟡 注册未实现 |
