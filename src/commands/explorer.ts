import * as vscode from "vscode";
import { Job, JobsTreeProvider } from "../jobsTreeView";
import { Pipeline, PipelinesTreeProvider } from "../pipelinesTreeView";
import { sendTextToTerminal, showTerminal } from "../terminal";
import { renderMarkdown } from "../mdEngine";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { verifyWorkspace, workspaceFolder } from "../workspace";
import { parse, stringify } from "envfile";
import { EnvVarsTreeProvider } from "../envVarsTreeView";

export function registerExplorerCommands(providers: {
  jobsTreeProvider: JobsTreeProvider;
  pipelinesTreeProvider: PipelinesTreeProvider;
  envVarsTreeProvider: EnvVarsTreeProvider;
}) {
  vscode.commands.registerCommand("fluentci-explorer.runJob", (args: Job) => {
    if (!verifyWorkspace()) {
      return;
    }
    showTerminal(true);
    sendTextToTerminal(`fluentci run . ${args.name}`);
  });

  vscode.commands.registerCommand(
    "fluentci-explorer.runCurrentPipeline",
    (_args: Pipeline) => {
      if (!verifyWorkspace()) {
        return;
      }
      showTerminal(true);
      sendTextToTerminal("fluentci run .");
    }
  );

  vscode.commands.registerCommand(
    "fluentci-explorer.runPrebuiltPipeline",
    (args: Pipeline) => {
      showTerminal(true);
      sendTextToTerminal(`fluentci run ${args.name}`);
    }
  );

  vscode.commands.registerCommand(
    "fluentci-explorer.runJobFromPrebuiltPipeline",
    (args: Job) => {
      showTerminal(true);
      sendTextToTerminal(`fluentci run ${args.pipeline} ${args.name}`);
    }
  );

  vscode.commands.registerCommand(
    "fluentci-explorer.showDocs",
    (_args: Pipeline) => {
      if (!verifyWorkspace()) {
        return;
      }
      const panel = vscode.window.createWebviewPanel(
        "markdownPreview",
        "Pipeline Docs",
        vscode.ViewColumn.One,
        {}
      );
      // open the readme file from the fluentci directory
      const data = readFileSync(
        `${workspaceFolder?.uri.fsPath}/.fluentci/README.md`
      );
      panel.webview.html = renderMarkdown(data.toString());
    }
  );

  vscode.commands.registerCommand(
    "fluentci-explorer.showPrebuiltPipelineDocs",
    (args: Pipeline) => {
      const panel = vscode.window.createWebviewPanel(
        "markdownPreview",
        `${args.name} docs`,
        vscode.ViewColumn.One,
        {}
      );
      fetch(
        `https://cdn.jsdelivr.net/gh/${args.repo_name}@${args.version}/README.md`
      )
        .then((response) => response.text())
        .then((text) => {
          panel.webview.html = renderMarkdown(text);
        });
    }
  );

  vscode.commands.registerCommand(
    "fluentci-explorer.env_vars.addEnvVar",
    async () => {
      const name = await vscode.window.showInputBox({
        prompt: "Enter name for new environment variable",
      });
      if (!name) {
        return;
      }
      const value = await vscode.window.showInputBox({
        prompt: "Enter the new environment variable value",
      });

      if (!value) {
        return;
      }

      if (!existsSync(`${workspaceFolder!.uri.fsPath}/.fluentci/.env`)) {
        const newEnvFile = stringify({
          [name]: value,
        });
        writeFileSync(
          `${workspaceFolder!.uri.fsPath}/.fluentci/.env`,
          newEnvFile
        );
        providers.envVarsTreeProvider.refresh();
        return;
      }
      const envFile = readFileSync(
        `${workspaceFolder!.uri.fsPath}/.fluentci/.env`,
        "utf8"
      );
      const parsedEnvFile = parse(envFile);
      parsedEnvFile[name] = value;
      const newEnvFile = stringify(parsedEnvFile);
      writeFileSync(
        `${workspaceFolder!.uri.fsPath}/.fluentci/.env`,
        newEnvFile
      );
      providers.envVarsTreeProvider.refresh();
    }
  );

  vscode.commands.registerCommand(
    "fluentci-explorer.env_vars.editEnvVar",
    async (args: any) => {
      const value = await vscode.window.showInputBox({
        prompt: "Enter the new environment variable value",
      });
      if (!value) {
        return;
      }
      const envFile = readFileSync(
        `${workspaceFolder!.uri.fsPath}/.fluentci/.env`,
        "utf8"
      );
      const parsedEnvFile = parse(envFile);
      parsedEnvFile[args.name] = value;
      const newEnvFile = stringify(parsedEnvFile);
      writeFileSync(
        `${workspaceFolder!.uri.fsPath}/.fluentci/.env`,
        newEnvFile
      );
    }
  );

  vscode.commands.registerCommand(
    "fluentci-explorer.env_vars.deleteEnvVar",
    async (args: any) => {
      const acceptText = "Yes, delete this environment variable";
      try {
        const answer = await vscode.window.showInformationMessage(
          `Are you sure you want to delete ${args.name}?`,
          {
            modal: true,
            detail:
              "Deleting this environment variable will delete it from all pipelines that use it and cannot be undone",
          },
          acceptText
        );

        if (answer !== acceptText) {
          return;
        }

        const envFile = readFileSync(
          `${workspaceFolder!.uri.fsPath}/.fluentci/.env`,
          "utf8"
        );
        const parsedEnvFile = parse(envFile);
        delete parsedEnvFile[args.name];
        const newEnvFile = stringify(parsedEnvFile);
        writeFileSync(
          `${workspaceFolder!.uri.fsPath}/.fluentci/.env`,
          newEnvFile
        );
        providers.envVarsTreeProvider.refresh();
      } catch (e) {
        await vscode.window.showErrorMessage((e as Error).message);
      }
    }
  );

  vscode.commands.registerCommand("fluentci-explorer.jobs.refresh", () => {
    providers.jobsTreeProvider.refresh();
  });

  vscode.commands.registerCommand("fluentci-explorer.env_vars.refresh", () => {
    providers.envVarsTreeProvider.refresh();
  });
}
