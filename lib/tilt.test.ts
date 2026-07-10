import { describe, expect, it } from "vitest";
import { calculateTilt } from "./tilt";

describe("calculateTilt", () => {
  const bounds = { left: 100, top: 50, width: 200, height: 100 };

  it("returns zero rotation at the center", () => {
    expect(calculateTilt({ pointerX: 200, pointerY: 100, bounds })).toEqual({
      rotateX: 0,
      rotateY: 0,
    });
  });

  it("maps the top-right corner to the configured maximum", () => {
    expect(calculateTilt({ pointerX: 300, pointerY: 50, bounds, maxAngle: 6 })).toEqual({
      rotateX: 6,
      rotateY: 6,
    });
  });

  it("clamps pointers outside the element", () => {
    expect(calculateTilt({ pointerX: 999, pointerY: 999, bounds, maxAngle: 4 })).toEqual({
      rotateX: -4,
      rotateY: 4,
    });
  });

  it("falls back to zero for invalid dimensions", () => {
    expect(
      calculateTilt({
        pointerX: 1,
        pointerY: 1,
        bounds: { ...bounds, width: 0 },
      })
    ).toEqual({ rotateX: 0, rotateY: 0 });
  });
});
