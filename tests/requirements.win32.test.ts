import { expect, test, describe, vi, afterEach } from "vitest";
import * as vscode from "vscode";
import { verifyRequirements } from "../src/requirements";

afterEach(() => {
  vi.restoreAllMocks();
});

vi.mock("os", () => {
  return {
    platform: vi.fn((..._args: string[]) => "win32"),
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
  test("verifyRequirements() - win32", () => {
    verifyRequirements();
    expect(vscode.window.showErrorMessage).toHaveBeenCalledOnce();
    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
      "FluentCI is only supported on Linux and MacOS"
    );
  });
});
