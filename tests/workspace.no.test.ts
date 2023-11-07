import { expect, test, describe, vi, afterEach } from "vitest";
import * as vscode from "vscode";
import { verifyWorkspace } from "../src/workspace";
import { beforeEach } from "node:test";

afterEach(() => {
  vi.restoreAllMocks();
});

beforeEach(() => {
  vi.mock("fs", () => {
    return {
      existsSync: vi.fn(() => false),
    };
  });
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

describe("workspace", () => {
  test("verifyWorkspace() - without .fluentci", () => {
    const spy = vi.spyOn(vscode.window, "showErrorMessage");
    expect(verifyWorkspace()).toBe(false);
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(
      "FluentCI Configs Directory does not exist in this directory"
    );
  });
});
