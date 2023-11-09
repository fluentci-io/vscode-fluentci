import { expect, test, describe, vi, afterEach } from "vitest";
import { activate } from "../src/extension";
import * as vscode from "vscode";
import { PipelinesTreeProvider } from "../src/pipelinesTreeView";
import { JobsTreeProvider } from "../src/jobsTreeView";

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

vi.mock("child_process", () => {
  return {
    spawn: vi.fn(() => ({
      stderr: {
        on: vi.fn(),
      },
    })),
  };
});

describe("extension", () => {
  test("activate()", () => {
    const context = {
      extensionUri: "",
      subscriptions: [],
    };
    const spyOnCommands = vi.spyOn(vscode.commands, "registerCommand");
    const spyCreateTreeView = vi.spyOn(vscode.window, "createTreeView");
    activate(context as any);
    expect(context.subscriptions.length).toBe(3);
    expect(spyOnCommands).toHaveBeenCalledTimes(16);
    expect(spyCreateTreeView).toHaveBeenCalledTimes(2);
    expect(spyCreateTreeView).toHaveBeenCalledWith("fluentci-explorer.jobs", {
      treeDataProvider: new JobsTreeProvider(),
    });
    expect(spyCreateTreeView).toHaveBeenCalledWith(
      "fluentci-explorer.pipelines",
      {
        treeDataProvider: new PipelinesTreeProvider(),
      }
    );
  });
});
