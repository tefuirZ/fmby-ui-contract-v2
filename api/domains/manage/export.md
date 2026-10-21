# 数据导出（data-export · 2026-10-21 同步自主仓 webui.md，判据 = `manage_export.rs`）

> 异步导出管线：`POST jobs` 建作业（state 恒 `queued`）→ `GET jobs/{id}` 轮询 →
> `GET …/manifest` 取清单 → `GET …/files/{name}` 拉 JSONL 分片；`DELETE` 取消。
> 能力位：全族 `admin（DangerousAction）`。

| 方法 路径 | 入参 | 响应 | 错误 |
|---|---|---|---|
| `POST /api/manage/export/jobs` | `tables?:string[]`（省略=首批全量 24 表）、`batch_size?:u64`（默认 500，硬上限 5000）、`interval_ms?:u64`（默认 50，硬上限 5000） | **200** `{job_id, state}`（state 恒 `queued`；异步受理，非 202——判据 = `manage_export.rs:162` `Ok(Json(ExportStartResponse))`） | 400 / 401 / 403 / 500 端口未装配 |
| `GET /api/manage/export/jobs/{jobId}` | — | `{job_id, state, actor_id, consistency, tables, tables_done, rows_written, bytes_written, error?, created_at_ms, finished_at_ms?}`（consistency：SQLite=`eventually-consistent` / PG=`point-in-time`） | 401 / 403 / 404 / 500 |
| `DELETE /api/manage/export/jobs/{jobId}` | — | `{job_id, state}`（批边界生效；已终态幂等返回当前态） | 401 / 403 / 404 / 500 |
| `GET /api/manage/export/jobs/{jobId}/manifest` | — | manifest JSON（`_schema`/`jobId`/`schemaVersion`/`consistency`/`actorId`/`exportedAtMs`/`tables[{table,rows,parts,redactions[{column,action}]}]`；sha256 进审计） | 401 / 403 / 404（未生成）/ 500 |
| `GET /api/manage/export/jobs/{jobId}/files/{name}` | — | JSONL 分片（`application/x-ndjson`；**实装 = `fs::read` 整片进 `Body`**——单分片上限 10 万行（`DEFAULT_MAX_ROWS_PER_FILE`），非流式；`name` 禁 `/` `\` `..`） | 401 / 403 / 404 |
