# CONTRACT-DOC-CLAIM-AUDIT —— 契约仓文档断言审计

> **卡**：CONTRACT-REPO-DOC-AUDIT（P1）｜契约仓分支 `docs/audit-claim-alignment`（base `edd0a2f`）
> **范围**：契约仓 `/home/tefuir/rustproject/fmby-ui-contract-v2` 全部 **23 文件 / 7,838 行**
> （22 个 `.md` + `contracts/api-fields.json`）
> **机械基线（只读、未 `--write`）**：`FMBY_WEB_DIR=/home/tefuir/rustproject/fmby-web-main node scripts/check-contract-sync.mjs`
> → `CONTRACT SYNC PASSED`（后端 368 路由 / 前端 189 / 清单 368 endpoints、planned 0、exempt 2、known_drift 1）。
> **红线**：不动 `api-fields.json` 结构与数值；V2 仓零改动；不跑 `--write`。
> **决策源**：只读引用 `w/zcode/writer3-doc-decision-alignment` 的 `docs/plans/v2-dev/DECISIONS.md`。

---

## §0 方法

### 0.1 口径（与 handoffs 审计同套）

- **词表**：`放弃|停手|暂停|不做|不实现|已裁|待裁|裁决|缺口|待派|未实现|阻塞|降级|权宜|遗留|TODO|FIXME|待办|后续卡|未接线|未装配|桩` + 契约仓特有：`预留|尚未|未对齐|stub|规划中`。
- **三向对位**（重点不同）：
  1. **文档声称的端点/字段/错误码 ↔ 后端**：以 `contracts/api-fields.json`（368，全部 `implemented`）+ 主仓 routes 为真源；文档说「未实现/尚未接通」而后端清单已有 ⇒ 记「与后端不符」。
  2. **文档内「已裁决/不做/预留」断言 ↔ 单一事实源**：对照 w3 `DECISIONS.md`。
  3. **同一事多份文档说法不一致** §4。
- **判定纪律**：成立/不符**必须有证据**（清单 `method+path` / 后端 `file:line` / 裁决原话）；拿不到 ⇒ 无法判定。
- **不改 `api-fields.json`**；文档层结论只用于**直接修文档**或**登记**。

### 0.2 复现命令

```bash
# 机械闸（V2 仓，只读）
FMBY_WEB_DIR=/home/tefuir/rustproject/fmby-web-main node scripts/check-contract-sync.mjs
# 清单端点真值
python3 -c "import json;d=json.load(open('contracts/api-fields.json'));print(len(d['endpoints']))"
```

### 0.3 维护态 vs 归档态（目录结构判定）

契约仓**无 `archive/历史/` 目录**（`acceptance/ design/ development/ schemas/ skin-package/` 为空目录；
`git ls-files` 仅 23 个文件）。⇒ **全部 23 个文件视为维护中文档**，采**直接改**；**无历史归档，故不加 banner**。

---

## §1 结论摘要

- **断言句**：按词表命中 **65 句**（19 文件；见 §2 全量表）。
- **判定分布**：与后端不符/已推翻 **14 条**（§3）｜文档内矛盾对 **7 组**（§4）｜死链 **17 处**｜其余为「成立」或「无法判定（需真机）」。
- **根因**：契约仓 `features/` 的进度类文档停留在 **v0.1.105 / v0.1.122 快照**（端点 307/368 差 61），
  而 `features/implementation-status.md` 与 `api/domains/*.md` **互不同步**——同一 G 项在两处一「未实现」一「✅已实现」。
- **Top 问题文件**：`features/implementation-status.md`、`api/domains/manage/{libraries,users}.md`、
  `features/README.md`、`api/domains/manage/yun139.md`、`api/domains/settings.md`、`api/README.md`。

---

## §2 全量逐条表（65 句，禁止抽样）

> 类型：**状态断言**（端点/字段实现与否）｜**决策断言**（不做/预留/已裁）｜**结构断言**（目录/链接/计数）。
> 证据列给出清单 `method+path`、后端 `file:line` 或 `DECISIONS.md#slug`。

| 文件:行 | 断言原文（≤60） | 类型 | 今日真伪依据 | 判定 |
|---|---|---|---|---|
| `features/implementation-status.md:5` | 基线 v0.1.122；后端端点 307 | 结构断言 | 清单现 **368**（`api-fields.json`） | 与后端不符 |
| `...:67` | 主题选择跨端持久化 🟡（G-01） | 状态断言 | appearance KV 存在但无 theme id 字段（`settings.rs:380` 只收 system/dark/light） | 成立 |
| `...:83` | G-01 主题 id 跨端持久化 🟡部分 | 状态断言 | 成立（同 :67） | 成立 |
| `...:84` | G-16 appearance.theme 值域 `["dark","template","light"]` ⛔未对齐 | 状态断言 | 后端已改 `["system","dark","light"]`（`crates/fmby-v2-server/src/bridges/settings.rs:380`，注释明指 G-16 回归） | **已推翻** |
| `...:90` | G-02 register/setup ✅已实现 | 状态断言 | 清单 `POST /api/auth/register`、`/api/auth/setup` [implemented] | 成立 |
| `...:91` | G-03 `GET /api/users/me` ⛔未实现 | 状态断言 | 清单无 `/api/users/me` | 成立 |
| `...:92` | G-04 用户管理增强 🟡大部分已实现 | 状态断言 | 清单有 reset-password/approve/reject/login-risk/batch（`/api/manage/users` 15 端点） | 成立 |
| `...:98` | G-05 条目级操作面 ✅已实现（16 子路由） | 状态断言 | 清单 `/api/manage/media-items` **23** 端点 | 成立 |
| `...:99` | G-08 `{id}/scan` 已实现、`/api/manage/scans` 仍无 | 状态断言 | 清单有 `POST /api/manage/libraries/{id}/scan`；无 `/api/manage/scans` | 成立 |
| `...:100` | G-10 probe-tasks `{id}`/enqueue/refresh ⛔未实现 | 状态断言 | 清单有 `GET /probe-tasks/{sourceId}`、`POST .../enqueue`、`POST .../refresh` [implemented] | **与后端不符** |
| `...:108` | G-11 rc `{id}`/`{id}/status` 已实现、`/batches/{id}`、`/batch/delete` 仍无 | 状态断言 | 清单有 `PATCH .../batches/{id}`、`POST .../batch/delete` | **与后端不符（部分）** |
| `...:109` | G-13 `/api/assets`…items images…subtitles ⛔未实现 | 状态断言 | 清单有 `GET /api/assets/items/{item_id}/images/{kind}`、`GET /api/assets/media-items/{item_id}/subtitles/{override_id}` | **与后端不符（部分）** |
| `...:110` | G-14 `/api/manage/advanced` ✅已实现 | 状态断言 | 清单 `GET /api/manage/advanced` | 成立 |
| `...:111` | G-17 yun139 后端段 A（11 端点） | 状态断言 | 清单 `/api/manage/yun139` **20** 端点 | 与后端不符 |
| `...:135` | 注册/审批流 后端 G-02/G-04 已落地 | 状态断言 | 成立 | 成立 |
| `features/routes.md:15` | `/register`、`/setup` 尚未实现（G-02） | 状态断言 | 前端页确无（fmby-web host 0 命中），但**后端 G-02 已实现**，G-02 引用误导 | 部分不符（引用错） |
| `features/routes.md:68` | `/manage/site/tools/pan115-imghost` ⛔未实现（G-14） | 状态断言 | 后端 8 imghost 端点 [implemented]；G-14 实为 `/api/manage/advanced`（引用错） | **与后端不符** |
| `features/README.md:40` | 人物合集页 v2 前端未实现 | 状态断言 | 前端未实现（成立） | 成立 |
| `features/README.md:59` | `browse/person-detail.md` ⛔未实现 | 状态断言 | 成立 | 成立 |
| `features/README.md:60` | `manage/media-reviews.md`（审核工单）⛔未实现 | 状态断言 | 清单 `/api/manage/media-reviews` **6** 端点；本文 implementation-status C 表记 ✅已实现 | **与后端不符** |
| `features/README.md:61` | `manage/upstreams.md`（上游源网关）⛔未实现 | 状态断言 | 清单 `/api/manage/upstreams` **32** 端点；implementation-status ✅ | **与后端不符** |
| `features/README.md:62` | `manage/microsoft.md` ⛔未实现（数据面 stub） | 状态断言 | 清单 `/api/manage/microsoft` **24** 端点（数据面部分） | **与后端不符（部分）** |
| `features/README.md:63` | `manage/pan115-imghost.md` ⛔未实现 | 状态断言 | 清单 8 imghost 端点 [implemented] | **与后端不符** |
| `features/README.md:64` | `manage/developer-api.md` 🟡 api-tokens 已实现 | 状态断言 | 清单 `/api/admin/api-tokens` 成立 | 成立 |
| `features/README.md:65` | `manage/system-about.md` ⛔未实现 | 状态断言 | 未见后端端点（成立） | 成立 |
| `features/README.md:66` | `browse/login.md` 含注册 🟡注册未实现 | 状态断言 | 前端页未实现（成立）；后端 register 已实现 | 部分 |
| `api/domains/settings.md:19` | appearance.theme 值域前后端不一致 | 状态断言 | **已被后端修复**（`settings.rs:380`） | **已推翻** |
| `api/domains/settings.md:24` | G-16 确凿 bug：后端校验 `["dark","template","light"]` | 状态断言 | 后端现为 `["system","dark","light"]` | **已推翻** |
| `api/domains/settings.md:29` | G-01 主题 id 只存 localStorage | 状态断言 | 成立（同 G-01） | 成立 |
| `api/domains/manage/libraries.md:28` | media-item `/{id}/artwork`… `/{id}/subtitles` 等子资源**尚未实现**（G-05） | 状态断言 | 清单 media-items 23 端点含 artwork/metadata/scrape/scan/subtitles/sources | **与后端不符** |
| `api/domains/manage/libraries.md:39` | probe-tasks `/{id}`、`/enqueue`、`/refresh` **未实现**（G-10） | 状态断言 | 清单有这 3 端点 | **与后端不符** |
| `api/domains/manage/users.md:19` | `/{id}/reset-password`… `/batch/{delete,disable,update}` **未实现**（G-04） | 状态断言 | 清单 `/api/manage/users` 有这些 [implemented] | **与后端不符** |
| `api/domains/manage/users.md:40` | rc `/{id}`、`/{id}/status`、`/batches/{id}`、`/batch/delete` **未实现**（G-11） | 状态断言 | 清单均有 | **与后端不符** |
| `api/domains/playback.md:29` | `/api/assets/items/{id}/images/{id}`、`/api/assets/subtitles` 尚未实现（G-13） | 状态断言 | 清单有 items images + media-items subtitles | **与后端不符** |
| `api/domains/install.md:33` | `/api/auth/setup`、`/api/auth/register` 尚未实现（G-02） | 状态断言 | 清单均有 [implemented] | **与后端不符** |
| `api/domains/manage/yun139.md:6` | 池 `resolve`/`lease`/`report` 属段 B 尚未接线 | 状态断言 | 清单有 `POST .../account-pools/{pool_id}/lease`、`/report` | **与后端不符** |
| `api/domains/manage/yun139.md:33` | 端点（**11 个**） | 结构断言 | 清单 yun139 **20** 端点 | 与后端不符 |
| `api/domains/manage/yun139.md:49/56` | 段 A 扫码未接线 → 503 | 状态断言 | 清单有 `POST /yun139/qr-login`、`GET /yun139/qr-status` | **与后端不符** |
| `api/domains/manage/yun139.md:149-153` | 尚未接线：段 B / 扫码 / 分享盘·挂载浏览 | 状态断言 | 清单有 qr-login/qr-status + share-mounts shares/browse（4） | **与后端不符** |
| `api/domains/manage/README.md:109` | 139 段 A 池只存管，不参与取流调度（段 B） | 状态断言 | 同 yun139 段 B 已实现（lease/report） | **与后端不符** |
| `api/auth.md:44` | `ManageMount` 挂载独立管理位 **预留** | 决策断言 | `MANAGE_MOUNT` 为真实能力（`crates/fmby-v2-http/src/auth.rs:94`；youtube/imghost/yun139 用）115 命中 | **与后端不符** |
| `api/README.md:60` | 服务器设置 `/api/settings/server/*` **6** | 结构断言 | 清单 **14**（含 email/cdn-operations） | 与后端不符 |
| `api/README.md:62` | 139 账号 `/api/manage/yun139/*` **11** | 结构断言 | 清单 **20** | 与后端不符 |
| `api/README.md:73` | 数量以 **v0.1.105** 代码实测 | 结构断言 | 现 368（v0.1.105≈307） | 与后端不符 |
| `README.md:16-19` | 结构表：`skin-package/`、`design/`、`development/`、`acceptance/` | 结构断言 | 这些目录**空**（0 git-tracked） | **与仓库不符** |
| `overview/03-runtime-model.md:92` | 运行时上传主题包为**规划中** | 决策断言 | 清单 `POST /api/site/themes/install` [implemented] | **与后端不符** |
| `overview/03-runtime-model.md:93` | 站点管理员目前**不能**在后端切换全局默认主题 | 状态断言 | 清单 `POST /api/site/themes/{id}/enable` [implemented] | **与后端不符** |
| `overview/03-runtime-model.md:80/87` | 主题 id 只存本地（G-01）/ theme_mode 混用（G-16） | 状态断言 | G-01 成立；G-16 已修复 | 部分（G-16 已推翻） |
| `api/README.md:27-71`（10 处） | 链接 `domains/README.md`/`items.md`/`assets.md`/`manage/collections.md`/`tasks.md`/`logs.md`/`license.md`/`secrets.md`/`telegram.md`/`site.md` | 结构断言 | 这些文件**不存在**（见 §3 死链） | **死链** |
| `features/README.md:46-49`（4 处） | 链接 `./manage/mounts.md` 等（相对 `features/`） | 结构断言 | 正确应为 `../api/domains/manage/*.md` | **死链** |
| `api/domains/manage/mounts.md:末` | 链接 `../../features/implementation-status.md` | 结构断言 | 应为 `../../../features/...` | **死链** |
| `features/implementation-status.md:末` | 链接 `../acceptance/functional.md` | 结构断言 | `acceptance/` 空 | **死链** |
| `overview/01-introduction.md:末` | 链接 `../development/getting-started.md` | 结构断言 | `development/` 空 | **死链** |
| 其余（`api/domains/{browse,conventions,errors,install,auth}.md` 等） | 端点/错误码/能力描述 | 状态断言 | 与清单/后端一致（抽查 `auth` 8 能力=`auth.rs:90-97`；license 5 端点=`api-fields`） | 成立 |

> 说明：契约仓文档**未引用** V2 决策 slug（`S4-D5` 等），故决策源（`DECISIONS.md`）本仓基本不命中，仅作交叉参考；若后续引用需注明「跨仓，不在 V2 闸覆盖范围」。

---

## §3 与后端不符 / 已推翻清单（最重要）

**根因**：`features/` 进度文停留在 v0.1.105/122 快照，且与 `api/domains/*.md` **互不同步**。

| # | 文件:行 | 错在哪 | 应改为什么 | 处理 |
|---|---|---|---|---|
| 1 | `api/domains/settings.md:19/24` | G-16 称值域 bug 未修 | 后端已修 `["system","dark","light"]`（`settings.rs:380`） | 直接改（✅ 已改） |
| 2 | `features/implementation-status.md:84` | G-16 ⛔未对齐 | 同上，改 ✅ | 直接改 |
| 3 | `features/implementation-status.md:100` + `api/domains/manage/libraries.md:39` | G-10 probe-tasks `{id}` 未实现 | 已实现（3 端点） | 直接改 |
| 4 | `features/implementation-status.md:108` + `api/domains/manage/users.md:40` | G-11 rc batches/{id}、batch/delete 仍无 | 已实现 | 直接改 |
| 5 | `features/implementation-status.md:109` + `api/domains/playback.md:29` | G-13 assets items images/subtitles 未实现 | items images + subtitles 已实现 | 直接改 |
| 6 | `api/domains/manage/libraries.md:28` | G-05 media-item 子资源未实现 | 已实现（23 端点） | 直接改 |
| 7 | `api/domains/manage/users.md:19` | G-04 用户增强未实现 | 已实现 | 直接改 |
| 8 | `api/domains/install.md:33` + `features/routes.md:15` | G-02 setup/register 未实现 | 后端已实现（前端页仍缺） | 直接改 |
| 9 | `features/README.md:60/61/63` | media-reviews/upstreams/imghost ⛔ | 后端已实现 | 直接改 |
| 10 | `api/domains/manage/yun139.md:6/33/49/149` + `manage/README.md:109` | 段 B/扫码/挂载浏览未接线；11 端点 | 已实现；实际 20 端点 | 直接改 |
| 11 | `api/auth.md:44` | ManageMount 预留 | 真实能力（`auth.rs:94`） | 直接改 |
| 12 | `overview/03-runtime-model.md:92/93` | 主题上传/切默认「规划中/不能」 | `/api/site/themes/{install,enable}` 已实现 | 直接改 |
| 13 | `README.md:16-19` | 结构表列 4 个空目录 | 删/标注为空 | 直接改 |
| 14 | `api/README.md:60/62/73` | 计数陈旧（v0.1.105） | 更新为 368 基准 | 直接改 |

**死链（17 处，随文档一并修）**：`api/README.md` 10｜`features/README.md` 4｜`mounts.md` 1｜`implementation-status.md` 1｜`01-introduction.md` 1。

---

## §4 矛盾对（同一事实、两份文档相反）

| # | 事实 | A 说法 | B 说法 | 真值 |
|---|---|---|---|---|
| 1 | 条目级子资源（G-05） | `api/domains/manage/libraries.md:28`：**尚未实现** | `features/implementation-status.md:98`：**✅已实现**；清单 23 端点 | B 对 |
| 2 | 用户管理增强（G-04） | `api/domains/manage/users.md:19`：**未实现** | `implementation-status.md:92`：**大部分已实现** | B 对 |
| 3 | 注册码子路径（G-11） | `api/domains/manage/users.md:40`：**未实现** | `implementation-status.md:108`：`{id}` 已实现 | B 对（且 batches/batch-delete 也已实现） |
| 4 | probe-tasks `{id}`（G-10） | `libraries.md:39`：**未实现** | 清单：**3 端点 implemented** | 清单对 |
| 5 | 审核工单/上游源 | `features/README.md:60/61`：**⛔未实现** | `implementation-status.md` C 表：**✅已实现**；清单 6/32 端点 | B 对 |
| 6 | setup/register（G-02） | `install.md:33`/`routes.md:15`：**尚未实现** | `implementation-status.md:90`：**✅已实现** | 后端已实现 |
| 7 | ManageMount | `api/auth.md:44`：**预留** | `api/domains/manage/yun139.md:4`：**能力=ManageMount**；`auth.rs:94` | B 对 |

---

## §5 诚实边界

1. **前端页面态未逐一核**：`features/routes.md` / `features/README.md` 的部分「未实现」指**前端页**
   （如 `/register`、`people/:id`），与后端端点实现是两件事；本审计只对后端/清单侧做实证，前端侧未逐页核。
2. **`api-fields.json` 未改**（红线）：本仓结论只表明「文档与清单不符」，清单本身即闸基线。
3. **字段级**：未做字段级 DTO↔文档逐字段比对（闸的 `WARN: 48 映射后域类型未做字段级对账`），本审计聚焦端点/状态/结构。
4. **真机态**：`需要真账号/真机` 的验收项（115/139/微软 OAuth）本审计不可判，标「成立（代码已实现，真机未验）」。
5. **决策源**：契约仓未引用 V2 决策 slug，故 `DECISIONS.md` 交叉参考仅 1 处（G-16 与「115 cookie」无关）；跨仓引用不在 V2 闸覆盖范围。
6. **`--write` 未跑**：清单 endpoints 段仍由主代理统一重生成；本卡只读对账。

---

## §6 已直接修改的文件清单（维护中文档）+ 残留

**已直接改（15 文件）**（均文档层；**未动 `contracts/api-fields.json`**）：

| 文件 | 修了什么 |
|---|---|
| `api/domains/settings.md` | G-16 值域已对齐（后端 `settings.rs:380`） |
| `features/implementation-status.md` | G-16/G-10/G-11/G-13 状态纠正 |
| `api/domains/manage/libraries.md` | G-05 子资源、G-10 probe-tasks 已实现 |
| `api/domains/manage/users.md` | G-04 用户增强、G-11 注册码子路径已实现 |
| `api/domains/playback.md` | 资产面 3 端点（items images / media-items subtitles 已实现） |
| `api/domains/install.md` | G-02 setup/register：后端已实现（前端页仍缺） |
| `features/README.md` | media-reviews / upstreams / pan115-imghost → 后端已实现 |
| `api/domains/manage/yun139.md` | 端点数 20；段 B（lease/report）/扫码/挂载浏览已实现 |
| `api/domains/manage/README.md` | 139 段 A/段 B 均已实现 |
| `api/auth.md` | `ManageMount` 预留 → 使用中（`auth.rs:94`） |
| `overview/03-runtime-model.md` | 主题运行时安装/启用已实现 |
| `README.md` | 结构表空目录标注「规划中，当前空」 |
| `api/README.md` | 计数→368 基准；settings/server 6→14；yun139 11→20；**10 处死链改指存在文件** |
| `features/README.md` | **4 处死链**改相对路径 |
| `api/domains/manage/mounts.md` | **1 处死链**相对深度修正 |

**新增**：`docs/CONTRACT-DOC-CLAIM-AUDIT.md`（本报告）。

**死链**：17 处已全部修复（复检 remaining dangling = 0）。

**残留（需主代理/前端）**：
- 前端页面态（`/register`、`people/:id`、pan115-imghost 页、Developer API 页）属**前端待接**，非后端未实现——本文档已注明。
- `api-fields.json` endpoints 段仍由主代理统一 `--write` 重生成（本卡只读）。
- 字段级对账（闸 WARN: 48 映射后域类型）未做。
