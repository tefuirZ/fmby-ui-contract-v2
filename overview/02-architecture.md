# 02 · 架构

## 后端（Rust workspace）

```text
fmby-v2/
├── crates/
│   ├── fmby-v2-domain          # 领域模型（实体/值对象/策略），零 IO
│   ├── fmby-v2-contracts       # 端口契约（repository / provider trait）
│   ├── fmby-v2-application     # 应用层（用例编排）
│   ├── fmby-v2-http            # ★ 一方 WebUI 接口 /api/*
│   ├── fmby-v2-api-token       # ★ 第三方开放接口 /api/v1/*
│   ├── fmby-v2-compat          # ★ Emby/Jellyfin 兼容 /emby|/jellyfin/*
│   ├── fmby-v2-server          # 聚合根：工厂装配 + 启动
│   ├── fmby-v2-runtime         # 运行时（worker / governor / 调度）
│   ├── fmby-v2-providers       # 存储 provider 实现
│   ├── fmby-v2-persistence-{pg,sqlite}  # 双数据库适配
│   ├── fmby-v2-{naming,recognize,search,license}  # 命名/识别/检索/授权
│   └── ...
├── apps/                       # 前端
│   ├── host                    # 宿主应用（路由/布局/守卫/主题注册表）
│   ├── shared                  # 共享层（contracts + theme 协议 + ui 组件）
│   └── themes/                 # 主题包（darkroom / _template）
└── migrations/                 # 数据库迁移（双方言）
```

**依赖方向受 CI 硬约束**（`scripts/check-layering.mjs`）：

```text
domain ← contracts ← application ← {http, api-token, compat, runtime}
                                         ↑
                                      server（装配）
```

- `http` / `api-token` / `compat` **只允许**依赖 domain / contracts / application
- **不允许** http → runtime 反向依赖（需要时经 application 端口做依赖倒置）
- **三个接口面互不借用 handler**；compat 不得调用一方 HTTP handler

## 三接口面（严格隔离）

```text
                        ┌─────────────────────────────────────┐
   浏览器（host+skin）──▶│ /api/*        session cookie+CSRF    │  fmby-v2-http
                        ├─────────────────────────────────────┤
   外部程序 ────────────▶│ /api/v1/*     API Token + scope      │  fmby-v2-api-token
                        ├─────────────────────────────────────┤
   Emby/Jellyfin 客户端─▶│ /emby|/jellyfin  API-Key/token       │  fmby-v2-compat
                        └─────────────────────────────────────┘
                                     │
                              各自独立鉴权实体
```

三类凭据是**不同实体 / 不同表 / 不同 DTO**（防鉴权混淆）：

- `SessionCredential`（一方会话）
- `ApiTokenCredential`（开放 API token：scope + ttl + 审计）
- `CompatCredential`（兼容层 API-Key）

## 前端分层

```text
apps/host（宿主，固定）
├── app/router/        # 全部路由 + 守卫（AuthGuard / CapabilityGuard）
├── app/layouts/       # BrowseLayout / ManageLayout / SettingsLayout / AppShell
├── session/           # 会话上下文（capabilities 归一化）
└── theme/             # ThemeProvider + registry（主题加载契约）

apps/shared（共享层，主题与 host 共同依赖）
├── contracts/         # ★ DTO + api client（唯一契约源）
├── theme/             # ★ ThemeManifest 协议（权威形状）
├── ui/                # 通用 UI 组件
├── query/             # tanstack query keys
└── errors/ utils/ time/ ...

apps/themes/<id>（主题包，纯外观）
├── theme.manifest.json
├── tokens.css（+ 可选 extraCssFiles）
├── src/index.ts      # 默认导出 ThemeEntryModule
└── package.json
```

**共享层规则**（不可协商）：

1. 主题只能 `import` `@fmby/v2-shared/*` 的**外观相关**能力（tokens / ui / theme 协议）
2. 主题**禁止**自带 api client / mapper / query keys / 权限判断 / 预加载业务数据
3. CI 由 `scripts/check-frontend-dupes.mjs` 强制
4. 主题产物首屏**不加载**（懒 import + 独立 async chunk，`check-frontend-size.mjs` 断言）

## 数据层

- **双数据库**：PostgreSQL + SQLite，同一套 repository trait，语义一致（`fmby-v2-persistence-{pg,sqlite}`）
- **迁移**：`migrations/` 双方言，`sqlx::migrate!` 驱动
- **迁移桥**：`migrate-from-v1` 支持从 v1 旧库迁移数据

## 运行时

- **worker**：scan / identify / scrape / asset-download / search-index / heartbeat（license）
- **governor**：并发治理（前台优先 + 后台保底），前台压力采样接线见 P2-C6-WIRING
- **supervisor**：worker 监督与重启

## 鉴权与能力

- 会话：`fmby_session`（HttpOnly）+ `fmby_csrf`（派生 HMAC），写方法双匹配
- 能力（capability）8 项：`Browse` / `Play` / `ManageAccess` / `ManageLibrary` / `ManageMount` /
  `ManageSettings` / `DangerousAction` / `ViewAudit`
- 角色 → 能力：`Admin`（全部）、`User`（Browse+Play）、`RestrictedUser`（Browse）
- 详见 [`../api/auth.md`](../api/auth.md)

## 下一节

[`03-runtime-model.md`](./03-runtime-model.md)：主题加载时序、切换机制、首屏性能。
