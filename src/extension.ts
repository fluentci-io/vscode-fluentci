// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { initResources } from "./icons";
import { initOutputChannel } from "./outputChannel";
import { initTerminal } from "./terminal";
import { registerExplorerCommands } from "./commands/explorer";
import { registerExplorerViews } from "./views";
import { registerConfigsCommand } from "./commands/configs";
import { registerPipelineCommands } from "./commands/pipeline";
import { registerJobsCommands } from "./commands/jobs";
import { registerDocsCommands } from "./commands/docs";

const outputChannel = vscode.window.createOutputChannel("Fluent CI");
const terminal = vscode.window.createTerminal("Fluent CI");

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "fluentci" is now active!');

  initResources(context);
  initOutputChannel(outputChannel);
  initTerminal(terminal);

  registerExplorerViews(context);

  registerExplorerCommands();
  registerPipelineCommands(context);
  registerJobsCommands();
  registerDocsCommands();
  registerConfigsCommand();
}

// This method is called when your extension is deactivated
export function deactivate() {}
