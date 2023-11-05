import { expect, test, describe, vi, afterEach } from "vitest";
import {
  initOutputChannel,
  appendLineToOutputChannel,
  showOutputChannel,
} from "../src/outputChannel";

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

describe("outputChannel", () => {
  test("initOutputChannel()", () => {
    const outputChannel = {
      appendLine: vi.fn(),
    };
    const spy = vi.spyOn(outputChannel, "appendLine");
    initOutputChannel(outputChannel as any);
    appendLineToOutputChannel("Hello World");
    expect(spy).toHaveBeenCalledWith("Hello World");
  });
  test('appendLineToOutputChannel("Hello World")', () => {
    const outputChannel = {
      appendLine: vi.fn(),
    };
    initOutputChannel(outputChannel as any);
    appendLineToOutputChannel("Hello World");
    expect(outputChannel.appendLine).toHaveBeenCalledWith("Hello World");
  });
  test("showOutputChannel()", () => {
    const outputChannel = {
      show: vi.fn(),
    };
    initOutputChannel(outputChannel as any);
    showOutputChannel(true);
    expect(outputChannel.show).toHaveBeenCalledWith(true);
  });
});
