# 01 · 项目介绍

## FMBY v2 是什么

FMBY 是一个**轻量级私人媒体服务器**：把网盘（115 / 139 / 微软 OneDrive / AList / OpenList 等）和
本地磁盘挂载为媒体来源，自动扫描 → 识别刮削 → 提供浏览 / 检索 / 播放，并对 Emby / Jellyfin
客户端提供兼容接口。

**v2 是从零重写的版本**，目标：

| 目标 | 说明 |
|---|---|
| 更稳 | 分层 crate、依赖方向受 CI 门禁约束、双数据库（PG + SQLite）一致语义 |
| 更快 | 索引 + 键集分页、30w 规模压测目标 |
| 更安全 | 凭据 SecretBox 加密、CSRF 双匹配、capability 模型、审计全量 |
| 更好接 | 三方接口面隔离（一方 / 开放 API / 兼容），契约先行 |
| 更好看 | **多主题**：同一后端加载不同 UI skin |

## 多主题机制是什么

v2 的前端不是"一个固定 UI"，而是**宿主（host）+ 可切换主题（skin）**：

```text
后端（Rust 单二进制）
   │  提供 /api/* 接口 + 静态资源服务
   ▼
host（apps/host，固定）
   │  路由 / 布局 / 权限守卫 / 主题注册表
   ▼
skin（apps/themes/<id>，可插拔）
      tokens.css + 可选 Skin 组件 + nav 贡献
```

- **host 决定架构**：有哪些页面、怎么鉴权、路由怎么走——**主题不得新增路由或鉴权逻辑**。
- **skin 只做外观**：颜色 / 字体 / 间距（CSS tokens）、可选装饰组件（背景光效等）。
- **切换主题 = 替换 tokens**：不刷新页面、不重拉数据。

当前内置主题：

| theme id | 名称 | 状态 |
|---|---|---|
| `darkroom` | 暗房 | 默认主题，完整实现 |
| `template` | 模板主题 | 骨架（供主题作者起手复制） |

## 主题作者的边界（重要）

你说的"做一套主题"，实际上是**只做外观层**。功能逻辑（数据请求、权限判断、页面结构）
全部在 host + shared 里，主题**不能也不应该**重写它们。

主题能做到：

- ✅ 改全套颜色 / 字体 / 圆角 / 阴影 / 动效（通过 `tokens.css` 覆盖 CSS 变量）
- ✅ 提供装饰性 `Skin` 组件（如全局背景氛围层）
- ✅ 在 `manifest.nav` 里贡献导航项（但目标路由必须已存在）

主题**不能**做：

- ❌ 新增路由 / 页面（host 才有路由）
- ❌ 自己写 API client / 数据请求 / 权限判断
- ❌ 预加载业务数据（`preload` 恒 `false`，CI 强制）

## 三个接口面（主题只碰第一个）

| 面 | 前缀 | 谁用 | 主题是否需要 |
|---|---|---|---|
| 一方 WebUI | `/api/*` | host + 主题的页面逻辑 | ✅ **是**（但通过 shared 的 api client） |
| 第三方开放 | `/api/v1/*` | 外部程序（token 鉴权） | ❌ 主题不碰 |
| Emby/Jellyfin 兼容 | `/emby/*`、`/jellyfin/*` | Emby/Jellyfin 客户端 | ❌ 主题不碰 |

## 当前实现进度

本仓库的 `features/implementation-status.md` 是**功能全清单**，逐项标注：

- ✅ 已实现（后端 + 前端都有）
- 🟡 部分实现（后端有、前端未接 或 反之）
- ⛔ 未实现（规划中）
- 🚫 v1 有、v2 明确不做（如果有）

**做主题前请先读它**，避免为一个"后端还没做"的功能设计界面。

## 下一步

- 想动手做主题 → [`../development/getting-started.md`](../development/getting-started.md)
- 想看有哪些页面 → [`../features/routes.md`](../features/routes.md)
- 想看 API 细节 → [`../api/README.md`](../api/README.md)
- 想看架构 → [`02-architecture.md`](./02-architecture.md)
