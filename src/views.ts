import * as vscode from "vscode";
import { JobsTreeProvider } from "./jobsTreeView";
import { PipelinesTreeProvider } from "./pipelinesTreeView";

export function registerExplorerViews(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.window.createTreeView("fluentci-explorer.jobs", {
      treeDataProvider: new JobsTreeProvider(),
    })
  );

  context.subscriptions.push(
    vscode.window.createTreeView("fluentci-explorer.pipelines", {
      treeDataProvider: new PipelinesTreeProvider(),
    })
  );
}
