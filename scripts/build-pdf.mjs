// 生成简历 PDF：复用 resume-html.mjs 的内容（和加密页同源），用系统 Chrome 渲染成专业排版 PDF。
// 运行：  node scripts/build-pdf.mjs        （或 pnpm pdf）
// 产物：  resume.md（Markdown 源）+ public/resume.pdf
import { buildResumeMarkdown, buildResumeHtml } from "./resume-html.mjs";
import { writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const lang = "zh"; // 主语言（要英文版改成 "en" 再跑一次即可）

writeFileSync(join(ROOT, "resume.md"), buildResumeMarkdown(lang));

const htmlPath = join(tmpdir(), "resume-render.html");
writeFileSync(htmlPath, buildResumeHtml(lang));

const CHROME =
  process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
mkdirSync(join(ROOT, "public"), { recursive: true });
const pdfPath = join(ROOT, "public", "resume.pdf");
execFileSync(
  CHROME,
  ["--headless=new", "--disable-gpu", "--no-pdf-header-footer", `--print-to-pdf=${pdfPath}`, `file://${htmlPath}`],
  { stdio: "ignore" }
);

console.log("✓ 生成完成：resume.md + public/resume.pdf");
