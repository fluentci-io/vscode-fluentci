import * as vscode from "vscode";
import { sendTextToTerminal, showTerminal } from "../terminal";
import { appendLineToOutputChannel, showOutputChannel } from "../outputChannel";
import { spawn } from "child_process";
import { pipelines } from "../pipelines";
import { verifyWorkspace, workspaceFolder } from "../workspace";

export function registerJobsCommands() {
  vscode.commands.registerCommand("fluentci.runJob", async () => {
    if (!verifyWorkspace()) {
      return;
    }
    const childProcess = spawn(
      "deno",
      [
        "eval",
        `
   import { runnableJobs , jobDescriptions } from './.fluentci/src/dagger/jobs.ts';
   console.log(JSON.stringify(Object.keys(runnableJobs).map(x => ({ name: x, description: jobDescriptions[x]}))));`,
      ],
      {
        cwd: workspaceFolder?.uri.fsPath,
      }
    );
    const jobs = await new Promise<{ name: string; description: string }[]>(
      (resolve, reject) => {
        childProcess.stdout.on("data", (data) => {
          const jobs = JSON.parse(data.toString());
          appendLineToOutputChannel(jobs);
          resolve(jobs);
        });
        childProcess.stderr.on("data", (data) => {
          appendLineToOutputChannel(
            data.toString().replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "")
          );
          reject();
        });
      }
    );

    const quickPick = vscode.window.createQuickPick();

    quickPick.title = "Select a Job";
    quickPick.items = jobs.map((x) => ({
      label: x.name,
      description: x.description,
    }));
    quickPick.onDidChangeSelection(async (selection) => {
      quickPick.dispose();
      showTerminal(true);
      sendTextToTerminal(`fluentci run . ${selection[0].label}`);
      return;
    });
    quickPick.onDidHide(() => quickPick.dispose());
    quickPick.show();
  });

  vscode.commands.registerCommand(
    "fluentci.runJobFromPrebuiltPipeline",
    async () => {
      const quickPick = vscode.window.createQuickPick<{
        label: string;
        name: string;
        description: string;
        readme: string;
        url: string;
      }>();
      quickPick.title = "Select a Pipeline (1/2)";
      quickPick.items = pipelines;
      quickPick.onDidChangeSelection(async (selection) => {
        quickPick.dispose();
        vscode.window.setStatusBarMessage("Fetching Jobs...");
        const childProcess = spawn(
          "deno",
          [
            "eval",
            `
     import { runnableJobs , jobDescriptions } from '${selection[0].url}/src/dagger/jobs.ts';
     console.log(JSON.stringify(Object.keys(runnableJobs).map(x => ({ name: x, description: jobDescriptions[x]}))));`,
          ],
          {
            cwd: workspaceFolder?.uri.fsPath,
          }
        );
        const jobs = await new Promise<{ name: string; description: string }[]>(
          (resolve) => {
            childProcess.stdout.on("data", (data) => {
              const jobs = JSON.parse(data.toString());
              appendLineToOutputChannel(data.toString());
              resolve(jobs);
            });
            childProcess.stderr.on("data", (data) => {
              showOutputChannel(true);
              appendLineToOutputChannel(
                data.toString().replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "")
              );
            });
          }
        );

        vscode.window.setStatusBarMessage("Jobs Fetched!");
        vscode.window.setStatusBarMessage("");

        const jobsQuickPick = vscode.window.createQuickPick();
        jobsQuickPick.title = "Select a Job (2/2)";
        jobsQuickPick.items = jobs.map((x) => ({
          label: x.name,
          description: x.description,
        }));
        jobsQuickPick.onDidChangeSelection((job) => {
          jobsQuickPick.dispose();
          showTerminal(true);
          sendTextToTerminal(
            `fluentci run ${selection[0].name} ${job[0].label}`
          );
        });
        jobsQuickPick.onDidHide(() => quickPick.dispose());
        jobsQuickPick.show();
      });
      quickPick.onDidHide(() => quickPick.dispose());
      quickPick.show();
    }
  );
}
