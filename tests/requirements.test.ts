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
            args[1](new Error("Deno is not installed"));
          }
        }),
      },
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
    expect(vscode.window.showErrorMessage).toHaveBeenCalledOnce();
    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
      "Deno is not installed, Deno is required to run FluentCI jobs"
    );
  });
});
