#!/usr/bin/env node
// check-doc-paths.mjs —— 契约文档里的端点是否真实存在于契约清单。
//
// 为什么要有它（2026-11-04 立）：
//   本轮 10 个文档 PR 里，机械比对抓出 3 条**文档真错误**：
//     ① `/api/browse/search` 被文档判为「错误路径」，实际已注册（判断错，不是笔误）
//     ② `GET /api/manage/role-templates/{id}` 被文档列为「详情」，后端根本没有该端点
//     ③ 起草者（主代理）自己凭印象加了 `GET .../credential-profiles/{id}`，同样不存在
//   这三条都不是「漏写」，而是**文档写了不存在的东西**——人读文档比机械清单更容易腐化。
//   契约仓没有 CI，故把该比对固化成脚本，接入任意 CI 即可。
//
// 判据：契约仓 `contracts/api-fields.json` 的 endpoints 是机器真源（由主仓
//   `check-contract-sync --write` 生成）。文档中每个 `` `METHOD /api/...` `` 必须命中它。
//
// 豁免：
//   - 兼容面（`/emby`、`/jellyfin`）不在清单内（待裁决项），整篇 compat-emby.md 豁免；
//   - 通配前缀说明（`/api/*`）不是端点；
//   - `{...}` 参数名归一化为 `{}` 后比较。
//
// 用法：node scripts/check-doc-paths.mjs [--verbose]

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MANIFEST = path.join(ROOT, "contracts", "api-fields.json");
const API_DIR = path.join(ROOT, "api");
const VERBOSE = process.argv.includes("--verbose");

/** 文档整篇豁免（不在机械清单覆盖面的域）。 */
const EXEMPT_FILES = new Set([
  path.join(API_DIR, "domains", "compat-emby.md"),
  path.join(API_DIR, "open-v1.md"), // /api/v1 面：清单当前 0 条（待裁决）
]);

const normPath = (p) =>
  p
    .split("?")[0]
    .replace(/\{[^}]*\}/g, "{}")
    .replace(/\/+$/, "");

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (e.name.endsWith(".md")) out.push(full);
  }
  return out;
}

if (!fs.existsSync(MANIFEST)) {
  console.error(`✗ 缺少契约清单：${MANIFEST}`);
  process.exit(2);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
const eps = Array.isArray(manifest) ? manifest : manifest.endpoints;
const known = new Set(eps.map((e) => `${e.method.toUpperCase()} ${normPath(e.path)}`));

// `METHOD /path` 形式（反引号内），兼容 `GET /api/...?x=1`
const RE = /`(GET|POST|PUT|PATCH|DELETE|HEAD) (\/[^\s`]+)`/g;

const missing = [];
const checked = [];
let exemptCount = 0;

for (const file of walk(API_DIR)) {
  if (EXEMPT_FILES.has(file)) {
    exemptCount++;
    if (VERBOSE) console.log(`[skip] ${path.relative(ROOT, file)}（整篇豁免）`);
    continue;
  }
  const src = fs.readFileSync(file, "utf8");
  for (const m of src.matchAll(RE)) {
    const method = m[1];
    const rawPath = m[2];
    if (rawPath.includes("*")) continue; // 前缀说明，非端点
    // 文档里允许省略 `/api` 前缀（简写，如 `/admin/media/{id}`）——两种都试。
    const candidates = rawPath.startsWith("/api") || rawPath.startsWith("/emby") || rawPath.startsWith("/jellyfin")
      ? [rawPath]
      : [rawPath, `/api${rawPath}`];
    const keys = candidates.map((p) => `${method} ${normPath(p)}`);
    const hit = keys.find((k) => known.has(k));
    checked.push(hit ?? keys[0]);
    if (!hit) {
      missing.push({ file: path.relative(ROOT, file), key: keys.join(" | ") });
    }
  }
}

const uniqChecked = new Set(checked);
console.log(`契约文档端点引用: ${checked.length} 处（去重 ${uniqChecked.size}）`);
console.log(`清单端点: ${eps.length} | 整篇豁免文件: ${exemptCount}`);

if (missing.length) {
  console.error(`\n✗ ${missing.length} 处文档登记的端点不在契约清单：`);
  for (const { file, key } of missing) console.error(`  ${file}: ${key}`);
  console.error(
    "\n处置：要么后端确实没有该端点（文档写错 → 删/改），\n" +
      "要么清单漏登记（→ 在主仓跑 check-contract-sync --write，勿手改 endpoints）。",
  );
  process.exit(1);
}

console.log("\nDOC PATHS PASSED: 文档登记的每个端点都能在契约清单中找到。");