import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ResumeApp } from "../components/ResumeApp";
import { RESUME, SECTIONS } from "./data";

// 整页冒烟测试：把首页完整渲染成 HTML 字符串（等同于构建时的静态渲染），
// 确认每个区块都在、关键内容都出现。它抓的是「改着改着某个区块渲染不出来了」这类问题。
describe("ResumeApp (static render)", () => {
  const html = renderToStaticMarkup(createElement(ResumeApp));

  it("renders every section listed in SECTIONS, in order", () => {
    let cursor = 0;
    for (const section of SECTIONS) {
      const at = html.indexOf(`id="${section.id}"`, cursor);
      expect(at, `section ${section.id}`).toBeGreaterThan(-1);
      cursor = at;
    }
  });

  it("lists every experience entry, newest first", () => {
    let cursor = 0;
    for (const item of RESUME.experience) {
      const name = item.company.zh.split(" · ")[0];
      const at = html.indexOf(name, cursor);
      expect(at, `company ${name}`).toBeGreaterThan(-1);
      cursor = at;
    }
  });

  it("keeps the résumé reachable without JavaScript", () => {
    // 这些内容都直接写在静态 HTML 里，不依赖脚本运行。
    expect(html).toContain('href="/resume.pdf"');
    expect(html).toContain(`mailto:${RESUME.contact.email}`);
    expect(html).toContain('lang="en"'); // 名字下方那行另一种语言的名字
  });

  it("starts with the wechat QR code collapsed", () => {
    expect(html).toMatch(/<figure class="wechat-qr" id="wechat-qr" hidden=""/);
  });
});
