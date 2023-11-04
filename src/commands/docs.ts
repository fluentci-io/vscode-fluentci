import * as vscode from "vscode";
import { existsSync, readFileSync } from "fs";
import { pipelines } from "../pipelines";
import { renderMarkdown } from "../mdEngine";
import { verifyWorkspace, workspaceFolder } from "../workspace";

export function registerDocsCommands() {
  vscode.commands.registerCommand("fluentci.showDocs", () => {
    if (!verifyWorkspace()) {
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
      `${workspaceFolder?.uri.fsPath}/.fluentci/README.md`
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
}
