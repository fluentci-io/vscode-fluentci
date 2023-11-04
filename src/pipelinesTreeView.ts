import * as vscode from "vscode";
import { getIconPath } from "./icons";
import { Job } from "./jobsTreeView";
import { appendLineToOutputChannel, showOutputChannel } from "./outputChannel";
import { spawn } from "child_process";
import { workspaceFolder } from "./workspace";

export interface Pipeline {
  name: string;
  description: string;
  repo_name: string;
  version: string;
  children?: Job[];
}

export class PipelinesTreeProvider
  implements vscode.TreeDataProvider<Pipeline>
{
  onDidChangeTreeData?:
    | vscode.Event<void | Pipeline | Pipeline[] | null | undefined>
    | undefined;
  getTreeItem(element: Pipeline): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return {
      label: element.name,
      tooltip: element.description,
      collapsibleState: element.repo_name
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None,
      contextValue: element.repo_name
        ? "fluentci-prebuilt-pipeline"
        : "fluentci-pp-job",
      iconPath: element.repo_name
        ? new vscode.ThemeIcon("layers")
        : getIconPath("steps/step_success.svg"),
    };
  }
  getChildren(
    element?: Pipeline | undefined
  ): vscode.ProviderResult<Pipeline[]> {
    if (!element) {
      return fetch("https://api.fluentci.io/v1/pipelines?limit=100")
        .then((response) => response.json())
        .then((data) =>
          data
            .filter((x: any) => x.name !== "nix_installer_pipeline")
            .sort((a: any, b: any) => a.name.localeCompare(b.name))
            .map((x: any) => ({
              name: x.name,
              description: x.description,
              repo_name: x.repo_name,
              version: x.version,
            }))
        );
    }

    vscode.window.setStatusBarMessage("Fetching Jobs...");
    const childProcess = spawn(
      "deno",
      [
        "eval",
        `
     import { runnableJobs , jobDescriptions } from 'https://pkg.fluentci.io/${element.name}@${element.version}/src/dagger/jobs.ts';
     console.log(JSON.stringify(Object.keys(runnableJobs).map(x => ({ name: x, description: jobDescriptions[x]}))));`,
      ],
      {
        cwd: workspaceFolder?.uri.fsPath,
      }
    );
    const jobs = new Promise<
      { name: string; description: string; pipeline: string }[]
    >((resolve) => {
      childProcess.stdout.on("data", (data) => {
        const jobs = JSON.parse(data.toString());
        appendLineToOutputChannel(
          `=> ${element.name}@${element.version} Jobs:`
        );
        appendLineToOutputChannel(JSON.stringify(jobs, null, 2));
        resolve(jobs.map((x: any) => ({ ...x, pipeline: element.name })));
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

    vscode.window.setStatusBarMessage("Jobs Fetched!");
    vscode.window.setStatusBarMessage("");

    return jobs as any;
  }
  getParent?(element: Pipeline): vscode.ProviderResult<Pipeline> {
    throw new Error("Method not implemented. 3");
  }
  resolveTreeItem?(
    item: vscode.TreeItem,
    element: Pipeline,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.TreeItem> {
    throw new Error("Method not implemented. 4");
  }
}
