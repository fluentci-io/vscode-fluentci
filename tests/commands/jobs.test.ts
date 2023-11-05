import { expect, test, describe, vi, afterEach } from "vitest";
import * as vscode from "vscode";
import { registerJobsCommands } from "../../src/commands/jobs";

afterEach(() => {
  vi.restoreAllMocks();
});

vi.mock("vscode", () => {
  return {
    commands: {
      registerCommand: vi.fn(),
    },
    window: {
      createOutputChannel: () => {
        return {
          appendLine: vi.fn(),
        };
      },
      createTerminal: vi.fn(),
      createTreeView: vi.fn(),
    },
    workspace: {
      workspaceFolders: [
        {
          uri: {
            fsPath: "/workspace",
          },
        },
      ],
    },
  };
});

describe("commands", () => {
  test("registerJobsCommands()", () => {
    const spyOnCommands = vi.spyOn(vscode.commands, "registerCommand");
    registerJobsCommands();
    expect(spyOnCommands).toHaveBeenCalledTimes(2);
  });
});
