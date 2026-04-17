/**
 * Custom markdown-to-Portable-Text converter.
 * Supports: h2, h3, h4, normal, blockquote, bullet lists,
 * strong, em, and link annotations — matching the blockContent schema.
 */

interface PortableTextSpan {
  _type: "span";
  _key: string;
  text: string;
  marks: string[];
}

interface PortableTextMarkDef {
  _type: "link";
  _key: string;
  href: string;
}

interface PortableTextBlock {
  _type: "block";
  _key: string;
  style: "normal" | "h2" | "h3" | "h4" | "blockquote";
  markDefs: PortableTextMarkDef[];
  children: PortableTextSpan[];
  listItem?: "bullet";
  level?: number;
}

type PortableTextNode = PortableTextBlock;

let keyCounter = 0;
function genKey(): string {
  return `k${Date.now().toString(36)}${(keyCounter++).toString(36)}`;
}

interface InlineToken {
  text: string;
  marks: string[];
  linkKey?: string;
}

function parseInlineMarks(
  text: string
): { tokens: InlineToken[]; markDefs: PortableTextMarkDef[] } {
  const tokens: InlineToken[] = [];
  const markDefs: PortableTextMarkDef[] = [];
  let i = 0;

  while (i < text.length) {
    if (text[i] === "*" && text[i + 1] === "*") {
      const end = text.indexOf("**", i + 2);
      if (end !== -1) {
        const inner = text.slice(i + 2, end);
        const innerResult = parseInlineMarks(inner);
        for (const t of innerResult.tokens) {
          t.marks = ["strong", ...t.marks];
        }
        tokens.push(...innerResult.tokens);
        markDefs.push(...innerResult.markDefs);
        i = end + 2;
        continue;
      }
    }

    if (text[i] === "*" && text[i + 1] !== "*") {
      const end = text.indexOf("*", i + 1);
      if (end !== -1 && text[end + 1] !== "*") {
        const inner = text.slice(i + 1, end);
        const innerResult = parseInlineMarks(inner);
        for (const t of innerResult.tokens) {
          t.marks = ["em", ...t.marks];
        }
        tokens.push(...innerResult.tokens);
        markDefs.push(...innerResult.markDefs);
        i = end + 1;
        continue;
      }
    }

    if (text[i] === "[") {
      const closeBracket = text.indexOf("]", i);
      if (closeBracket !== -1 && text[closeBracket + 1] === "(") {
        const closeParen = text.indexOf(")", closeBracket + 2);
        if (closeParen !== -1) {
          const linkText = text.slice(i + 1, closeBracket);
          const href = text.slice(closeBracket + 2, closeParen);
          const linkKey = genKey();
          markDefs.push({ _type: "link", _key: linkKey, href });
          tokens.push({ text: linkText, marks: [], linkKey });
          i = closeParen + 1;
          continue;
        }
      }
    }

    let plainEnd = i + 1;
    while (plainEnd < text.length) {
      if (text[plainEnd] === "*" || text[plainEnd] === "[") break;
      plainEnd++;
    }
    tokens.push({ text: text.slice(i, plainEnd), marks: [] });
    i = plainEnd;
  }

  return { tokens, markDefs };
}

function createBlock(
  line: string,
  style: PortableTextBlock["style"],
  listItem?: "bullet"
): PortableTextBlock {
  const { tokens, markDefs } = parseInlineMarks(line);

  const children: PortableTextSpan[] = tokens.map((t) => ({
    _type: "span" as const,
    _key: genKey(),
    text: t.text,
    marks: t.linkKey ? [...t.marks, t.linkKey] : t.marks,
  }));

  if (children.length === 0) {
    children.push({
      _type: "span",
      _key: genKey(),
      text: "",
      marks: [],
    });
  }

  const block: PortableTextBlock = {
    _type: "block",
    _key: genKey(),
    style,
    markDefs,
    children,
  };

  if (listItem) {
    block.listItem = listItem;
    block.level = 1;
  }

  return block;
}

export function markdownToPortableText(markdown: string): PortableTextNode[] {
  keyCounter = 0;
  const blocks: PortableTextNode[] = [];
  const lines = markdown.split("\n");

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    if (line.startsWith("#### ")) {
      blocks.push(createBlock(line.slice(5).trim(), "h4"));
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      blocks.push(createBlock(line.slice(4).trim(), "h3"));
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push(createBlock(line.slice(3).trim(), "h2"));
      i++;
      continue;
    }

    if (line.startsWith("> ")) {
      blocks.push(createBlock(line.slice(2).trim(), "blockquote"));
      i++;
      continue;
    }

    if (/^[-*+]\s/.test(line)) {
      blocks.push(createBlock(line.replace(/^[-*+]\s/, "").trim(), "normal", "bullet"));
      i++;
      continue;
    }

    let paragraph = line;
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("> ") &&
      !/^[-*+]\s/.test(lines[i])
    ) {
      paragraph += " " + lines[i];
      i++;
    }

    blocks.push(createBlock(paragraph.trim(), "normal"));
  }

  return blocks;
}
