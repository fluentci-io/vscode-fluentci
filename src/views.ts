import * as vscode from "vscode";
import { JobsTreeProvider } from "./jobsTreeView";
import { PipelinesTreeProvider } from "./pipelinesTreeView";
import { EnvVarsTreeProvider } from "./envVarsTreeView";

export function registerExplorerViews(context: vscode.ExtensionContext) {
  const jobsTreeProvider = new JobsTreeProvider();
  const pipelinesTreeProvider = new PipelinesTreeProvider();
  const envVarsTreeProvider = new EnvVarsTreeProvider();

  context.subscriptions.push(
    vscode.window.createTreeView("fluentci-explorer.jobs", {
      treeDataProvider: jobsTreeProvider,
    })
  );

  context.subscriptions.push(
    vscode.window.createTreeView("fluentci-explorer.pipelines", {
      treeDataProvider: pipelinesTreeProvider,
    })
  );

  context.subscriptions.push(
    vscode.window.createTreeView("fluentci-explorer.env_vars", {
      treeDataProvider: envVarsTreeProvider,
    })
  );

  return {
    jobsTreeProvider,
    pipelinesTreeProvider,
    envVarsTreeProvider,
  };
}
