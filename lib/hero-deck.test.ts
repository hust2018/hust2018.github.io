import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HeroDeck } from "../components/HeroDeck";

describe("HeroDeck", () => {
  it("keeps the portrait accessible while hiding decorative telemetry", () => {
    const html = renderToStaticMarkup(createElement(HeroDeck, { lang: "zh" }));

    expect(html).toContain('alt="李姜磊的头像"');
    expect(html).toContain("ID_0001");
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("AGENT STATUS");
  });

  it("localizes the portrait alternative text", () => {
    const html = renderToStaticMarkup(createElement(HeroDeck, { lang: "en" }));

    expect(html).toContain('alt="Portrait of Jianglei Li"');
  });
});
