import { expect, test, describe, vi, afterEach } from "vitest";
import * as vscode from "vscode";
import * as fs from "fs";
import { registerDocsCommands } from "../../src/commands/docs";

afterEach(() => {
  vi.restoreAllMocks();
});

global.fetch = vi.fn(async () => {
  return {
    text: vi.fn(async () => "# Hello World"),
  } as any;
});

const mocks = vi.hoisted(() => ({
  panel: {
    webview: {
      html: "",
    },
  },
  quickpick: {
    title: "",
    items: [],
    onDidChangeSelection: vi.fn((...args: any[]) => {
      args[0]([
        {
          label: "Codecov",
          description:
            "A ready-to-use Pipeline that uploads coverage to Codecov",
          name: "codecov_pipeline",
          readme:
            "https://cdn.jsdelivr.net/gh/fluent-ci-templates/codecov-pipeline@v0.5.1/README.md",
          url: "https://pkg.fluentci.io/codecov_pipeline@v0.5.1",
        },
      ]);
    }),
    onDidHide: vi.fn(),
    show: vi.fn(),
    dispose: vi.fn(),
  },
}));

vi.mock("fs", () => {
  return {
    existsSync: vi.fn((_path: string) => {
      return true;
    }),
    readFileSync: vi.fn((_path: string) => {
      return "# Hello World";
    }),
  };
});

vi.mock("vscode", () => {
  const _commands: { [key: string]: (...args: any[]) => any } = {};
  return {
    commands: {
      registerCommand: vi.fn((...args: any[]) => {
        _commands[args[0]] = args[1];
      }),
      executeCommand: vi.fn((...args: any[]) =>
        _commands[args[0]](...args.slice(1))
      ),
    },
    window: {
      createOutputChannel: () => {
        return {
          appendLine: vi.fn(),
        };
      },
      createTerminal: vi.fn(),
      createTreeView: vi.fn(),
      createWebviewPanel: vi.fn((...args: any[]) => mocks.panel),
      showTextDocument: vi.fn(),
      createQuickPick: vi.fn((...args: any[]) => mocks.quickpick),
    },
    workspace: {
      workspaceFolders: [
        {
          uri: {
            fsPath: "/workspace",
          },
        },
      ],
      openTextDocument: vi.fn((..._args: any[]) =>
        Promise.resolve({
          fileName: "README.md",
        })
      ),
    },
    ViewColumn: {
      One: 1,
    },
  };
});

describe("commands", () => {
  test("registerDocsCommand()", () => {
    const spyOnCommands = vi.spyOn(vscode.commands, "registerCommand");
    const spyOnCreateWebviewPanel = vi.spyOn(
      vscode.window,
      "createWebviewPanel"
    );
    const spyOnReadFileSync = vi.spyOn(fs, "readFileSync");
    const spyOnOpenTextDocument = vi.spyOn(
      vscode.workspace,
      "openTextDocument"
    );
    const spyDidChangeSelection = vi.spyOn(
      mocks.quickpick,
      "onDidChangeSelection"
    );
    const spyFetch = vi.spyOn(global, "fetch");
    registerDocsCommands();
    vscode.commands.executeCommand("fluentci.showDocs");
    vscode.commands.executeCommand("fluentci.editDocs");
    vscode.commands.executeCommand("fluentci.showPipelineDocs");
    expect(spyOnCommands).toHaveBeenCalledTimes(3);
    expect(spyOnCommands).toHaveBeenCalledWith(
      "fluentci.showDocs",
      expect.any(Function)
    );
    expect(spyOnCommands).toHaveBeenCalledWith(
      "fluentci.editDocs",
      expect.any(Function)
    );
    expect(spyOnCommands).toHaveBeenCalledWith(
      "fluentci.showPipelineDocs",
      expect.any(Function)
    );
    expect(spyOnCreateWebviewPanel).toHaveBeenCalledTimes(2);
    expect(spyOnCreateWebviewPanel).toHaveBeenCalledWith(
      "markdownPreview",
      "Pipeline Docs",
      vscode.ViewColumn.One,
      {}
    );
    expect(spyOnReadFileSync).toHaveBeenCalledTimes(1);
    expect(spyOnReadFileSync).toHaveBeenCalledWith(
      "/workspace/.fluentci/README.md"
    );
    expect(mocks.panel.webview.html).toBe(`<!DOCTYPE html>
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
    expect(spyOnOpenTextDocument).toHaveBeenCalledTimes(1);
    expect(spyOnOpenTextDocument).toHaveBeenCalledWith(
      "/workspace/.fluentci/README.md"
    );
    expect(spyDidChangeSelection).toHaveBeenCalledTimes(1);
    expect(mocks.quickpick.title).toBe("Select a Pipeline");
    expect(mocks.quickpick.items.length).toBe(27);
    expect(spyOnCreateWebviewPanel).toHaveBeenCalledWith(
      "markdownPreview",
      "Codecov Pipeline Docs",
      vscode.ViewColumn.One,
      {}
    );
    expect(mocks.panel.webview.html).toBe(`<!DOCTYPE html>
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
    expect(spyFetch).toHaveBeenCalledTimes(1);
    expect(spyFetch).toHaveBeenCalledWith(
      "https://cdn.jsdelivr.net/gh/fluent-ci-templates/codecov-pipeline@v0.5.1/README.md"
    );
  });
});
