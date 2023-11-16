import { expect, test, describe, vi, afterEach } from "vitest";
import * as vscode from "vscode";
import * as fs from "fs";
import { registerExplorerCommands } from "../../src/commands/explorer";
import { initTerminal } from "../../src/terminal";
import { registerExplorerViews } from "../../src/views";

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
}));

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
    },
    workspace: {
      workspaceFolders: [
        {
          uri: {
            fsPath: "/workspace",
          },
        },
      ],
    },
    ViewColumn: {
      One: 1,
    },
    EventEmitter: vi.fn(),
  };
});

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

describe("commands", () => {
  test("registerExplorerCommands()", () => {
    const terminal = {
      show: vi.fn(),
      sendText: vi.fn(),
    };
    initTerminal(terminal as any);
    const spyOnCommands = vi.spyOn(vscode.commands, "registerCommand");
    const spyOnSendText = vi.spyOn(terminal, "sendText");
    const spyOnShow = vi.spyOn(terminal, "show");
    const spyOnCreateWebviewPanel = vi.spyOn(
      vscode.window,
      "createWebviewPanel"
    );
    const spyOnReadFileSync = vi.spyOn(fs, "readFileSync");
    const spyFetch = vi.spyOn(global, "fetch");
    const context = {
      subscriptions: [],
    };
    const providers = registerExplorerViews(context as any);
    registerExplorerCommands(providers);
    vscode.commands.executeCommand("fluentci-explorer.runJob", {
      name: "build",
    });
    vscode.commands.executeCommand("fluentci-explorer.runCurrentPipeline");
    vscode.commands.executeCommand("fluentci-explorer.runPrebuiltPipeline", {
      name: "terraform_pipeline",
    });
    vscode.commands.executeCommand(
      "fluentci-explorer.runJobFromPrebuiltPipeline",
      {
        pipeline: "pulumi_pipeline",
        name: "preview",
      }
    );
    vscode.commands.executeCommand("fluentci-explorer.showDocs");
    vscode.commands.executeCommand(
      "fluentci-explorer.showPrebuiltPipelineDocs",
      {
        name: "fastlane_pipeline",
        repo_name: "fluent-ci-templates/fastlane-pipeline",
        version: "v0.1.0",
      }
    );
    expect(spyOnShow).toHaveBeenCalledTimes(4);
    expect(spyOnSendText).toHaveBeenCalledTimes(4);
    expect(spyOnShow).toHaveBeenCalledWith(true);
    expect(spyOnSendText).toHaveBeenCalledWith("fluentci run . build");
    expect(spyOnShow).toHaveBeenCalledWith(true);
    expect(spyOnSendText).toHaveBeenCalledWith("fluentci run .");
    expect(spyOnShow).toHaveBeenCalledWith(true);
    expect(spyOnSendText).toHaveBeenCalledWith(
      "fluentci run terraform_pipeline"
    );
    expect(spyOnShow).toHaveBeenCalledWith(true);
    expect(spyOnSendText).toHaveBeenCalledWith(
      "fluentci run pulumi_pipeline preview"
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
    expect(spyFetch).toHaveBeenCalledTimes(1);
    expect(spyFetch).toHaveBeenCalledWith(
      "https://cdn.jsdelivr.net/gh/fluent-ci-templates/fastlane-pipeline@v0.1.0/README.md"
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
    expect(spyOnCommands).toHaveBeenCalledTimes(11);
    expect(spyOnCommands).toHaveBeenCalledWith(
      "fluentci-explorer.runJob",
      expect.any(Function)
    );
    expect(spyOnCommands).toHaveBeenCalledWith(
      "fluentci-explorer.runCurrentPipeline",
      expect.any(Function)
    );
    expect(spyOnCommands).toHaveBeenCalledWith(
      "fluentci-explorer.runPrebuiltPipeline",
      expect.any(Function)
    );
    expect(spyOnCommands).toHaveBeenCalledWith(
      "fluentci-explorer.runJobFromPrebuiltPipeline",
      expect.any(Function)
    );
    expect(spyOnCommands).toHaveBeenCalledWith(
      "fluentci-explorer.showDocs",
      expect.any(Function)
    );
    expect(spyOnCommands).toHaveBeenCalledWith(
      "fluentci-explorer.showPrebuiltPipelineDocs",
      expect.any(Function)
    );
  });
});
