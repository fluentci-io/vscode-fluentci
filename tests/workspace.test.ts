import { expect, test, describe, vi, afterEach } from "vitest";
import * as vscode from "vscode";
import { verifyWorkspace } from "../src/workspace";

afterEach(() => {
  vi.restoreAllMocks();
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
  test("verifyWorkspace()", () => {
    vi.mock("fs", () => {
      return {
        existsSync: vi.fn(() => true),
      };
    });
    const spy = vi.spyOn(vscode.window, "showErrorMessage");
    expect(verifyWorkspace()).toBe(true);
    expect(spy).not.toHaveBeenCalled();
  });
});
