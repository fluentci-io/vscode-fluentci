import * as vscode from "vscode";
import { Job } from "../jobsTreeView";
import { Pipeline } from "../pipelinesTreeView";
import { sendTextToTerminal, showTerminal } from "../terminal";
import { renderMarkdown } from "../mdEngine";
import { readFileSync } from "fs";
import { verifyWorkspace, workspaceFolder } from "../workspace";

export function registerExplorerCommands() {
  vscode.commands.registerCommand("fluentci-explorer.runJob", (args: Job) => {
    if (!verifyWorkspace()) {
      return;
    }
    showTerminal(true);
    sendTextToTerminal(`fluentci run . ${args.name}`);
  });

  vscode.commands.registerCommand(
    "fluentci-explorer.runCurrentPipeline",
    (_args: Pipeline) => {
      if (!verifyWorkspace()) {
        return;
      }
      showTerminal(true);
      sendTextToTerminal("fluentci run .");
    }
  );

  vscode.commands.registerCommand(
    "fluentci-explorer.runPrebuiltPipeline",
    (args: Pipeline) => {
      showTerminal(true);
      sendTextToTerminal(`fluentci run ${args.name}`);
    }
  );

  vscode.commands.registerCommand(
    "fluentci-explorer.runJobFromPrebuiltPipeline",
    (args: Job) => {
      showTerminal(true);
      sendTextToTerminal(`fluentci run ${args.pipeline} ${args.name}`);
    }
  );

  vscode.commands.registerCommand(
    "fluentci-explorer.showDocs",
    (_args: Pipeline) => {
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
    }
  );

  vscode.commands.registerCommand(
    "fluentci-explorer.showPrebuiltPipelineDocs",
    (args: Pipeline) => {
      const panel = vscode.window.createWebviewPanel(
        "markdownPreview",
        `${args.name} docs`,
        vscode.ViewColumn.One,
        {}
      );
      fetch(
        `https://cdn.jsdelivr.net/gh/${args.repo_name}@${args.version}/README.md`
      )
        .then((response) => response.text())
        .then((text) => {
          panel.webview.html = renderMarkdown(text);
        });
    }
  );
}
