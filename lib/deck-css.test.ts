import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const css = fs.readFileSync(path.join(process.cwd(), "app", "globals.css"), "utf8");

function blockFor(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return css.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\}`))?.[1] ?? "";
}

function zIndex(selector: string): number {
  return Number(blockFor(selector).match(/z-index:\s*(-?\d+)/)?.[1]);
}

function translateDepth(selector: string): number {
  const block = blockFor(selector);
  const translateZ = block.match(/translateZ\(\s*(-?\d+)px\s*\)/)?.[1];
  const translate3d = block.match(/translate3d\([^,]+,[^,]+,\s*(-?\d+)px\s*\)/)?.[1];
  return Number(translateZ ?? translate3d);
}

describe("terminal deck stacking", () => {
  it("keeps the connector line and nodes behind the identity panel", () => {
    const identityDepth = translateDepth(".deck-panel-id");
    const identityZ = zIndex(".deck-panel-id");

    for (const selector of [".deck-laser", ".deck-node"]) {
      expect(translateDepth(selector)).toBeLessThan(identityDepth);
      expect(zIndex(selector)).toBeLessThan(identityZ);
    }
  });
});
