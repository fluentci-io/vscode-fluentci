// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { pipelines } from "./pipelines";
import MarkdownIt from "markdown-it";
import MarkdownItExternalLinks from "markdown-it-external-links";
import { spawn } from "child_process";
import { existsSync, readFileSync } from "fs";

const outputChannel = vscode.window.createOutputChannel("Fluent CI");
const terminal = vscode.window.createTerminal("Fluent CI");
const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

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

function renderMarkdown(markdownContent: string) {
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

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "fluentci" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("fluentci.run", () => {
    if (!workspaceFolder) {
      vscode.window.showErrorMessage("No workspace folder found");
      return;
    }

    if (!existsSync(`${workspaceFolder.uri.fsPath}/.fluentci`)) {
      vscode.window.showErrorMessage(
        "FluentCI Configs Directory does not exist in this directory"
      );
      return;
    }

    terminal.show();
    terminal.sendText("fluentci run .");
  });

  vscode.commands.registerCommand("fluentci.runJob", async () => {
    const childProcess = spawn(
      "deno",
      [
        "eval",
        `
   import { runnableJobs , jobDescriptions } from './.fluentci/src/dagger/jobs.ts';
   console.log(JSON.stringify(Object.keys(runnableJobs).map(x => ({ name: x, description: jobDescriptions[x]}))));`,
      ],
      {
        cwd: workspaceFolder?.uri.fsPath,
      }
    );
    const jobs = await new Promise<{ name: string; description: string }[]>(
      (resolve, reject) => {
        childProcess.stdout.on("data", (data) => {
          const jobs = JSON.parse(data.toString());
          outputChannel.appendLine(jobs);
          resolve(jobs);
        });
        childProcess.stderr.on("data", (data) => {
          outputChannel.appendLine(
            data.toString().replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "")
          );
          reject();
        });
      }
    );

    const quickPick = vscode.window.createQuickPick();

    quickPick.title = "Select a Job";
    quickPick.items = jobs.map((x) => ({
      label: x.name,
      description: x.description,
    }));
    quickPick.onDidChangeSelection((selection) => {
      terminal.show();
      terminal.sendText(`fluentci run . ${selection[0].label}`);
    });
    quickPick.onDidHide(() => quickPick.dispose());
    quickPick.show();
  });

  vscode.commands.registerCommand("fluentci.runJobWithParams", () => {});

  vscode.commands.registerCommand("fluentci.init", () => {
    const quickPick = vscode.window.createQuickPick<{
      label: string;
      name: string;
      description: string;
      readme: string;
    }>();
    quickPick.title = "Create from Prebuilt Pipeline";
    quickPick.items = pipelines;
    quickPick.onDidChangeSelection((selection) => {
      if (!workspaceFolder) {
        vscode.window.showErrorMessage("No workspace folder found");
        quickPick.dispose();
        return;
      }
      outputChannel.appendLine(
        `Workspace folder: ${workspaceFolder.uri.fsPath}`
      );
      quickPick.dispose();
      if (existsSync(`${workspaceFolder.uri.fsPath}/.fluentci`)) {
        vscode.window.showErrorMessage(
          "FluentCI Project already exists in this directory"
        );
        return;
      }
      vscode.window.setStatusBarMessage("Initializing FluentCI Project...");
      const pipeline = selection[0].name;
      terminal.show();
      terminal.sendText(`fluentci init -t ${pipeline}`);
      vscode.window.setStatusBarMessage("FluentCI Project Initialized!");
    });
    quickPick.onDidHide(() => quickPick.dispose());
    quickPick.show();
  });

  vscode.commands.registerCommand("fluentci.runPrebuiltPipeline", () => {
    const quickPick = vscode.window.createQuickPick<{
      label: string;
      name: string;
      description: string;
      readme: string;
    }>();
    quickPick.title = "Select a Pipeline";
    quickPick.items = pipelines;
    quickPick.onDidChangeSelection((selection) => {
      terminal.show();
      terminal.sendText(`fluentci run ${selection[0].name}`);
    });
    quickPick.onDidHide(() => quickPick.dispose());
    quickPick.show();
  });

  vscode.commands.registerCommand(
    "fluentci.runJobFromPrebuiltPipeline",
    async () => {
      const quickPick = vscode.window.createQuickPick<{
        label: string;
        name: string;
        description: string;
        readme: string;
        url: string;
      }>();
      quickPick.title = "Select a Pipeline (1/2)";
      quickPick.items = pipelines;
      quickPick.onDidChangeSelection(async (selection) => {
        quickPick.dispose();
        vscode.window.setStatusBarMessage("Fetching Jobs...");
        const childProcess = spawn(
          "deno",
          [
            "eval",
            `
     import { runnableJobs , jobDescriptions } from '${selection[0].url}/src/dagger/jobs.ts';
     console.log(JSON.stringify(Object.keys(runnableJobs).map(x => ({ name: x, description: jobDescriptions[x]}))));`,
          ],
          {
            cwd: workspaceFolder?.uri.fsPath,
          }
        );
        const jobs = await new Promise<{ name: string; description: string }[]>(
          (resolve) => {
            childProcess.stdout.on("data", (data) => {
              const jobs = JSON.parse(data.toString());
              outputChannel.appendLine(data.toString());
              resolve(jobs);
            });
            childProcess.stderr.on("data", (data) => {
              outputChannel.show(true);
              outputChannel.appendLine(
                data.toString().replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "")
              );
            });
          }
        );

        vscode.window.setStatusBarMessage("Jobs Fetched!");
        vscode.window.setStatusBarMessage("");

        const jobsQuickPick = vscode.window.createQuickPick();
        jobsQuickPick.title = "Select a Job (2/2)";
        jobsQuickPick.items = jobs.map((x) => ({
          label: x.name,
          description: x.description,
        }));
        jobsQuickPick.onDidChangeSelection((job) => {
          terminal.show();
          terminal.sendText(
            `fluentci run ${selection[0].name} ${job[0].label}`
          );
        });
        jobsQuickPick.onDidHide(() => quickPick.dispose());
        jobsQuickPick.show();
      });
      quickPick.onDidHide(() => quickPick.dispose());
      quickPick.show();
    }
  );

  vscode.commands.registerCommand("fluentci.showDocs", () => {
    if (!workspaceFolder) {
      vscode.window.showErrorMessage("No workspace folder found");
      return;
    }
    if (!existsSync(`${workspaceFolder.uri.fsPath}/.fluentci`)) {
      vscode.window.showErrorMessage(
        "FluentCI Configs Directory does not exist in this directory"
      );
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      "markdownPreview",
      "Pipeline Docs",
      vscode.ViewColumn.One,
      {}
    );
    // open the readme file from the fluentci directory
    const data = readFileSync(
      `${workspaceFolder.uri.fsPath}/.fluentci/README.md`
    );
    panel.webview.html = renderMarkdown(data.toString());
  });

  vscode.commands.registerCommand("fluentci.editDocs", () => {
    if (!workspaceFolder) {
      vscode.window.showErrorMessage("No workspace folder found");
      return;
    }
    if (!existsSync(`${workspaceFolder.uri.fsPath}/.fluentci`)) {
      vscode.window.showErrorMessage(
        "FluentCI Configs Directory does not exist in this directory"
      );
      return;
    }
    const filePath = `${workspaceFolder.uri.fsPath}/.fluentci/README.md`;
    vscode.workspace.openTextDocument(filePath).then((doc) => {
      vscode.window.showTextDocument(doc);
    });
  });

  vscode.commands.registerCommand("fluentci.showPipelineDocs", () => {
    const quickPick = vscode.window.createQuickPick<{
      label: string;
      name: string;
      description: string;
      readme: string;
    }>();
    quickPick.title = "Select a Pipeline";
    quickPick.items = pipelines.slice(1);
    quickPick.onDidChangeSelection(async (selection) => {
      const panel = vscode.window.createWebviewPanel(
        "markdownPreview",
        `${selection[0].label} Pipeline Docs`,
        vscode.ViewColumn.One,
        {}
      );
      fetch(selection[0].readme)
        .then((response) => response.text())
        .then((text) => {
          panel.webview.html = renderMarkdown(text);
        });
    });
    quickPick.onDidHide(() => quickPick.dispose());
    quickPick.show();
  });

  vscode.commands.registerCommand("fluentci.removeConfigs", () => {
    if (!workspaceFolder) {
      vscode.window.showErrorMessage("No workspace folder found");
      return;
    }

    if (!existsSync(`${workspaceFolder.uri.fsPath}/.fluentci`)) {
      vscode.window.showErrorMessage(
        "FluentCI Configs Directory does not exist in this directory"
      );
      return;
    }

    const childProcess = spawn("rm", [
      "-rf",
      `${workspaceFolder.uri.fsPath}/.fluentci`,
    ]);
    childProcess.stdout.on("data", (data) => {
      outputChannel.appendLine(data.toString());
    });
    childProcess.stderr.on("data", (data) => {
      outputChannel.appendLine(data.toString());
    });
    childProcess.on("close", (code) => {
      if (code !== 0) {
        vscode.window.showErrorMessage(
          "Failed to remove FluentCI Configs Directory from Workspace"
        );
        return;
      }
      outputChannel.appendLine(
        "FluentCI Configs Directory Successfully Removed from Workspace"
      );
      vscode.window.showInformationMessage(
        "FluentCI Configs Directory Successfully Removed from Workspace"
      );
    });
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
