import assert from "node:assert/strict";
import { test } from "node:test";
import { sanitizeRichText, readingMinutes } from "./rich-text.js";

test("blog editor formatting survives sanitization while scripts, styles and unsafe links are removed", () => {
  const html = '<h2>Plan your trip</h2><h3>Prepare</h3><h4>Documents</h4><p><strong>Bring ID</strong> and <em>travel light</em>.</p><ul><li><p>Passport</p></li></ul><ol><li><p>Confirm tickets</p></li></ol><blockquote><p>Leave time to explore.</p></blockquote><p><a href="https://example.com" target="_blank" onclick="alert(1)">Read more</a><br>Safe advice.</p>';
  const result = sanitizeRichText(html + '<script>alert(1)</script><img src=x onerror="alert(1)"><p style="color:red">Extra</p><a href="javascript:alert(1)">Bad link</a>');
  for (const tag of ["h2", "h3", "h4", "strong", "em", "ul", "ol", "li", "blockquote", "br"]) assert.match(result, new RegExp(`<${tag}[ >]`));
  assert.match(result, /href="https:\/\/example.com" target="_blank" rel="noopener noreferrer"/);
  assert.doesNotMatch(result, /<script|<img|onclick|onerror|javascript:|style=/);
  assert.equal(readingMinutes(`<p>${"word ".repeat(440)}</p>`), 2);
});
