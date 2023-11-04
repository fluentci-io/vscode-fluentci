import MarkdownIt from "markdown-it";
import MarkdownItExternalLinks from "markdown-it-external-links";

function normalizeHighlightLang(lang: string): string {
  switch (lang && lang.toLowerCase()) {
    case "tsx":
    case "typescriptreact":
      return "jsx";
    case "json5":
    case "jsonc":
      return "json";
    case "c#":
    case "csharp":
      return "cs";
    default:
      return lang;
  }
}

export function renderMarkdown(markdownContent: string) {
  const hljs: typeof import("highlight.js").default = require("highlight.js");
  const md: any = new MarkdownIt({
    html: true,
    highlight: (str, lang) => {
      if (lang && hljs.getLanguage(normalizeHighlightLang(lang))) {
        try {
          return (
            '<pre class="hljs"><code>' +
            hljs.highlight(normalizeHighlightLang(lang), str).value +
            "</code></pre>"
          );
        } catch (error) {}
      }
      return (
        '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + "</code></pre>"
      );
    },
  });

  md.use(MarkdownItExternalLinks, {
    externalTarget: "_blank",
    externalRel: "noopener noreferrer",
  });

  md.use(require("markdown-it-multimd-table"), {
    multiline: true, // Allow multiline table cells
    headerless: false, // Render tables without headers
  });

  const katexCss =
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css">';
  const markdownCss =
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Microsoft/vscode/extensions/markdown-language-features/media/markdown.css">';
  const highlightCss =
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Microsoft/vscode/extensions/markdown-language-features/media/highlight.css">';
  const copyTeXCss =
    '<link href="https://cdn.jsdelivr.net/npm/katex-copytex@latest/dist/katex-copytex.min.css" rel="stylesheet" type="text/css">';

  const html = `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>${""}</title>
        ${markdownCss}
        ${highlightCss}
        ${katexCss}
        ${copyTeXCss}
    </head>
    <body class="vscode-body">
        ${md.render(markdownContent)}
    </body>
    </html>`;

  return html;
}
