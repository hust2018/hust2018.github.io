import { describe, it, expect } from "vitest";
import { renderMarkdown } from "./markdown";

describe("renderMarkdown", () => {
  it("renders gfm + heading anchors", async () => {
    const { html } = await renderMarkdown("## Hello\n\n- [x] done\n");
    expect(html).toMatch(/<h2[^>]*id="hello"/);
    expect(html).toContain("heading-anchor");
  });
  it("renders math to katex HTML at build", async () => {
    const { html } = await renderMarkdown("$E = mc^2$");
    expect(html).toContain("katex");
  });
  it("highlights code via shiki (inline styles, no client js)", async () => {
    const { html } = await renderMarkdown("```ts\nconst x = 1;\n```\n");
    expect(html).toMatch(/data-rehype-pretty-code-figure|data-line/);
  });
  it("lifts mermaid fences out of shiki into <pre class=mermaid> and flags hasMermaid", async () => {
    const { html, hasMermaid } = await renderMarkdown("```mermaid\ngraph TD; A-->B;\n```\n");
    expect(hasMermaid).toBe(true);
    expect(html).toMatch(/<pre class="mermaid">/);
    expect(html).toContain("graph TD");
    expect(html).not.toMatch(/data-rehype-pretty-code/); // not sent to shiki
  });
  it("hasMermaid is false without a diagram", async () => {
    const { hasMermaid } = await renderMarkdown("plain text");
    expect(hasMermaid).toBe(false);
  });
});
