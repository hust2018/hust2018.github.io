#!/usr/bin/env node
/**
 * 一键部署脚本：pnpm deploy
 * ---------------------------------------------------------------------------
 * 把「写完新简报 → 发布到线上」这一整套流程自动化。之前每次都要手动敲的步骤：
 *
 *   1. 校验   检查 content/posts/ 下每篇文章的 frontmatter 是否完整（缺字段会让构建失败）
 *   2. 测试   pnpm test —— 单元测试全过才继续
 *   3. 构建   pnpm build —— 生成静态站点到 out/
 *   4. 提交   把新增/修改的文章提交到 main 分支并推送（源码备份）
 *   5. 部署   把 out/ 的构建产物强推到 gh-pages 分支（GitHub Pages 从这里取内容）
 *   6. 触发   调 GitHub API 触发 Pages 构建（推 gh-pages 不会自动触发，必须手动 POST）
 *   7. 验证   等构建完成，抓线上页面确认真的更新了
 *
 * 设计原则：**任何一步失败就立刻停止**（fail fast）。宁可不发布，也不要把
 * 构建失败的半成品或没通过测试的内容推到公开线上。
 *
 * 用法：
 *   pnpm deploy                    # 完整流程
 *   pnpm deploy --dry-run          # 演练：只跑校验/测试/构建，不推送任何东西
 *   pnpm deploy -m "自定义提交信息"  # 自定义 commit message
 */

import { execSync, execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// ── 配置 ────────────────────────────────────────────────────────────────────
const REPO = "hust2018/hust2018.github.io";          // GitHub 仓库
const REMOTE = `https://github.com/${REPO}.git`;
const SITE = "https://www.lijianglei.com";            // 线上站点（用于最后验证）
const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const OUT_DIR = path.join(process.cwd(), "out");
// frontmatter 必填字段：与 lib/posts.ts 的校验保持一致，缺任何一个都会让 build 抛错
const REQUIRED_FIELDS = ["title", "description", "date", "lang"];

// ── 命令行参数 ──────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const DRY_RUN = argv.includes("--dry-run");
const msgIdx = Math.max(argv.indexOf("-m"), argv.indexOf("--message"));
const CUSTOM_MSG = msgIdx >= 0 ? argv[msgIdx + 1] : null;

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

// ═══ 1. 校验 frontmatter ════════════════════════════════════════════════════
// 为什么放在最前面：lib/posts.ts 会对每篇文章做必填字段校验，缺字段直接 throw，
// 导致 build 失败。与其等构建跑到一半报错，不如先在这里一次性列出所有问题文件。
step("校验文章 frontmatter");
const mdFiles = fs.existsSync(POSTS_DIR)
  ? fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md") && !f.startsWith("_"))
  : [];
const badFiles = [];
for (const f of mdFiles) {
  const text = fs.readFileSync(path.join(POSTS_DIR, f), "utf8");
  if (!text.startsWith("---")) {
    badFiles.push(`${f} —— 没有 YAML frontmatter（文件必须以 --- 开头）`);
    continue;
  }
  // 取出两个 --- 之间的 frontmatter 区块
  const end = text.indexOf("\n---", 3);
  const fm = end === -1 ? "" : text.slice(3, end);
  const missing = REQUIRED_FIELDS.filter((k) => !new RegExp(`^${k}:`, "m").test(fm));
  if (missing.length) badFiles.push(`${f} —— 缺少字段: ${missing.join(", ")}`);
}
if (badFiles.length) {
  badFiles.forEach((b) => console.error(`    ${c.red("✗")} ${b}`));
  die(`${badFiles.length} 篇文章 frontmatter 不合规，修好再发布`);
}
ok(`${mdFiles.length} 篇文章全部合规`);

// ═══ 2. 查看待发布内容 ══════════════════════════════════════════════════════
step("检查待发布的改动");
const status = capture("git status --porcelain");
const changedPosts = status
  .split("\n")
  .filter(Boolean)
  .map((l) => l.slice(3).replace(/^"|"$/g, ""))
  .filter((p) => p.startsWith("content/posts/") && p.endsWith(".md"));

if (changedPosts.length === 0) {
  warn("没有新增或修改的文章");
  info("（仍会重新构建部署，用于发布代码/样式类改动）");
} else {
  ok(`发现 ${changedPosts.length} 篇待发布文章：`);
  changedPosts.forEach((p) => info(`  · ${path.basename(p)}`));
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

// ═══ 4. 构建 ════════════════════════════════════════════════════════════════
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
  console.log(`\n${c.yellow("● 演练模式（--dry-run）")}：校验/测试/构建均已通过，未推送任何内容。\n`);
  process.exit(0);
}

// ═══ 5. 提交并推送 main（源码）══════════════════════════════════════════════
step("提交源码到 main 分支");
if (status.trim() === "") {
  info("工作区干净，无需提交");
} else {
  // 只提交文章；其它零散改动（如 AGENTS.md）保持不动，避免误提交
  if (changedPosts.length) {
    execFileSync("git", ["add", ...changedPosts], { stdio: "inherit" });
    const names = changedPosts.map((p) => path.basename(p, ".md").replace("daily-brief-", ""));
    const msg =
      CUSTOM_MSG ||
      `content: add daily briefs ${names.length > 1 ? `${names[0]} through ${names[names.length - 1]}` : names[0]}`;
    execFileSync(
      "git",
      ["commit", "-m", `${msg}\n\nCo-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`],
      { stdio: "inherit" },
    );
    ok("已提交");
  } else {
    info("没有文章改动需要提交（其它未跟踪文件保持原样）");
  }
}
// 本地有领先提交才推送
const ahead = capture("git rev-list --count origin/main..HEAD");
if (Number(ahead) > 0) {
  run("git push origin main");
  ok(`已推送 ${ahead} 个提交到 main`);
} else {
  info("main 无新提交可推");
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
  if (s === "built") { built = true; break; }
  if (s === "errored") die("GitHub Pages 构建报错，去仓库 Settings → Pages 查看详情");
}
if (!built) {
  warn("等待超时（2 分钟），构建可能仍在进行，稍后手动确认线上是否更新");
  process.exit(0);
}
ok("Pages 构建完成");

step("验证线上内容");
// 抽查最新一篇文章：从本次改动里取日期最大的那篇
const latest = changedPosts.map((p) => path.basename(p, ".md")).sort().pop();
if (latest) {
  try {
    const html = capture(`curl -sL "${SITE}/blog/${latest}/?_=${Date.now()}"`);
    html.includes("每日商业与科技简报")
      ? ok(`${SITE}/blog/${latest}/ 已上线`)
      : warn("线上页面暂未看到内容（可能是 CDN 缓存，稍后再看）");
  } catch {
    warn("验证请求失败，请手动打开站点确认");
  }
} else {
  ok(`站点已更新：${SITE}`);
}

console.log(`\n${c.green(c.bold("🎉 部署完成"))}  ${SITE}\n`);
