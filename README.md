# fmby-ui-contract-v2

> **FMBY v2 前后端契约仓**（单一来源，公开）
>
> 本仓是 FMBY v2 前后端的**契约权威来源**——前端（`fmby-web`）与后端（`fmby-v2`）
> 的接口面、DTO 字段、主题协议以此为准。主仓 `docs/interfaces/` 为**镜像**。

## 结构

| 路径 | 内容 |
|---|---|
| `contracts/api-fields.json` | **API 契约清单**（端点 → 请求/响应 wire 字段，机器可读，CI 对账用） |
| `api/` | API 契约文档（按域拆分，人类可读） |
| `features/` | 功能清单 + 实现进度（含未实现项登记） |
| `overview/` | 架构与运行模型 |
| `skin-package/` | 主题包规范（**规划中，当前空**） |
| `design/` | 设计规范（tokens/响应式/a11y）（**规划中，当前空**） |
| `development/` | 开发指南（**规划中，当前空**） |
| `acceptance/` | 验收清单（**规划中，当前空**） |

## 契约版本

`CONTRACT_VERSION` 是前后端互操作版本（后端 `fmby-v2-contracts` ↔ 前端 `fmby-web/shared/src/contracts` 必须对齐）。
后端与前端**各自独立发版**，只有契约版本必须一致。

## 对账门禁

`fmby-v2/scripts/check-contract-sync.mjs` 做三方对账：
**后端 serde 字段 ↔ 前端 mapper ↔ 本仓 `contracts/api-fields.json`**，不一致即 FAIL。
CI 并列 checkout 三个仓（fmby-v2 + fmby-web + 本仓）执行。

## 维护

- `endpoints` 段由脚本生成（勿手改）
- `planned` / `exempt` / `known_drift` 三张表**人工维护**（登记未实现/豁免/已核实漂移基线）
