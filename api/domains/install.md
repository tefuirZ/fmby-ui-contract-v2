# API · 安装引导

> 首次部署 / 恢复模式下可用；**已安装且库健康**的实例上，这些端点整体下线（404），
> 不暴露子系统存在性。

鉴权：**公开**（带独立限流桶）。

---

## 端点

| 方法 路径 | 限流 | 请求 | 响应 | 错误 |
|---|---|---|---|---|
| `GET /api/install/status` | 60/min（unknown 桶） | — | `InstallStatusDto{state, database_configured, can_probe}` | 429 / 503 |
| `POST /api/install/probe/database` | 10/min | `{kind, path?, url?}` | `InstallDatabaseProbeDto{kind, reachable}` | 429 / 404（已装下线）/ 503 / 400 |

---

## 安全边界

- 已安装且库健康 → 探测路由**整体 404 下线**
- SQLite 探测**只读**（不建库）
- PG 探测有 **8s 超时**边界
- 错误响应**不含连接串原文**

---

## 前端用法

安装页（`/install`）：读 status → 若未安装则展示探测表单。探测成功后进入初始化流程。

> **注意**：注册 / 初始化向导的完整流程（`/api/auth/setup`、`/api/auth/register`）
> **尚未实现**，见 [`../../features/implementation-status.md`](../../features/implementation-status.md) G-02。
