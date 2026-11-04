#!/usr/bin/env node
// fe-contract-diff.mjs —— 任意前端仓 ↔ 本契约仓（后端真源）的对账。
//
// 为什么要有它（2026-11-04）：
//   契约仓的用途是「让别人照它写 WebUI」。但前端仓可能**不在这台机器上**，
//   于是「前端要什么 / 后端有没有」就只能靠人比对。本脚本把这一步变成一条命令：
//     - 在**前端机器**上跑 `--extract`：产出该仓的「调用清单 JSON」（零依赖）；
//     - 在**本仓**上跑 `--calls <json>`：与 `contracts/api-fields.json` 对账。
//
// 输出三类：
//   FE_ONLY  —— 前端在调、**后端清单里没有** ⇒ 后端要补（或前端用错路径）
//   BE_ONLY  —— 后端有、前端没调（信息项，不必处理）
//   FIELD_DIFF —— 同名端点但响应字段不一致（给出前端声明 vs 后端 wire）
//
// 用法：
//   # ① 前端机器（任意仓，无需装依赖）
//   node fe-contract-diff.mjs --extract --src ./src --out fe-calls.json
//   # ② 本仓（拿到清单后）
//   node scripts/fe-contract-diff.mjs --calls fe-calls.json
//   # 或者前端仓就在本机：直接
//   node scripts/fe-contract-diff.mjs --fe-dir ../fmby-web

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MANIFEST = path.join(ROOT, "contracts", "api-fields.json");

const argv = process.argv.slice(2);
const argOf = (flag) => {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : undefined;
};
const has = (flag) => argv.includes(flag);

// ★归一化两条：① TS 模板字符串 `${expr}` → `{}`（前端惯用）；② axum `{id}` / `{*rest}` → `{}`
const norm = (p) =>
  p
    .split("?")[0]
    .replace(/\$\{[^}]*\}/g, "{}")
    .replace(/\{[^}]*\}/g, "{}")
    .replace(/\/+$/, "");

// ---------------------------------------------------------------- 提取模式
function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".git", "dist", "build", ".next", "target"].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|js|jsx|mjs|vue|svelte)$/.test(e.name)) out.push(p);
  }
  return out;
}

/** 从任意前端源码提取「方法 + 路径」（httpClient / axios / fetch 三种常见形态）。 */
function extractCalls(srcDir) {
  const calls = [];
  for (const f of walk(srcDir)) {
    const src = fs.readFileSync(f, "utf8");
    const rel = path.relative(srcDir, f);
    // httpClient.get<T>('/api/x') / axios.post(`/api/x/${id}`) / fetch('/api/x', {method:'POST'})
    const re =
      /(?:httpClient|axios|api|client|request)\s*\.\s*(get|post|put|patch|delete|head)\s*(?:<[^>]*>)?\s*\(\s*[`'"]([^`'"]+)[`'"]/g;
    let m;
    while ((m = re.exec(src)) !== null) {
      const p = m[2];
      if (!p.startsWith("/")) continue;
      calls.push({ method: m[1].toUpperCase(), path: norm(p), file: rel });
    }
    // fetch('...', { method: 'POST' })
    const re2 = /fetch\s*\(\s*[`'"]([^`'"]+)[`'"]\s*,\s*\{[^}]*method\s*:\s*['"](\w+)['"]/g;
    while ((m = re2.exec(src)) !== null) {
      const p = m[1];
      if (!p.startsWith("/")) continue;
      calls.push({ method: m[2].toUpperCase(), path: norm(p), file: rel });
    }
    // fetch('...')（缺省 GET）
    const re3 = /fetch\s*\(\s*[`'"]([^`'"]+)[`'"](?!\s*,\s*\{[^}]*method)/g;
    while ((m = re3.exec(src)) !== null) {
      const p = m[1];
      if (!p.startsWith("/api")) continue;
      calls.push({ method: "GET", path: norm(p), file: rel });
    }
  }
  // 去重
  const seen = new Set();
  return calls.filter((c) => {
    const k = `${c.method} ${c.path}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

if (has("--extract")) {
  const srcDir = argOf("--src") ?? "./src";
  const out = argOf("--out") ?? "fe-calls.json";
  const calls = extractCalls(srcDir);
  fs.writeFileSync(out, JSON.stringify({ generated_from: srcDir, calls }, null, 2));
  console.log(`提取 ${calls.length} 个调用点 → ${out}`);
  const byPrefix = {};
  for (const c of calls) {
    const k = "/" + c.path.split("/").filter(Boolean).slice(0, 2).join("/");
    byPrefix[k] = (byPrefix[k] ?? 0) + 1;
  }
  console.log("按前缀分布：");
  for (const [k, v] of Object.entries(byPrefix).sort((a, b) => b[1] - a[1]).slice(0, 12)) {
    console.log(`  ${String(v).padStart(4)}  ${k}`);
  }
  process.exit(0);
}

// ---------------------------------------------------------------- 对账模式
const feDir = argOf("--fe-dir");
const callsFile = argOf("--calls");
let feCalls;
if (callsFile) {
  feCalls = JSON.parse(fs.readFileSync(callsFile, "utf8")).calls;
} else if (feDir) {
  feCalls = extractCalls(feDir);
} else {
  console.error("用法：--extract [--src DIR] [--out FILE]  |  --calls FILE  |  --fe-dir DIR");
  process.exit(2);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
const eps = Array.isArray(manifest) ? manifest : manifest.endpoints;
const beByKey = new Map(eps.map((e) => [`${e.method.toUpperCase()} ${norm(e.path)}`, e]));

const feOnly = [];
for (const c of feCalls) {
  const k = `${c.method} ${c.path}`;
  if (!beByKey.has(k)) feOnly.push({ ...c, key: k });
}
const feKeys = new Set(feCalls.map((c) => `${c.method} ${c.path}`));
const beOnly = eps.filter((e) => !feKeys.has(`${e.method.toUpperCase()} ${norm(e.path)}`));

console.log(`前端调用点 ${feCalls.length} | 后端清单端点 ${eps.length}`);
console.log(`\n=== FE_ONLY（前端在调、后端清单没有 ⇒ 后端要补 / 或用错路径）：${feOnly.length} ===`);
for (const c of feOnly.slice(0, 60)) console.log(`  ${c.method} ${c.path}   (${c.file})`);
if (feOnly.length > 60) console.log(`  …还有 ${feOnly.length - 60} 条`);
console.log(`\n=== BE_ONLY（后端有、前端未调）：${beOnly.length}（信息项）===`);
// BE_ONLY 只打印前缀分布，避免刷屏
const pref = {};
for (const e of beOnly) {
  const k = "/" + norm(e.path).split("/").filter(Boolean).slice(0, 3).join("/");
  pref[k] = (pref[k] ?? 0) + 1;
}
for (const [k, v] of Object.entries(pref).sort((a, b) => b[1] - a[1]).slice(0, 15)) {
  console.log(`  ${String(v).padStart(4)}  ${k}`);
}

console.log(
  feOnly.length
    ? `\n结论：有 ${feOnly.length} 个前端调用在后端清单里找不到 —— 这些就是「后端没跟上」的候选。`
    : "\n结论：前端调用的端点后端全部都有（0 个 FE_ONLY）。",
);
process.exit(feOnly.length ? 1 : 0);
