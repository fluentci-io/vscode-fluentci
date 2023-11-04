import * as vscode from "vscode";

let _context: vscode.ExtensionContext;

export function initResources(context: vscode.ExtensionContext) {
  _context = context;
}

export function getIconPath(iconName: string) {
  return vscode.Uri.joinPath(
    _context.extensionUri,
    "resources",
    "icons",
    "light",
    iconName
  );
}
