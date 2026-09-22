# Features · 实现进度全表

> ★ **这是本仓库最重要的文件**。它回答一个问题：**v2 到底已经做了什么、还没做什么。**
>
> - 基线：**v0.1.122**（2026-09-18 G 表全量复核；后端端点 307、契约闸 PASS）
> - G 表核对方法：api-fields.json（307 端点）× 主仓 routes grep 双证；前端侧以 fmby-web main（含 origin/main）源码为准；引用文件:行见各行标注
> - 数据来源：主仓 `docs/plans/v2-dev/BOARD.md`（全量任务卡）+ 前后端端点对账（代码实测）
> - 状态图例：✅ 已实现 ｜ 🟡 部分实现 ｜ ⛔ 未实现（已规划）｜ ⚪ v1 有 / v2 暂未对齐 ｜ 🔬 需真机真账号验收
>
> **做主题前先读它**，避免为「后端还没做」的功能设计界面。

---

## 一、按里程碑看全局

| 里程碑 | 内容 | 状态 |
|---|---|---|
| M1 可安装可登录 | 安装引导、登录、鉴权链、worker 基建 | 🟡 基本完成（P1-07 时钟/Clock 端口 review 中） |
| M2 可挂载可播放 | 存储数据面、挂载契约、115/139/微软 provider | ✅ 已闭环（mounts 收尾 P2-06-R5 在途） |
| M3 完整核心 | 扫描→识别→刮削→浏览→检索 全链路 | ✅ 已闭环（含 AI 兜底） |
| M4 双后端 + 迁移 | PG + SQLite 双库、迁移引擎、性能基线 | ✅ 全卡收口 |
| M5 全功能发布 | 周边模块（license/telegram/rewards/collections）+ P7 验收 | 🟡 收尾中（P7-01/05、P-PERF-30W 在途） |

---

## 二、已实现功能（✅）

### 后端核心链路

| 域 | 内容 |
|---|---|
| 存储 | 14 种 provider 类型（Local/AList/OpenList/RcloneRc/微软双版/115 系/139 系）；StorageProvider 六端口下沉 |
| 扫描 | 本地 + 远端挂载扫描、checkpoint 崩溃恢复、批量 pop 摊薄写放大 |
| 识别 | 命名解析（fmby-naming）+ 识别（fmby-recognize）+ TMDB/豆瓣 provider + AI 兜底（防注入） |
| 刮削 | 刮削 worker 生产装配；元数据底座（genres/studios/person↔node 物理列 + 填充管线） |
| 资产 | 资产 repo / 下载 worker / HTTP 数据面 / GC 周期清扫 |
| 检索 | tantivy 索引 + 索引 worker；30w 规模目标（压测待做） |
| 播放 | 302 重定向 / Range / target cache；播放会话（progress/heartbeat/stop） |
| 双库 | PG + SQLite 同语义、参数化契约测试、迁移体系 `sqlx::migrate!`、旧库迁移桥 |
| 并发治理 | supervisor + governor（三门 + 熔断）；前台压力采样接线（P2-C6-WIRING） |
| 鉴权 | CSRF 双匹配、能力（8 项）、TOTP、会话、阶梯锁定 + IP 限流、可信代理白名单 |
| 密钥 | SecretBox 加密、三层回退（含 XOR 混淆内置层）、密钥链管理面、误提交门禁 |
| 三方身份 | Google/Telegram/Email/GitHub/OIDC 绑定自服务（P-AUTH-01） |
| 兼容 | Emby/Jellyfin 双前缀 102 路由 + WS |
| 开放 API | `/api/v1/*` 7 端点 + API Token（scope + 审计） |
| License | 协议基建 + 持久层 + 服务装配 + heartbeat worker + 功能门 gate |
| Telegram | bot 数据面 + 传输/命令面 + 仓储收编 + 管理面配置 |
| 周边 | rewards（积分签到）+ collections（收藏合集） |
| 运维 | 审计日志、运行日志、会话管理、任务中心、GC 墓碑 |

### 前端页面（已实现）

| 用户侧 | 管理侧 | 设置 |
|---|---|---|
| 首页、历史、库列表、库详情、条目详情、播放页、登录、安装 | 首页看板、任务中心、添加媒体、条目、条目详情、媒体库、来源、探测任务、命名刮削、合集、注册码、用户、权限模板、积分、会话、审计日志、运行日志、站点设置、授权、Telegram、密钥链、高级维护 | 资料、播放、外观 |

### 主题机制

| 项 | 状态 |
|---|---|
| ThemeManifest 协议 | ✅ 冻结 |
| 加载契约（零阻塞 + 懒 import） | ✅ |
| 主题注册表 | ✅ |
| 内置主题 `darkroom` | ✅ 默认，完整 |
| 内置主题 `template` | ✅ 骨架 |
| tokens 热替换 | ✅ |
| 主题选择**跨端持久化** | 🟡 部分：appearance KV 已持久化但 theme 值域不含皮肤 manifest id（见 G-01） |

---

## 三、⛔ 未实现 / 🟡 部分实现（**重点**）

### A. 前后端不一致（历史清单 G-01..G-17）— 2026-09-18 全量复核版

> 复核方法：api-fields.json 307 端点（implemented 状态）× 主仓 routes grep 双证；
> 前端侧以 fmby-web main（origin/main）源码为准。历史「41 条」为 v0.1.105 期快照，
> 其中大量项已随后续卡落地，逐条状态见下表。

#### A1. ★多主题相关（做多主题必须先解决）

| # | 问题 | 状态（2026-09-18 核对） | 影响 |
|---|---|---|---|
| **G-01** 🟡 | 用户所选**主题 id** 跨端持久化 | 🟡 **部分**：`PUT /api/settings/user/appearance` 已实现（routes/settings.rs:111；bridges/settings.rs:199-240 KV `user.appearance.{user_id}`），但 `theme` 值域硬限 `["dark","template","light"]`（settings.rs one_of 校验）——**皮肤 manifest id（如 `darkroom`）存不进去**；主题 id 仍靠 localStorage。**已立卡 `THEME-VALUE-DOMAIN`（主仓 `ORCHESTRATION-INBOX.md`，P3 待派）** | 换设备/清缓存丢失皮肤选择 |
| **G-16** ✅ | `appearance.theme` 值域**已对齐**（后端 `["system","dark","light"]`，`bridges/settings.rs:380`） | ✅ **已修复（2026-09-19）** | 前端「跟随系统」不再 400 |

#### A2. 鉴权 / 用户

| # | 端点 | 状态（2026-09-18 核对） |
|---|---|---|
| G-02 | `POST /api/auth/register`、`/api/auth/setup` | ✅ **已实现**（SELF-REGISTER：后端 routes/mod.rs:143-144 + 432cb276/c2560174/9cd5081d，merge f5b021a3；api-fields 307 端点登记 implemented） |
| G-03 | `GET /api/users/me` | ⛔ 未实现（api-fields 无 / main routes 无）；可由 `/api/auth/me` + `/settings/user/profile` 替代（维持原判定） |
| G-04 | 用户管理增强 | 🟡 **大部分已实现**：`{id}/reset-password`、`{id}/approve-registration`、`{id}/reject-registration`、`{id}/login-risk/reset`、`/login-risk/ip/reset`、`batch/{disable,update,permanent-delete}` 全 implemented（api-fields + routes/manage_users.rs）。差异：V1 `/batch/delete` 在 V2 落地为 `/batch/permanent-delete`（manage_users.rs:146 注释，V1 全仓无 `/batch/delete` 直删语义） |

#### A3. 媒体条目操作面

| # | 端点 | 状态（2026-09-18 核对） |
|---|---|---|
| G-05 | 条目级操作面 | ✅ **已实现**（16 条子路由全 implemented：artwork、artwork/{overrideId}、metadata、metadata/reset、refresh-metadata、scan、scrape、scrape/refresh、sources/{sourceId}、subtitles、subtitles/{overrideId}、pipeline、provider-search、identify、identity/manual-match、visibility/{state}；routes/mod.rs:633-685 + media_metadata.rs:474-504；卡片 CRUD-MEDIA-METADATA merge fa8e952d/daecac96、CRUD-MEDIA-SCRAPE merge aaf839ee、CRUD-MEDIA-IDENTITY merge f5b227fe） |
| G-08 | `/api/manage/libraries/{id}/scan`、`/api/manage/scans` | 🟡 **部分**：`{id}/scan` 触发已实现（SCAN-TRIGGER-B2，routes/scan_trigger.rs；契约重生成 28789373）；`/api/manage/scans` 扫描列表仍无（api-fields 无 + routes 无） |
| G-10 | `/api/manage/probe-tasks/{id}`、`/{id}/enqueue`、`/{id}/refresh` | ✅ **已实现**（api-fields 3 端点 implemented，PROBE-TASKS-OPS 卡落地） |
| G-12 | — | ✅ pipeline 详情已实现（`/api/manage/media-items/{id}/pipeline`，routes/mod.rs:643） |

#### A4. 挂载 / 资产 / 注册码 / 其他

| # | 端点 | 状态（2026-09-18 核对） |
|---|---|---|
| G-09 | `/api/manage/mounts/{id}/validate`、`/{id}/refresh-access` | ✅ **已实现**（CRUD-MOUNTS merge 1c35df09；routes/mod.rs:354-358；语义：validate=只读探活+审计、refresh-access 能力位真探活/noop；VERIFY-SEMANTICS ba666446 起 verify=真探活+落状态） |
| G-11 | `/api/manage/registration-codes/{id}`、`/{id}/status`、`/batches/{id}`、`/batch/delete` | ✅ **已实现**（api-fields 7 端点 implemented：`{id}` PATCH+DELETE、`{id}/status` PATCH、`batches/{id}` PATCH、`batch/delete` POST） |
| G-13 | `/api/assets`、assets items images、assets subtitles | 🟡 **部分已实现**：`/api/assets/{blob_id}` + `/api/assets/items/{item_id}/images/{kind}` + `/api/assets/media-items/{item_id}/subtitles/{override_id}` implemented；`/api/assets`（列表）、`/api/assets/libraries/{id}/images/{id}` 仍未实现 |
| G-14 | `/api/manage/advanced` | ✅ **已实现**（MANAGE-ADVANCED merge bbab7e29：settings 组 7 项真值直出；`security.revoked_sessions` 诚实省略——V2 吊销=物理 DELETE 无行可数，前端已回落「—」，见 fmby-web MANAGE-ADVANCED handoff） |
| G-17 | `/api/manage/yun139/*` **前端接线** | 🟡 维持：后端段 A（11 端点）implemented（api-fields）；**前端页面与交互待用户接手**（fmby-web main 无 yun139 页面，grep 零命中） |
| G-06 | ⚠️ **危险操作确认口径不一致**：后端 `?confirmed=true` vs 前端 body `confirm_action` | ✅ **已收口**：前端统一 `?confirmed=true`（fmby-web api.ts 14 处 `params:{confirmed:true}`；后端 confirm-gate 闸 PASSED——前端危险写调用均发 params.confirmed；fix/fe-confirm-registration 已合入） |
| G-07 | ⚠️ 前端**细粒度能力守卫未落**（仅 `manage:access` 粗粒度） | ⛔ 维持：host 仅有 `guards/PermissionGate.tsx` 通用守卫组件，审计/设置页各自的细粒度守卫未见接线 |
| G-15 | ⚠️ 前端路径笔误：`/api/browse/search` 应为 `/api/search` | ✅ **已修复**（2026-09-18）：fmby-web main `browse/search/api.ts:8` 改为 `/api/search`（commit `4cc05ba`，已推 origin/main）；契约仓 known_drift 对应豁免条目已同步删除（12→11） |

### B. 未完成的任务卡（主仓 BOARD）

| 卡 | 内容 | 状态 |
|---|---|---|
| **P1-07** | 时钟修复 + Clock 端口注入 | review |
| **P2-06-R5** | mounts 收尾（browse runtime 注入 + KV 残留清理 + 前端 golden） | 在途 |
| **P2-C6-WIRING** | governor 前台压力采样接线（已交付待并） | 在途 |
| **P-ROBUST-P3** | 运行时 expect/panic 清除（P3-C10..C14） | 在途 |
| **P7-01** | 全链路 E2E 双库各一遍 | 在途 |
| **P7-05** | 最终对抗验证三轮 Review | 待办 |
| **P-PERF-30W** | 30w 规模压测（四链路 P95/P99 双库） | 待 P7-01 完 |

> 注：BOARD 中部分行状态**已过期**（P3-03/P6-02-E/P2-09/P7-02/P7-03/P7-04/P4-09-R3 实际已完成）。

### C. v1 功能对齐欠账（⚪ 用户裁定：重构=全量移植，不可删减）

| 项 | 说明 |
|---|---|
| ⚪ P115 命名歧义 | `P115`（外部 runtime）与 `Pan115`（原生 SDK）并存，UI 层禁止合并（已处理） |
| ✅ 注册/审批流 | 后端 G-02/G-04 端点已落地（SELF-REGISTER + 用户管理增强，见 A2 表）；前端注册/审批页已接确认闸（G-06 收口） |
| ✅ 媒体审核工单 | v2 已实现（media_review_queue 迁移 0020 + media_review_tickets 迁移 0036、SqliteMediaReviewRepository、identify NeedsReview 落审核台账；tests/media_review_repo.rs 端到端） |
| 🟡 **139 账号管理** | v1 有 yun139-accounts 页；v2 **段 A（存管）已实现** —— 端点 11 个 + 迁移 0037 + SecretBox 凭据；**段 B（池取流调度）未接线** |
| ✅ 上游源网关 | v2 已实现（upstreams_routes.rs：CRUD/enable/disable/health-check/discover-lan/categories/libraries 全注册；bridges/upstream_discovery.rs 真 probe；OpenAPI/路由双证） |
| 🟡 Microsoft Graph 数据面 | 已有 microsoft_graph.rs（分页游标 fail-closed、游标推进断言），不再是 P0-07 空壳 stub；真实 OAuth+账号池联调仍归真机验收（第四节 #3） |

---

## 四、🔬 需真机 / 真账号验收（CI 不可测）

以下功能**代码已实现**，但真实网络往返**只能在你的环境 + 真账号**下验证：

| # | 依赖 | 验收内容 |
|---|---|---|
| 1 | 115 真 cookie 账号 | 列目录 / 直链播放 / token 刷新探活 / uid 取值 |
| 2 | 139 账号 + `yun139_runtime_sidecar.py` | share 列 / stat / open_range |
| 3 | 微软 OAuth + 账号池 | code 兑换 / token 刷新（数据面仍 stub） |
| 4 | 真实 Telegram Bot | 真实联调 |
| 5 | 真 license 服务器 | 设备流 / 续租 / 功能门 |
| 6 | 真实网络往返 | 各 provider 外部依赖 |
| 7 | 139 真凭据（authorization/cookie） | 段 A：档案创建/重新授权后**凭据可被 139 侧接受**（本卡只验密封与存管，未验 139 上游接受性） |
| 8 | 139 池调度（段 B） | 取流按池策略选号 / 租借 / 冷却 / 失败计数生效 |

详见（验收清单 `acceptance/` 待补）§真实环境验收。

---

## 五、功能覆盖清单（按页面，主题需实现的 UI 面）

> 主题要实现的**UI 功能面**（后端是否有数据，看上面 A/B/C）。

### 普通用户

| 页面 | UI 功能 |
|---|---|
| 登录 | 账号密码、错误提示、（TOTP 入口） |
| 首页 | 分区流（热/最新/继续观看）、海报卡 |
| 历史 | 播放历史列表、继续播放 |
| 库列表 | 库卡片、进入 |
| 库详情 | 条目网格、筛选/排序、分页/无限滚动 |
| 条目详情 | 海报、简介、演职员、相关推荐、播放按钮 |
| 播放页 | 播放器、进度、源选择、心跳 |
| 个人资料 | 用户名、头像、（三方身份绑定） |
| 播放设置 | 默认清晰度/偏好 |
| 外观 | **界面皮肤（主题 id）**、明暗、海报密度、动效、首页分区 |

### 管理面

| 页面 | UI 功能 |
|---|---|
| 首页看板 | 统计卡、健康概览 |
| 任务中心 | 任务分类、进度、动作 |
| 添加媒体 | provider 选择、目录浏览、能力/路径策略 |
| 条目 | 列表、搜索、分页 |
| 条目详情 | 管道状态 |
| 媒体库 | CRUD、扫描 |
| 媒体来源 | 挂载 CRUD、115 扫码、目录浏览、绑定库、校验 |
| 探测任务 | 列表、创建 |
| 命名刮削 | 刮削/清理设置、预览、批量修复 |
| 合集 | CRUD、成员管理 |
| 注册码 | 列表、创建 |
| 用户 | 列表、CRUD、状态 |
| 权限模板 | 列表、创建 |
| 积分 | 账户查询、流水、事件配置 |
| 会话 | 列表、踢会话 |
| 审计日志 | 列表、过滤 |
| 运行日志 | 列表 |
| 站点设置 | 通用/安全/会话策略 |
| 授权 | 状态、设备流、激活、心跳 |
| Telegram | 状态、配置 |
| 密钥链 | 状态、覆盖写盘 |
| 高级维护 | 任务、媒体删除、审计、API token |
