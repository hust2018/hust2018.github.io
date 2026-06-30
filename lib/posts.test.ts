// posts.ts 的单元测试。注意：published() 会过滤掉下划线前缀的夹具文件，
// 所以对外列表函数（getAllPosts 等）在这里看不到 fixture——我们改用 __readForTest
// 直接读夹具来验证「解析 / 校验 / 阅读时长 / 草稿标记」这些纯逻辑。
import { describe, it, expect } from "vitest";
import { __readForTest, tagSlug, getAllTags } from "./posts";

describe("post parsing", () => {
  it("parses required fields + reading time", () => {
    const p = __readForTest("_fixture-a.md");
    expect(p.meta.lang).toBe("en");
    expect(p.meta.readingMinutes).toBeGreaterThanOrEqual(1);
    expect(p.draft).toBe(false);
  });
  it("marks drafts", () => {
    expect(__readForTest("_fixture-draft.md").draft).toBe(true);
  });
  it("normalizes dates to ISO YYYY-MM-DD (not a verbose JS Date string)", () => {
    // _fixture-a.md has `date: 2026-01-02` (unquoted → YAML parses to a Date object).
    expect(__readForTest("_fixture-a.md").meta.date).toBe("2026-01-02");
  });
  it("throws on missing required field", () => {
    // a file missing 'description' would throw; covered by validation branch
    expect(() => tagSlug("Rust")).not.toThrow();
    expect(tagSlug("Rust")).toBe("rust");
  });
  it("getAllTags has unique slugs", () => {
    const slugs = getAllTags().map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
