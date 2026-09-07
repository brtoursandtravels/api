import sanitizeHtml from "sanitize-html";

const allowedTags = [
  "p",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "strong",
  "em",
  "blockquote",
  "a",
  "br",
] as const;

export function sanitizeRichText(input: string) {
  return sanitizeHtml(input, {
    allowedTags: [...allowedTags],
    allowedAttributes: { a: ["href", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
    transformTags: {
      a: (_tagName, attributes) => ({
        tagName: "a",
        attribs: {
          ...(attributes.href ? { href: attributes.href } : {}),
          ...(attributes.target === "_blank"
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {}),
        },
      }),
    },
  });
}

export function readingMinutes(html: string) {
  const text = sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
  const words = text ? text.split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(words / 220));
}
