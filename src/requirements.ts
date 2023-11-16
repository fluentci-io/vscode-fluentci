import * as vscode from "vscode";
import { spawn } from "child_process";
import { appendLineToOutputChannel } from "./outputChannel";
import { platform } from "os";

export function verifyRequirements() {
  if (platform() !== "linux" && platform() !== "darwin") {
    vscode.window.showErrorMessage(
      "FluentCI is only supported on Linux and MacOS"
    );
    return;
  }
  const deno = spawn("deno", ["--version"]);
  deno.stderr.on("data", (err) => {
    appendLineToOutputChannel("=> Deno is not installed");
    appendLineToOutputChannel(err);
    vscode.window.showErrorMessage(
      "Deno is not installed, Deno is required to run FluentCI jobs"
    );
  });

  const docker = spawn("docker", ["--version"]);
  docker.stderr.on("data", (err) => {
    appendLineToOutputChannel("=> Docker is not installed");
    appendLineToOutputChannel(err);
    vscode.window.showErrorMessage(
      "Docker is not installed, Docker is required to run FluentCI jobs"
    );
  });

  const dockerStatus = spawn("docker", ["info"]);
  dockerStatus.stderr.on("data", (err) => {
    appendLineToOutputChannel(err);
  });
  dockerStatus.on("close", (code) => {
    if (code !== 0) {
      appendLineToOutputChannel("=> Docker is not running");
      vscode.window.showErrorMessage(
        "Docker is not running, please start docker"
      );
    }
  });

  const fluentci = spawn("fluentci", ["--version"]);
  fluentci.stderr.on("data", (err) => {
    appendLineToOutputChannel("=> FluentCI is not installed");
    appendLineToOutputChannel(err.message);
    vscode.window.showErrorMessage(
      "FluentCI is not installed, FluentCI is required to run FluentCI jobs"
    );
  });

  const dagger = spawn("dagger", ["version"]);
  dagger.stderr.on("data", (err) => {
    appendLineToOutputChannel("Dagger is not installed");
    appendLineToOutputChannel(err.message);
    vscode.window.showErrorMessage(
      "Dagger is not installed, Dagger is required to run FluentCI jobs"
    );
  });
}
