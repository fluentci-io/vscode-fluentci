import { expect, test, describe, vi, afterEach } from "vitest";
import * as vscode from "vscode";
import { verifyRequirements } from "../src/requirements";
import { initOutputChannel } from "../src/outputChannel";

afterEach(() => {
  vi.restoreAllMocks();
});

vi.mock("child_process", () => {
  return {
    spawn: vi.fn(() => ({
      stderr: {
        on: vi.fn(),
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
    expect(vscode.window.showErrorMessage).not.toHaveBeenCalled();
  });
});
