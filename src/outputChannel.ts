import * as vscode from "vscode";

let _outputChannel: vscode.OutputChannel;

export function initOutputChannel(outputChannel: vscode.OutputChannel) {
  _outputChannel = outputChannel;
}

export function appendLineToOutputChannel(line: string) {
  _outputChannel.appendLine(line);
}

export function showOutputChannel(preserveFocus?: boolean) {
  _outputChannel.show(preserveFocus);
}
