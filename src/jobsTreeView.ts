import * as vscode from "vscode";
import { getIconPath } from "./icons";
import { spawn } from "child_process";
import { appendLineToOutputChannel, showOutputChannel } from "./outputChannel";

const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
export interface Job {
  name: string;
  description?: string;
  pipeline?: string;
  children?: Job[];
}

export class JobsTreeProvider implements vscode.TreeDataProvider<Job> {
  onDidChangeTreeData?:
    | vscode.Event<void | Job | Job[] | null | undefined>
    | undefined;
  getTreeItem(element: Job): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return {
      label: element.name,
      tooltip: element.description,
      collapsibleState:
        element.children && element.children.length > 0
          ? vscode.TreeItemCollapsibleState.Expanded
          : vscode.TreeItemCollapsibleState.None,
      contextValue:
        element.children && element.children.length > 0
          ? "fluentci-pipeline"
          : "fluentci-job",
      iconPath: getIconPath("steps/step_success.svg"),
    };
  }
  getChildren(element?: Job | undefined): vscode.ProviderResult<Job[]> {
    if (!element) {
      const childProcess = spawn(
        "deno",
        [
          "eval",
          `
     import * as jobs from './.fluentci/src/dagger/jobs.ts';
     import { runnableJobs , jobDescriptions } from './.fluentci/src/dagger/jobs.ts';
     console.log(JSON.stringify(Object.keys(runnableJobs).map(x => ({ pipelineName: jobs.pipelineName, name: x, description: jobDescriptions[x]}))));`,
        ],
        {
          cwd: workspaceFolder?.uri.fsPath,
        }
      );
      const jobs = new Promise<
        { name: string; description?: string; children?: Job[] }[]
      >((resolve, _reject) => {
        childProcess.stdout.on("data", (data) => {
          const jobs = JSON.parse(data.toString());
          appendLineToOutputChannel(
            `=> ${jobs[0].pipelineName || "default_pipeline"} Jobs:`
          );
          appendLineToOutputChannel(JSON.stringify(jobs, null, 2));
          resolve([
            {
              name: jobs[0].pipelineName || "default_pipeline",
              children: jobs,
            },
          ]);
        });
        childProcess.stderr.on("data", (data) => {
          showOutputChannel(true);
          appendLineToOutputChannel(
            data.toString().replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "")
          );
          if (data.toString().includes("error")) {
            resolve([]);
          }
        });
      });

      return jobs;
    }
    return element.children || [];
  }
  getParent?(element: Job): vscode.ProviderResult<Job> {
    throw new Error("Method not implemented. 3");
  }
  resolveTreeItem?(
    item: vscode.TreeItem,
    element: Job,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.TreeItem> {
    throw new Error("Method not implemented. 4");
  }
}
