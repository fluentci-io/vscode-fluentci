import * as vscode from "vscode";
import { appendLineToOutputChannel } from "../outputChannel";
import { existsSync } from "fs";
import { spawn } from "child_process";
import { sendTextToTerminal, showTerminal } from "../terminal";
import { pipelines } from "../pipelines";
import { workspaceFolder } from "../workspace";

export function registerConfigsCommand() {
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
      appendLineToOutputChannel(
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
      showTerminal(true);
      sendTextToTerminal(`fluentci init -t ${pipeline}`);
      vscode.window.setStatusBarMessage("FluentCI Project Initialized!");
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
      appendLineToOutputChannel(data.toString());
    });
    childProcess.stderr.on("data", (data) => {
      appendLineToOutputChannel(data.toString());
    });
    childProcess.on("close", (code) => {
      if (code !== 0) {
        vscode.window.showErrorMessage(
          "Failed to remove FluentCI Configs Directory from Workspace"
        );
        return;
      }
      appendLineToOutputChannel(
        "FluentCI Configs Directory Successfully Removed from Workspace"
      );
      vscode.window.showInformationMessage(
        "FluentCI Configs Directory Successfully Removed from Workspace"
      );
    });
  });
}
