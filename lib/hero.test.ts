import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Hero } from "../components/Hero";
import { RESUME } from "./data";

// renderToStaticMarkup 把组件渲染成一段 HTML 字符串（和构建时生成静态页面是同一回事），
// 不会执行 useEffect，所以这里测的是「首屏的静态内容对不对」，不涉及动画。
describe("Hero", () => {
  it("renders the name, the portrait and its identity label", () => {
    const html = renderToStaticMarkup(createElement(Hero, { lang: "zh", live: true }));

    expect(html).toContain("李姜磊");
    expect(html).toContain('alt="李姜磊的头像"');
    expect(html).toContain("ID_0001");
    // 旧版的 3D 终端甲板已经移除
    expect(html).not.toContain("hero-deck");
  });

  it("localizes the name and the portrait alternative text", () => {
    const html = renderToStaticMarkup(createElement(Hero, { lang: "en", live: true }));

    expect(html).toContain("Jianglei Li");
    expect(html).toContain('alt="Portrait of Jianglei Li"');
  });

  it("shows the current status from the résumé data", () => {
    const html = renderToStaticMarkup(createElement(Hero, { lang: "zh", live: false }));

    // 直接和数据里的状态比对，而不是把文案写死在测试里：以后改状态不用再改这个测试。
    expect(html).toContain(RESUME.hero.status.zh);
  });
});
