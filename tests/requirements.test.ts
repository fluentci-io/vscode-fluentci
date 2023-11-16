import { expect, test, describe, vi, afterEach } from "vitest";
import * as vscode from "vscode";
import { verifyRequirements } from "../src/requirements";
import { initOutputChannel } from "../src/outputChannel";

afterEach(() => {
  vi.restoreAllMocks();
});

vi.mock("child_process", () => {
  return {
    spawn: vi.fn((...spawnArgs: string[]) => ({
      stderr: {
        on: vi.fn((...args: any[]) => {
          if (spawnArgs[0] === "deno") {
            args[1](
              new Error(
                "Deno is not installed, Deno is required to run FluentCI jobs"
              )
            );
          }
          if (spawnArgs[0] === "docker" && spawnArgs[1][0] === "--version") {
            args[1](
              new Error(
                "Docker is not installed, Docker is required to run FluentCI jobs"
              )
            );
          }
          if (spawnArgs[0] === "docker" && spawnArgs[1][0] === "info") {
            args[1](new Error("Docker is not running, please start docker"));
          }
          if (spawnArgs[0] === "fluentci") {
            args[1](
              new Error(
                "FluentCI is not installed, FluentCI is required to run FluentCI jobs"
              )
            );
          }
          if (spawnArgs[0] === "dagger") {
            args[1](
              new Error(
                "Dagger is not installed, Dagger is required to run FluentCI jobs"
              )
            );
          }
        }),
      },
      on: vi.fn(),
    })),
  };
});

vi.mock("vscode", () => {
  return {
    workspace: {
      workspaceFolders: [
        {
          uri: {
            fsPath: "/home/user/workspace",
          },
        },
      ],
    },
    window: {
      showErrorMessage: vi.fn(),
    },
  };
});

describe("requirements", () => {
  test("verifyRequirements()", () => {
    const outputChannel = {
      appendLine: vi.fn(),
    };
    initOutputChannel(outputChannel as any);
    verifyRequirements();
    expect(vscode.window.showErrorMessage).toHaveBeenCalledTimes(4);
    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
      "Deno is not installed, Deno is required to run FluentCI jobs"
    );
    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
      "Docker is not installed, Docker is required to run FluentCI jobs"
    );
    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
      "FluentCI is not installed, FluentCI is required to run FluentCI jobs"
    );
    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
      "Dagger is not installed, Dagger is required to run FluentCI jobs"
    );
  });
});
