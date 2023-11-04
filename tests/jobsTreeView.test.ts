import { expect, test, describe, vi, afterEach, beforeEach } from "vitest";
import { JobsTreeProvider } from "../src/jobsTreeView";
import { initResources } from "../src/icons";
import { initOutputChannel } from "../src/outputChannel";
import * as vscode from "vscode";
import { initTerminal } from "../src/terminal";

beforeEach(() => {
  const context = {
    extensionUri: "/home/user/.vscode/extensions/fluentci",
  };
  const outputChannel = vscode.window.createOutputChannel("Fluent CI");
  const terminal = vscode.window.createTerminal("Fluent CI");

  initResources(context as any);
  initOutputChannel(outputChannel as any);
  initTerminal(terminal as any);
});

afterEach(() => {
  vi.restoreAllMocks();
});

vi.mock("vscode", () => {
  return {
    extensionUri: "/home/user/.vscode/extensions/fluentci",
    TreeItemCollapsibleState: {
      Collapsed: 1,
      Expanded: 2,
      None: 0,
    },
    Uri: {
      joinPath: vi.fn((...args: string[]) => {
        return args.join("/");
      }),
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
    window: {
      createOutputChannel: () => {
        return {
          appendLine: vi.fn(),
        };
      },
      createTerminal: vi.fn(),
      createTreeView: vi.fn(),
    },
  };
});

vi.mock("child_process", () => {
  return {
    spawn: vi.fn((..._args: string[]) => ({
      stdout: {
        on: vi.fn((...args: any[]) => {
          args[1](`[{"name":"test","description":"test description"}]`);
        }),
      },
    })),
  };
});

describe("jobsTreeView", () => {
  test("getTreeItem() - Pipeline", () => {
    const jobsTreeProvider = new JobsTreeProvider();
    const item: any = jobsTreeProvider.getTreeItem({
      name: "pipeline",
      description: "pipeline description",
      children: [
        {
          name: "job",
          description: "job description",
        },
      ],
    });
    expect(item.label).toBe("pipeline");
    expect(item.tooltip).toBe("pipeline description");
    expect(item.collapsibleState).toBe(2);
    expect(item.contextValue).toBe("fluentci-pipeline");
  });

  test("getTreeItem() - Job", () => {
    const jobsTreeProvider = new JobsTreeProvider();
    const item: any = jobsTreeProvider.getTreeItem({
      name: "test",
      description: "test description",
    });
    expect(item.label).toBe("test");
    expect(item.tooltip).toBe("test description");
    expect(item.collapsibleState).toBe(0);
    expect(item.contextValue).toBe("fluentci-job");
    expect(item.iconPath).toBe(
      "/home/user/.vscode/extensions/fluentci/resources/icons/light/steps/step_success.svg"
    );
  });

  test("getChildren() - Root", async () => {
    const jobsTreeProvider = new JobsTreeProvider();
    const children = await jobsTreeProvider.getChildren();
    expect(children).toStrictEqual([
      {
        name: "default_pipeline",
        children: [
          {
            name: "test",
            description: "test description",
          },
        ],
      },
    ]);
  });

  test("getChildren() - Pipeline", () => {
    const jobsTreeProvider = new JobsTreeProvider();
    const children = jobsTreeProvider.getChildren({
      name: "pipeline",
      description: "pipeline description",
      children: [
        {
          name: "job",
          description: "job description",
        },
      ],
    });
    expect(children).toStrictEqual([
      {
        name: "job",
        description: "job description",
      },
    ]);
  });

  test("getChildren() - Job", () => {
    const jobsTreeProvider = new JobsTreeProvider();
    const children = jobsTreeProvider.getChildren({
      name: "job",
      description: "job description",
    });
    expect(children).toStrictEqual([]);
  });
});
