import { describe, expect, it } from "vitest";
import { readingMinutes, sanitizeRichText } from "./rich-text.js";

describe("sanitizeRichText", () => {
  it("removes active content and unsafe link protocols", () => {
    const output = sanitizeRichText(
      '<p>Safe</p><script>alert(1)</script><a href="javascript:alert(2)">unsafe</a><a href="https://example.com" target="_blank">safe link</a>',
    );
    expect(output).not.toMatch(/script|javascript:/i);
    expect(output).toContain('href="https://example.com"');
    expect(output).toContain('rel="noopener noreferrer"');
  });

  it("calculates a bounded reading time from actual text", () => {
    expect(readingMinutes("<p>Short article.</p>")).toBe(1);
    expect(readingMinutes(`<p>${"word ".repeat(441)}</p>`)).toBe(3);
  });
});
