import { expect, test, describe, vi, afterEach } from "vitest";
import {
  initTerminal,
  sendTextToTerminal,
  showTerminal,
} from "../src/terminal";

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

describe("terminal", () => {
  test('initTerminal("Hello World")', () => {
    const terminal = {
      sendText: vi.fn(),
    };
    const spy = vi.spyOn(terminal, "sendText");
    initTerminal(terminal as any);
    sendTextToTerminal("ls -la");
    expect(spy).toHaveBeenCalledWith("ls -la");
  });
  test("showTerminal()", () => {
    const terminal = {
      show: vi.fn(),
    };
    const spy = vi.spyOn(terminal, "show");
    initTerminal(terminal as any);
    showTerminal(true);
    expect(spy).toHaveBeenCalledWith(true);
  });
});
