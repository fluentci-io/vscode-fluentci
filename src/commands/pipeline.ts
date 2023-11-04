import * as vscode from "vscode";
import { sendTextToTerminal, showTerminal } from "../terminal";
import { pipelines } from "../pipelines";
import { verifyWorkspace } from "../workspace";

export function registerPipelineCommands(context: vscode.ExtensionContext) {
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("fluentci.run", () => {
    if (!verifyWorkspace()) {
      return;
    }
    showTerminal(true);
    sendTextToTerminal("fluentci run .");
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
      quickPick.dispose();
      showTerminal(true);
      sendTextToTerminal(`fluentci run ${selection[0].name}`);
    });
    quickPick.onDidHide(() => quickPick.dispose());
    quickPick.show();
  });

  context.subscriptions.push(disposable);
}
