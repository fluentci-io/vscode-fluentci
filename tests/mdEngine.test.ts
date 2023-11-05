import { expect, test, describe, vi, afterEach } from "vitest";
import { normalizeHighlightLang, renderMarkdown } from "../src/mdEngine";

describe("mdEngine", () => {
  test("normalizeHighlightLang('tsx')", () => {
    const lang = normalizeHighlightLang("tsx");
    expect(lang).toBe("jsx");
  });
  test("normalizeHighlightLang('typescriptreact')", () => {
    const lang = normalizeHighlightLang("typescriptreact");
    expect(lang).toBe("jsx");
  });
  test("normalizeHighlightLang('hcl')", () => {
    const lang = normalizeHighlightLang("hcl");
    expect(lang).toBe("hcl");
  });
  test("normalizeHighlightLang('json5')", () => {
    const lang = normalizeHighlightLang("json5");
    expect(lang).toBe("json");
  });
  test("normalizeHighlightLang('jsonc')", () => {
    const lang = normalizeHighlightLang("jsonc");
    expect(lang).toBe("json");
  });
  test("normalizeHighlightLang('c#')", () => {
    const lang = normalizeHighlightLang("c#");
    expect(lang).toBe("cs");
  });
  test("normalizeHighlightLang('csharp')", () => {
    const lang = normalizeHighlightLang("c#");
    expect(lang).toBe("cs");
  });
  test("renderMarkdown()", () => {
    const html = renderMarkdown("# Hello World");
    expect(html).toBe(`<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title></title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Microsoft/vscode/extensions/markdown-language-features/media/markdown.css">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Microsoft/vscode/extensions/markdown-language-features/media/highlight.css">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css">
        <link href="https://cdn.jsdelivr.net/npm/katex-copytex@latest/dist/katex-copytex.min.css" rel="stylesheet" type="text/css">
    </head>
    <body class="vscode-body">
        <h1>Hello World</h1>

    </body>
    </html>`);
  });
});
