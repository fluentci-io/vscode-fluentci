import { expect, test, describe, vi, afterEach } from "vitest";
import * as vscode from "vscode";
import { registerPipelineCommands } from "../../src/commands/pipeline";

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
            fsPath: "",
          },
        },
      ],
    },
  };
});

describe("commands", () => {
  test("registerPipelinesCommand()", () => {
    const context = {
      extensionUri: "/workspace",
      subscriptions: [],
    };
    const spyOnCommands = vi.spyOn(vscode.commands, "registerCommand");
    registerPipelineCommands(context as any);
    expect(spyOnCommands).toHaveBeenCalledTimes(2);
  });
});
