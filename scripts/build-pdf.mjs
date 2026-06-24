// 生成简历 PDF：从 lib/data.ts 读数据 → 拼成干净的 Markdown → 渲染成专业排版的 PDF。
// 思路：和网站「终端风」完全分开——PDF 走标准文档排版（白底、清晰字体层次、A4）。
// 运行：  node scripts/build-pdf.mjs        （或 pnpm pdf）
// 产物：  resume.md（Markdown 源）+ public/resume.pdf（部署后可在 /resume.pdf 下载）
//
// 说明：Node 22+ 原生支持直接 import .ts（自动擦除类型），所以能直接读 lib/data.ts，
// 数据永远和网站同源——改了 lib/data.ts 重新跑一次本脚本即可刷新 PDF。
import { RESUME } from "../lib/data.ts";
import { pickLang } from "../lib/i18n.ts";
import MarkdownIt from "markdown-it";
import { writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const lang = "zh"; // PDF 主语言（中文）；以后要英文版把这里改成 "en" 再跑一次即可
const L = (v) => pickLang(v, lang);
const date = (d) => d.replace("Present", "至今"); // 日期里的英文 Present 在中文 PDF 里显示「至今」

// ── 1) 把数据拼成 Markdown ───────────────────────────────────────────────────
const h = RESUME.hero;
const md = [];
md.push(`# ${L(h.name)}　${h.name.en}`);
md.push(`<div class="subtitle">${L(h.role)}</div>`);
md.push(`<div class="meta">${L(h.location)}　·　${RESUME.contact.email}</div>`);
md.push(`<div class="tagline">${L(h.tagline)}</div>`);
md.push("");

md.push("## 关于");
for (const p of RESUME.about[lang]) md.push(p); // 段落里的 **加粗** 由 markdown 渲染
md.push("");

md.push("## 技能");
for (const g of RESUME.skills) {
  const items = g.items.map((it) => pickLang(it, lang)).join(" · ");
  md.push(`- **${L(g.cat)}**　${items}`);
}
md.push("");

md.push("## 工作经历");
for (const x of RESUME.experience) {
  md.push(`### ${L(x.role)} · ${L(x.company)} <span class="date">${date(x.date)}</span>`);
  for (const b of x.bullets[lang]) md.push(`- ${b}`);
  md.push("");
}

md.push("## 亮点");
for (const hl of RESUME.highlights) {
  const badge = hl.badge ? `（${L(hl.badge)}）` : "";
  md.push(`### ${L(hl.title)}${badge} <span class="date">${date(hl.date)}</span>`);
  let desc = L(hl.desc);
  if (hl.link) desc += `　[${hl.link.replace(/^https?:\/\//, "")}](${hl.link})`;
  md.push(desc);
  md.push("");
}

md.push("## 教育");
for (const e of RESUME.education) {
  md.push(`### ${L(e.school)} <span class="date">${date(e.date)}</span>`);
  md.push(L(e.degree) + (e.extra ? `　·　${L(e.extra)}` : ""));
  md.push("");
}

const mdText = md.join("\n");
writeFileSync(join(ROOT, "resume.md"), mdText);

// ── 2) Markdown → HTML（套一份干净的简历排版 CSS）────────────────────────────
const CSS = `
  @page { size: A4; margin: 15mm 17mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Noto Sans SC", system-ui, -apple-system, Arial, sans-serif;
    color: #1b1b1b; font-size: 10.5pt; line-height: 1.55; margin: 0;
  }
  h1 { font-size: 21pt; margin: 0 0 3px; font-weight: 700; letter-spacing: .3px; }
  .subtitle { color: #0b6b7a; font-weight: 600; font-size: 11.5pt; }
  .meta { color: #555; font-size: 9.5pt; margin-top: 3px; }
  .tagline { color: #444; margin-top: 8px; font-size: 10pt; }
  h2 {
    font-size: 11pt; color: #0b6b7a; font-weight: 700; letter-spacing: 1.5px;
    text-transform: uppercase; margin: 18px 0 7px; padding-bottom: 3px;
    border-bottom: 1.5px solid #0b6b7a;
  }
  h3 { font-size: 10.5pt; font-weight: 700; margin: 11px 0 1px; }
  h3 .date { float: right; font-weight: 400; color: #777; font-size: 9.5pt; letter-spacing: .2px; }
  ul { margin: 4px 0 9px; padding-left: 17px; }
  li { margin: 2.5px 0; }
  p { margin: 4px 0; }
  strong { color: #0e0e0e; font-weight: 600; }
  a { color: #0b6b7a; text-decoration: none; }
  /* 区块尽量不要被分页从中间切断 */
  h2, h3 { break-after: avoid; page-break-after: avoid; }
  li, p { break-inside: avoid; }
`;
const mdit = new MarkdownIt({ html: true, linkify: true, breaks: false });
const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>${L(h.name)} resume</title><style>${CSS}</style></head><body>${mdit.render(mdText)}</body></html>`;
const htmlPath = join(tmpdir(), "resume-render.html");
writeFileSync(htmlPath, html);

// ── 3) HTML → PDF（用系统 Chrome 的打印引擎）────────────────────────────────
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
