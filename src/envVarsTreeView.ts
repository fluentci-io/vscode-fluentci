import * as vscode from "vscode";
import { Job } from "./jobsTreeView";
import { existsSync, readFileSync } from "fs";
import { parse } from "envfile";
import { workspaceFolder } from "./workspace";

export interface Env {
  name: string;
  value: string;
  children?: Job[];
}

export class EnvVarsTreeProvider implements vscode.TreeDataProvider<Env> {
  protected _onDidChangeTreeData = new vscode.EventEmitter<Env | null>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh() {
    this._onDidChangeTreeData.fire(null);
  }

  getTreeItem(element: Env): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return {
      label: element.name,
      collapsibleState: vscode.TreeItemCollapsibleState.None,
      contextValue: "fluentci-env-var",
    };
  }
  getChildren(element?: Env | undefined): vscode.ProviderResult<Env[]> {
    let envVars: Env[] = [];
    if (existsSync(`${workspaceFolder!.uri.fsPath}/.fluentci/.env`)) {
      const envFile = readFileSync(
        `${workspaceFolder!.uri.fsPath}/.fluentci/.env`,
        "utf8"
      );
      const parsedEnvFile = parse(envFile);
      for (const key in parsedEnvFile) {
        if (Object.prototype.hasOwnProperty.call(parsedEnvFile, key)) {
          const value = parsedEnvFile[key];
          envVars.push({
            name: key,
            value,
          });
        }
      }
    }
    return Promise.resolve(envVars);
  }
  getParent?(element: Env): vscode.ProviderResult<Env> {
    throw new Error("Method not implemented. 3");
  }
  resolveTreeItem?(
    item: vscode.TreeItem,
    element: Env,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.TreeItem> {
    throw new Error("Method not implemented. 4");
  }
}
