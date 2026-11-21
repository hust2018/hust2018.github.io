#!/usr/bin/env node
/**
 * 一键部署脚本：pnpm publish-site
 * ---------------------------------------------------------------------------
 * 把「改完简历/代码 → 发布到线上」的流程串起来，避免源码、PDF、线上三边不同步：
 *
 *   1. 同步检查  确认 resume.md 和 public/resume.pdf 与 lib/data.ts 一致（不一致就先跑 pnpm pdf）
 *   2. 仓库检查  正式发布前确认工作区干净（先自己 commit，避免 main 悄悄落后于线上站点）
 *   3. 单元测试  pnpm test —— 单元测试全过才继续
 *   4. 构建站点  pnpm build —— 生成静态站点到 out/，并检查 GA 统计代码是否在产物里
 *   5. 推送源码  把 main 分支领先的提交推到 origin/main
 *   6. 部署页面  把 out/ 强推到 gh-pages 分支（GitHub Pages 从这里取内容）
 *   7. 触发构建  调 GitHub API 触发 Pages 构建（推 gh-pages 不会自动触发，必须手动 POST）
 *   8. 线上验证  等构建完成，抓线上首页确认真的更新了
 *
 * 设计原则：**任何一步失败就立刻停止**（fail fast）。宁可不发布，也不要把
 * 没通过测试、或没同步 PDF/源码的半成品推到公开线上。
 *
 * 用法：
 *   pnpm publish-site            # 完整发布流程
 *   pnpm publish-site --dry-run  # 演练：只跑同步检查 / 测试 / 构建，不推送任何东西
 */

import { execSync, execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { buildResumeMarkdown } from "./resume-html.mjs";
import { SITE_URL } from "../lib/site.ts";

// ── 配置 ────────────────────────────────────────────────────────────────────
const REPO = "hust2018/hust2018.github.io"; // GitHub 仓库
const REMOTE = `https://github.com/${REPO}.git`;
const SITE = SITE_URL; // 线上站点（用于最后验证）
const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "out");
const RESUME_MD = path.join(ROOT, "resume.md");
const RESUME_PDF = path.join(ROOT, "public", "resume.pdf");

// ── 命令行参数 ──────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const DRY_RUN = argv.includes("--dry-run");

// ── 小工具 ──────────────────────────────────────────────────────────────────
const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};
let stepNo = 0;
const step = (title) => console.log(`\n${c.bold(`[${++stepNo}] ${title}`)}`);
const ok = (msg) => console.log(`    ${c.green("✓")} ${msg}`);
const info = (msg) => console.log(`    ${c.dim(msg)}`);
const warn = (msg) => console.log(`    ${c.yellow("!")} ${msg}`);
// 失败即退出：打印原因并以非 0 退出码结束，后续步骤不会执行
const die = (msg) => {
  console.error(`\n${c.red("✗ 部署中止")}：${msg}\n`);
  process.exit(1);
};
// 跑命令；silent=true 时捕获输出不直接打印（用于只想拿结果的场景）
const run = (cmd, { silent = false, cwd } = {}) =>
  execSync(cmd, { stdio: silent ? "pipe" : "inherit", encoding: "utf8", cwd });
const capture = (cmd, cwd) => execSync(cmd, { encoding: "utf8", cwd }).trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ═══ 1. 校验 resume.md / public/resume.pdf 是否与 lib/data.ts 同步 ══════════
// 原因：网页直接读 lib/data.ts，但下载按钮用的是预先生成的 public/resume.pdf。
// 改了简历数据却忘了跑 pnpm pdf，会导致网页和下载下来的 PDF 内容对不上。
step("检查简历数据与 PDF 同步状态");
const expectedMd = buildResumeMarkdown("zh");
const currentMd = fs.existsSync(RESUME_MD) ? fs.readFileSync(RESUME_MD, "utf8") : "";
if (currentMd !== expectedMd) {
  die("resume.md 与 lib/data.ts 不一致，请先运行 pnpm pdf 重新生成简历文档和 PDF");
}
if (!fs.existsSync(RESUME_PDF)) {
  die("public/resume.pdf 不存在，请先运行 pnpm pdf 生成");
}
ok("resume.md 与 lib/data.ts 一致，public/resume.pdf 就绪");

// ═══ 2. 检查 git 工作区是否干净 ═════════════════════════════════════════════
// 原因：以前脚本会把未提交的改动直接构建推到 gh-pages，导致 main 悄悄落后于线上。
// 现在要求正式发布前工作区必须干净；演练模式（--dry-run）只提醒不阻断。
step("检查 git 工作区状态");
const status = capture("git status --porcelain");
if (status.trim() !== "") {
  const lines = status.split("\n").filter(Boolean);
  lines.forEach((l) => info(`  ${l}`));
  if (DRY_RUN) {
    warn(`发现 ${lines.length} 处未提交改动（演练模式继续执行，正式发布前请先 git commit）`);
  } else {
    die(`工作区有 ${lines.length} 处未提交改动，请先 git commit 后再发布，避免 main 落后于线上`);
  }
} else {
  ok("工作区干净");
}

// ═══ 3. 单元测试 ════════════════════════════════════════════════════════════
step("运行单元测试");
try {
  run("pnpm test", { silent: true });
  ok("测试全部通过");
} catch (e) {
  console.error(e.stdout || e.message);
  die("单元测试未通过");
}

// ═══ 4. 构建静态站点 ════════════════════════════════════════════════════════
step("构建静态站点");
try {
  run("pnpm build", { silent: true });
} catch (e) {
  console.error(e.stdout || e.message);
  die("构建失败");
}
if (!fs.existsSync(path.join(OUT_DIR, "index.html"))) die("构建产物 out/index.html 不存在");
// 冒烟检查：确认 GA 统计代码进了产物（历史上容易被误删/被覆盖，值得每次确认）
const indexHtml = fs.readFileSync(path.join(OUT_DIR, "index.html"), "utf8");
indexHtml.includes("G-E3PKHCXYBD")
  ? ok("构建成功（含 Google Analytics）")
  : warn("构建成功，但产物里没找到 GA 代码，请检查 app/layout.tsx");

if (DRY_RUN) {
  console.log(`\n${c.yellow("● 演练模式（--dry-run）")}：同步检查 / 测试 / 构建均已通过，未推送任何内容。\n`);
  process.exit(0);
}

// ═══ 5. 推送 main 分支源码 ══════════════════════════════════════════════════
step("推送源码到 main 分支");
const ahead = capture("git rev-list --count origin/main..HEAD");
if (Number(ahead) > 0) {
  run("git push origin main");
  ok(`已推送 ${ahead} 个提交到 main`);
} else {
  info("main 已与远端同步，无新提交可推");
}

// ═══ 6. 部署构建产物到 gh-pages ════════════════════════════════════════════
// 做法：把 out/ 变成一个「一次性的临时 git 仓库」，强推到 gh-pages 分支。
// 这样 gh-pages 只保存构建产物、不留历史，与 main 的源码历史完全隔离。
step("部署构建产物到 gh-pages");
fs.writeFileSync(path.join(OUT_DIR, ".nojekyll"), ""); // 告诉 Pages 别用 Jekyll 处理（否则 _next 目录会被忽略）
fs.rmSync(path.join(OUT_DIR, ".git"), { recursive: true, force: true });
run("git init -b gh-pages -q", { cwd: OUT_DIR, silent: true });
run("git add -A", { cwd: OUT_DIR, silent: true });
execFileSync("git", ["commit", "-q", "-m", `deploy: ${new Date().toISOString().slice(0, 10)}`], { cwd: OUT_DIR });
try {
  run(`git push --force -q ${REMOTE} gh-pages:gh-pages`, { cwd: OUT_DIR, silent: true });
  ok("构建产物已推送到 gh-pages");
} catch (e) {
  console.error(e.stdout || e.message);
  die("推送 gh-pages 失败");
}

// ═══ 7. 触发 GitHub Pages 构建 ═════════════════════════════════════════════
// 关键坑：推 gh-pages 分支「不会」自动触发 Pages 重新构建，必须手动 POST 这个 API。
step("触发 GitHub Pages 构建");
try {
  run(`gh api -X POST repos/${REPO}/pages/builds`, { silent: true });
  ok("构建已入队");
} catch (e) {
  console.error(e.stdout || e.message);
  die("触发 Pages 构建失败（检查 gh CLI 是否已登录：gh auth status）");
}

// ═══ 8. 等待并验证线上生效 ═════════════════════════════════════════════════
step("等待构建完成");
let built = false;
for (let i = 1; i <= 12; i++) {
  await sleep(10_000);
  let s = "";
  try {
    s = JSON.parse(capture(`gh api repos/${REPO}/pages/builds/latest`)).status;
  } catch {
    /* 偶发网络错误：忽略，下一轮继续 */
  }
  info(`第 ${i} 次检查: ${s || "(查询失败)"}`);
  if (s === "built") {
    built = true;
    break;
  }
  if (s === "errored") die("GitHub Pages 构建报错，去仓库 Settings → Pages 查看详情");
}
if (!built) {
  warn("等待超时（2 分钟），构建可能仍在进行，稍后手动确认线上是否更新");
  process.exit(0);
}
ok("Pages 构建完成");

step("验证线上首页");
try {
  const html = capture(`curl -sL "${SITE}/?_=${Date.now()}"`);
  html.includes("李姜磊")
    ? ok(`${SITE}/ 访问正常`)
    : warn("线上页面暂未看到预期内容（可能是 CDN 缓存，稍后再看）");
} catch {
  warn("验证请求失败，请手动打开站点确认");
}

console.log(`\n${c.green(c.bold("🎉 部署完成"))}  ${SITE}\n`);
