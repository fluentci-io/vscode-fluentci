import { expect, test, describe, vi, afterEach, beforeEach } from "vitest";
import { initResources } from "../src/icons";
import { initOutputChannel } from "../src/outputChannel";
import * as vscode from "vscode";
import { initTerminal } from "../src/terminal";
import { EnvVarsTreeProvider } from "../src/envVarsTreeView";

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
    EventEmitter: vi.fn(),
  };
});

describe("envVarsTreeView", () => {
  test("getTreeItem()", () => {
    const jobsTreeProvider = new EnvVarsTreeProvider();
    const item: any = jobsTreeProvider.getTreeItem({
      name: "HELLO",
      value: "123",
    });
    expect(item.label).toBe("HELLO");
    expect(item.contextValue).toBe("fluentci-env-var");
  });
});
