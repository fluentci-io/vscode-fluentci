import { expect, test, describe, vi, afterEach, beforeEach } from "vitest";
import { PipelinesTreeProvider } from "../src/pipelinesTreeView";
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
      setStatusBarMessage: vi.fn(),
    },
    ThemeIcon: vi.fn(
      (...args: string[]) =>
        `/home/user/.vscode/extensions/fluentci/resources/icons/${args[0]}/${args[1]}.svg`
    ),
    EventEmitter: vi.fn(),
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

global.fetch = vi.fn(async () => {
  return {
    json: vi.fn(async () => {
      return [
        {
          id: 3,
          name: "android_pipeline",
          description:
            "A ready-to-use CI/CD Pipeline and jobs for Android projects",
          license: "MIT License",
          license_url: "https://api.github.com/licenses/mit",
          license_spdx: "MIT",
          collaborators: null,
          owner: "fluent-ci-templates",
          avatar_url: "https://avatars.githubusercontent.com/u/138609742?v=4",
          homepage: null,
          github_url: "https://github.com/fluent-ci-templates/android-pipeline",
          repo_name: "fluent-ci-templates/android-pipeline",
          version: "0.1.0",
        },
      ];
    }),
  } as any;
});

describe("pipelinesTreeView", () => {
  test("getTreeItem() - Pipeline", () => {
    const jobsTreeProvider = new PipelinesTreeProvider();
    const item: any = jobsTreeProvider.getTreeItem({
      name: "pipeline",
      description: "pipeline description",
      repo_name: "repo",
      version: "1.0.0",
      children: [
        {
          name: "job",
          description: "job description",
        },
      ],
    });
    expect(item.label).toBe("pipeline");
    expect(item.tooltip).toBe("pipeline description");
    expect(item.collapsibleState).toBe(1);
    expect(item.contextValue).toBe("fluentci-prebuilt-pipeline");
  });

  test("getTreeItem() - Job", () => {
    const pipelinesTreeProvider = new PipelinesTreeProvider();
    const item: any = pipelinesTreeProvider.getTreeItem({
      name: "test",
      description: "test description",
      repo_name: "repo",
      version: "1.0.0",
    });
    expect(item.label).toBe("test");
    expect(item.tooltip).toBe("test description");
    expect(item.collapsibleState).toBe(1);
    expect(item.contextValue).toBe("fluentci-prebuilt-pipeline");
  });

  test("getChildren() - Root", async () => {
    const pipelinesTreeProvider = new PipelinesTreeProvider();
    const children = await pipelinesTreeProvider.getChildren();
    expect(children).toStrictEqual([
      {
        name: "android_pipeline",
        description:
          "A ready-to-use CI/CD Pipeline and jobs for Android projects",
        repo_name: "fluent-ci-templates/android-pipeline",
        version: "0.1.0",
      },
    ]);
  });

  test("getChildren() - Pipeline", () => {
    const pipelinesTreeProvider = new PipelinesTreeProvider();
    const children = pipelinesTreeProvider.getChildren({
      name: "pipeline",
      description: "pipeline description",
      repo_name: "repo",
      version: "1.0.0",
      children: [
        {
          name: "job",
          description: "job description",
        },
      ],
    });
    expect(children).toStrictEqual(
      Promise.resolve([
        {
          name: "job",
          description: "job description",
        },
      ])
    );
  });

  test("getChildren() - Job", () => {
    const pipelinesTreeProvider = new PipelinesTreeProvider();
    const children = pipelinesTreeProvider.getChildren({
      name: "job",
      description: "job description",
      repo_name: "repo",
      version: "1.0.0",
    });
    expect(children).toStrictEqual(Promise.resolve([]));
  });
});
