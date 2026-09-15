# Features · 实现进度全表

> ★ **这是本仓库最重要的文件**。它回答一个问题：**v2 到底已经做了什么、还没做什么。**
>
> - 基线：**v0.1.105**（2026-09-14）
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
| 主题选择**跨端持久化** | ⛔ 见 G-01 |

---

## 三、⛔ 未实现 / 🟡 部分实现（**重点**）

### A. 前后端不一致（前端已写 client，后端未注册）— 41 条

#### A1. ★多主题相关（做多主题必须先解决）

| # | 问题 | 影响 |
|---|---|---|
| **G-01** | 用户所选**主题 id** 无后端持久化（只存 localStorage） | 换设备/清缓存丢失；无法跨端同步 |
| **G-16** | `appearance.theme` 前后端**值域不匹配**（后端 `["dark","template","light"]` vs 前端 `'system'\|'dark'\|'light'`） | 用户选「跟随系统」必被 400；语义混淆 |

#### A2. 鉴权 / 用户

| # | 端点 | 说明 |
|---|---|---|
| G-02 | `POST /api/auth/register`、`/api/auth/setup` | 注册页 / 初始化向导 |
| G-03 | `GET /api/users/me` | 可由 `/api/auth/me` + `/settings/user/profile` 替代 |
| G-04 | `/api/manage/users/{id}/{reset-password,approve-registration,reject-registration,login-risk/reset}`、`/api/manage/users/batch/{delete,disable,update}`、`/api/manage/login-risk/ip/reset` | 用户管理增强：批量、注册审批、密码重置、风控 |

#### A3. 媒体条目操作面

| # | 端点 | 说明 |
|---|---|---|
| G-05 | `/api/manage/media-items/{id}/{artwork,artwork/{id},metadata,metadata/reset,refresh-metadata,scan,scrape,scrape/refresh,sources/{id},subtitles,subtitles/{id}}` | 条目级：图片、元数据、刮削、扫描、字幕、源 |
| G-08 | `/api/manage/libraries/{id}/scan`、`/api/manage/scans` | 触发扫描 / 扫描列表 |
| G-10 | `/api/manage/probe-tasks/{id}`、`/{id}/enqueue`、`/{id}/refresh` | 探测任务操作 |
| G-12 | — | （pipeline 详情已实现） |

#### A4. 挂载 / 资产 / 注册码 / 其他

| # | 端点 | 说明 |
|---|---|---|
| G-09 | `/api/manage/mounts/{id}/validate`、`/{id}/refresh-access` | 挂载校验 / 刷新访问（与 P2-06-R5 同线） |
| G-11 | `/api/manage/registration-codes/{id}`、`/{id}/status`、`/batches/{id}`、`/batch/delete` | 注册码增强 |
| G-13 | `/api/assets`、`/api/assets/items/{id}/images/{id}`、`/api/assets/libraries/{id}/images/{id}`、`/api/assets/subtitles` | 资产子路由（当前只有 `/api/assets/{blob_id}`） |
| G-14 | `/api/manage/advanced` | 高级维护（115 图床 `pan115/imghost` 已于 V1F-01 实现并移出本项） |
| G-17 | `/api/manage/yun139/*` **前端接线** | 后端段 A（11 端点）已实现；**前端页面与交互待用户接手**（契约见 `api/domains/manage/yun139.md`） |
| G-06 | ⚠️ **危险操作确认口径不一致**：后端 `?confirmed=true` vs 前端 body `confirm_action` | 所有 DELETE 类 |
| G-07 | ⚠️ 前端**细粒度能力守卫未落**（仅 `manage:access` 粗粒度） | 审计/设置页应各自守卫 |
| G-15 | ⚠️ 前端路径笔误：`/api/browse/search` 应为 `/api/search` | 前端修正 |

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
| ⚪ 注册/审批流 | v1 有注册码 + 审批，v2 未完整对齐（见 G-02/G-04） |
| ⚪ 媒体审核工单 | v1 有 media-reviews，v2 未实现 |
| 🟡 **139 账号管理** | v1 有 `yun139-accounts` 页；v2 **段 A（存管）已实现** —— 端点 11 个 + 迁移 0037 + SecretBox 凭据；**段 B（池取流调度）未接线** |
| ⚪ 上游源网关 | v1 有 upstreams（AppleCMS/Emby 导入），v2 未实现 |
| ⚪ Microsoft Graph 数据面 | v1 有完整 Graph，v2 仍是 P0-07 fail-closed stub |

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

详见 [`../acceptance/functional.md`](../acceptance/functional.md) §真实环境验收。

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
