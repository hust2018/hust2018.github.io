import { describe, it, expect } from "vitest";
import { urlFor, SITE_URL } from "./site";

describe("urlFor", () => {
  it("makes an absolute trailing-slash URL from a path", () => {
    expect(urlFor("/blog")).toBe("https://www.lijianglei.com/blog/");
  });
  it("handles missing leading slash", () => {
    expect(urlFor("blog/rust")).toBe("https://www.lijianglei.com/blog/rust/");
  });
  it("is idempotent on an already-slashed path", () => {
    expect(urlFor("/blog/rust/")).toBe("https://www.lijianglei.com/blog/rust/");
  });
  it("returns the bare site root for '/'", () => {
    expect(urlFor("/")).toBe("https://www.lijianglei.com/");
  });
  it("SITE_URL has no trailing slash", () => {
    expect(SITE_URL.endsWith("/")).toBe(false);
  });
});
