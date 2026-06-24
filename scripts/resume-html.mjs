// 共享模块：从 lib/data.ts 生成简历的 Markdown 和「干净文档版」HTML。
// 给 PDF（build-pdf.mjs）和加密页（build-encrypted.mjs）共用，保证两边内容一致、单一数据源。
// Node 22+ 原生支持直接 import .ts（自动擦除类型），所以能直接读 lib/data.ts。
import { RESUME } from "../lib/data.ts";
import { pickLang } from "../lib/i18n.ts";
import MarkdownIt from "markdown-it";

const date = (d) => d.replace("Present", "至今"); // 中文里把英文 Present 显示为「至今」

// 把简历数据拼成干净的 Markdown 字符串。
export function buildResumeMarkdown(lang = "zh") {
  const L = (v) => pickLang(v, lang);
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
  return md.join("\n");
}

// 一份干净的简历排版 CSS（白底、清晰层次）。@page 控制纸张打印；@media screen 控制屏幕（加密页）。
export const RESUME_CSS = `
  @page { size: A4; margin: 15mm 17mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Noto Sans SC", system-ui, -apple-system, Arial, sans-serif;
    color: #1b1b1b; font-size: 10.5pt; line-height: 1.55; margin: 0; background: #fff;
  }
  /* 屏幕上（加密页）居中成一列；纸张打印交给 @page，不受这条影响 */
  @media screen { body { max-width: 820px; margin: 28px auto; padding: 0 22px; } }
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
  h2, h3 { break-after: avoid; page-break-after: avoid; }
  li, p { break-inside: avoid; }
`;

// 完整的单页 HTML（自带样式，自包含；noindex 防收录）。
export function buildResumeHtml(lang = "zh") {
  const mdText = buildResumeMarkdown(lang);
  const mdit = new MarkdownIt({ html: true, linkify: true, breaks: false });
  const title = `${pickLang(RESUME.hero.name, lang)} resume`;
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>${title}</title><style>${RESUME_CSS}</style></head><body>${mdit.render(mdText)}</body></html>`;
}
