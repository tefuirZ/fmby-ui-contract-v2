#!/usr/bin/env node
// gen-domain-docs.mjs —— 从机器清单 `contracts/api-fields.json` 生成「缺失端点」的域文档表。
//
// 为什么要有它（2026-11-04）：
//   契约仓是**给别人写 WebUI 用的**。机器清单（api-fields.json）一直是准的，
//   但人读文档只覆盖 71%（483 中 342）——剩 141 个端点没有任何 md，接入方只能读源码。
//   手抄 141 行既慢又会再次腐化；**清单是机器真源**，故由它驱动生成，未来可重跑。
//
// 定位与边界（不越权）：
//   - 只生成 **`method /path` + 请求/响应类型 + 字段名**（这些清单里有，机械可靠）；
//   - **不编造语义**（何时调用、边界、错误码、能力门）——那些留给人工补充，
//     生成段落以 `> ⚠️ 自动生成` 明示，避免读者误以为已有人写语义；
//   - **幂等**：已含该路径的文档不会被重复写入（重跑只补新增端点）。
//
// 用法：
//   node scripts/gen-domain-docs.mjs            # 干跑，打印将补的族与端点数
//   node scripts/gen-domain-docs.mjs --write    # 实际写文件
//
// 生成结果必须过 `node scripts/check-doc-paths.mjs`（它校验文档端点都在清单里）。

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MANIFEST = path.join(ROOT, "contracts", "api-fields.json");
const MANAGEDIR = path.join(ROOT, "api", "domains", "manage");
const WRITE = process.argv.includes("--write");

const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
const eps = Array.isArray(manifest) ? manifest : manifest.endpoints;

const norm = (p) => p.split("?")[0].replace(/\{[^}]*\}/g, "{}");

// 已有全部文档正文（用于判断某端点是否已登记）
function allDocsText() {
  const out = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".md")) out.push(fs.readFileSync(p, "utf8"));
    }
  })(path.join(ROOT, "api"));
  return out.join("\n");
}
// ★归一化：文档里写 `{id}`、清单里也是 `{id}`，但参数名可能不同 ⇒ 两侧统一成 `{}`
const existing = allDocsText().replace(/\{[^}]*\}/g, "{}");

const hasDoc = (e) => existing.includes(norm(e.path));

// 族：/api/manage/<seg> 或 /api/<seg>
function familyOf(p) {
  const seg = p.split("/").filter(Boolean);
  if (seg[0] !== "api") return null;
  if (seg[1] === "manage" && seg[2]) return `manage/${seg[2]}`;
  if (seg[1] === "admin" && seg[2]) return `admin/${seg[2]}`;
  if (seg[1]) return seg[1];
  return null;
}

const missing = eps.filter((e) => !hasDoc(e));
/** @type {Map<string, typeof eps>} */
const byFam = new Map();
for (const e of missing) {
  const f = familyOf(e.path);
  if (!f) continue;
  if (!byFam.has(f)) byFam.set(f, []);
  byFam.get(f).push(e);
}

function fields(t, arr) {
  if (!t) return "—";
  if (!Array.isArray(arr) || !arr.length) return `\`${t}\``;
  const shown = arr.slice(0, 12).join(", ");
  const more = arr.length > 12 ? `, …(共${arr.length})` : "";
  return `\`${t}\`{${shown}${more}}`;
}

function table(list) {
  const rows = [...list].sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));
  const lines = ["| 方法 路径 | 请求 | 响应 |", "|---|---|---|"];
  for (const e of rows) {
    lines.push(`| \`${e.method} ${e.path}\` | ${fields(e.requestType, e.requestFields)} | ${fields(e.responseType, e.responseFields)} |`);
  }
  return lines.join("\n");
}

const AUTO_NOTE =
  "> ⚠️ **本表由 `contracts/api-fields.json` 机械生成**（`scripts/gen-domain-docs.mjs`，可重跑）——\n" +
  "> 保证「端点 / 字段名」与后端 DTO 一致；**语义、边界、错误码、能力门待人补充**。\n" +
  "> 需要接口何时调用、失败如何分流，请连同源码一起确认后再补写。";

// 族 → 语义域桶（避免 24 个碎片文件；给接入方的是「按域读」的文档）
const BUCKET = {
  "manage/microsoft": "microsoft",
  "manage/upstreams": "upstreams",
  "manage/operations": "operations", "manage/scans": "operations", "manage/events": "operations",
  "manage/runtime-log-archives": "operations", "manage/runtime-logs": "operations",
  "manage/system": "operations", "manage/cdn-probe": "operations",
  "manage/ai-interventions": "integrations", "manage/announcements": "integrations",
  "manage/notifications": "integrations", "announcements": "integrations", "notifications": "integrations",
  "manage/telegram-bot": "integrations", "manage/auth-providers": "integrations",
  "admin/cas": "admin", "admin/asset": "admin",
};
const TITLES = {
  microsoft: "Microsoft 365（授权 / 账号池 / 挂载面）",
  upstreams: "上游源（Upstream 接入 / 映射 / Apple CMS）",
  operations: "运维面（任务 / 事件 / 运行日志 / 探测）",
  integrations: "集成面（公告 / 通知 / Telegram / AI 辅助 / 登录方式）",
  admin: "admin 面（CAS / 资产下载）",
  misc: "其他（迁移 / 开发者 / 高级动作 / 密钥 / 积分等）",
};

/** @type {Map<string, typeof eps>} */
const buckets = new Map();
for (const [fam, list] of byFam) {
  const b = BUCKET[fam] ?? "misc";
  if (!buckets.has(b)) buckets.set(b, []);
  buckets.get(b).push(...list);
}

const targets = [...buckets.entries()].sort((a, b) => b[1].length - a[1].length);
let totalN = 0;
console.log(`未登记端点 ${missing.length} 个，涉及 ${targets.length} 个族：\n`);
for (const [fam, list] of targets) {
  totalN += list.length;
  console.log(`  ${String(list.length).padStart(4)}  ${fam}`);
}

if (!WRITE) {
  console.log(`\n（干跑）加 --write 将生成 ${targets.length} 个文件，覆盖 ${totalN} 个端点。`);
  process.exit(0);
}

let wrote = 0;
for (const [bucket, list] of targets) {
  const file = path.join(MANAGEDIR, `${bucket}.md`);
  const title = TITLES[bucket] ?? bucket;
  // 桶内按族分小节（读起来是「按域 → 按族 → 端点表」）
  const fams = new Map();
  for (const e of list) {
    const f = familyOf(e.path) ?? "其他";
    if (!fams.has(f)) fams.set(f, []);
    fams.get(f).push(e);
  }
  const body = [...fams.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([f, l]) => `### ${f}\n\n${table(l)}`)
    .join("\n\n");
  const header =
    `# API · 管理面 · ${title}\n\n` +
    `> 由清单自动生成的端点登记。**语义待人补**（何时调用 / 边界 / 错误码 / 能力门）。\n\n---\n\n` +
    `${AUTO_NOTE}\n\n本文件共 **${list.length}** 个端点。\n\n${body}\n`;

  if (fs.existsSync(file)) {
    const cur = fs.readFileSync(file, "utf8");
    const curNorm = cur.replace(/\{[^}]*\}/g, "{}");
    const add = list.filter((e) => !curNorm.includes(norm(e.path)));
    if (!add.length) { console.log(`跳过 ${bucket}（已齐）`); continue; }
    fs.appendFileSync(file, `\n\n---\n\n## 自动补登（新增 ${add.length} 端点）\n\n${table(add)}\n`);
    console.log(`追加 ${add.length} 端点 → ${path.relative(ROOT, file)}`);
  } else {
    fs.writeFileSync(file, header);
    console.log(`新建 ${path.relative(ROOT, file)}（${list.length} 端点）`);
  }
  wrote++;
}
console.log(`\n已写 ${wrote} 个文件。下一步：node scripts/check-doc-paths.mjs`);
