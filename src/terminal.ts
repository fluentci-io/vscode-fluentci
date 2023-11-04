import * as vscode from "vscode";

let _terminal: vscode.Terminal;

export function initTerminal(terminal: vscode.Terminal) {
  _terminal = terminal;
}

export function showTerminal(preserveFocus?: boolean) {
  _terminal.show(preserveFocus);
}

export function sendTextToTerminal(text: string) {
  _terminal.sendText(text);
}
