import { existsSync } from "fs";
import * as vscode from "vscode";

export const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

export function verifyWorkspace(): boolean {
  if (!workspaceFolder) {
    vscode.window.showErrorMessage("No workspace folder found");
    return false;
  }
  if (!existsSync(`${workspaceFolder.uri.fsPath}/.fluentci`)) {
    vscode.window.showErrorMessage(
      "FluentCI Configs Directory does not exist in this directory"
    );
    return false;
  }
  return true;
}
