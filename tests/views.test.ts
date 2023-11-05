import * as vscode from "vscode";
import { expect, test, describe, vi, afterEach } from "vitest";
import { registerExplorerViews } from "../src/views";
import { JobsTreeProvider } from "../src/jobsTreeView";
import { PipelinesTreeProvider } from "../src/pipelinesTreeView";

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

describe("views", () => {
  test("register", () => {
    const context = {
      subscriptions: [],
    };
    const spyCreateTreeView = vi.spyOn(vscode.window, "createTreeView");
    registerExplorerViews(context as any);
    expect(context.subscriptions.length).toBe(2);
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
