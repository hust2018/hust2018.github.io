import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Hero } from "../components/Hero";

describe("Hero", () => {
  it("uses the spatial terminal deck instead of the flat photo frame", () => {
    const html = renderToStaticMarkup(createElement(Hero, { lang: "zh", booted: true }));

    expect(html).toContain('class="hero-deck"');
    expect(html).not.toContain('class="hero-photo"');
  });
});
