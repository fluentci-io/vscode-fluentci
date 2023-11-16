import { expect, test, describe, vi, afterEach } from "vitest";
import * as vscode from "vscode";
import * as fs from "fs";
import { registerExplorerCommands } from "../../src/commands/explorer";
import { initTerminal } from "../../src/terminal";
import { registerExplorerViews } from "../../src/views";

afterEach(() => {
  vi.restoreAllMocks();
});

global.fetch = vi.fn(async () => {
  return {
    text: vi.fn(async () => "# Hello World"),
  } as any;
});

const mocks = vi.hoisted(() => ({
  fn: Promise.resolve(),
  panel: {
    webview: {
      html: "",
    },
  },
}));

vi.mock("vscode", () => {
  const _commands: { [key: string]: (...args: any[]) => any } = {};
  return {
    commands: {
      registerCommand: vi.fn((...args: any[]) => {
        _commands[args[0]] = args[1];
      }),
      executeCommand: vi.fn((...args: any[]) =>
        _commands[args[0]](...args.slice(1))
      ),
    },
    window: {
      createOutputChannel: () => {
        return {
          appendLine: vi.fn(),
        };
      },
      createTerminal: vi.fn(),
      createTreeView: vi.fn(),
      createWebviewPanel: vi.fn((...args: any[]) => mocks.panel),
      showInformationMessage: vi.fn((...args: any[]) =>
        Promise.resolve("Yes, delete this environment variable")
      ),
      showInputBox: vi.fn((...args: any[]) => Promise.resolve("HELLO")),
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
    ViewColumn: {
      One: 1,
    },
    EventEmitter: vi.fn((...args: any[]) => ({
      fire: vi.fn(),
    })),
  };
});

vi.mock("fs", () => {
  return {
    existsSync: vi.fn((_path: string) => {
      return true;
    }),
    readFileSync: vi.fn((_path: string) => {
      return "HELLO=123";
    }),
    writeFileSync: vi.fn((_path: string, _data: string) => {}),
  };
});

describe("commands", () => {
  test("registerExplorerCommands() - environment variables", async () => {
    const terminal = {
      show: vi.fn(),
      sendText: vi.fn(),
    };
    initTerminal(terminal as any);
    const spyOnCommands = vi.spyOn(vscode.commands, "registerCommand");
    const spyOnSendText = vi.spyOn(terminal, "sendText");
    const spyOnShow = vi.spyOn(terminal, "show");
    const spyOnCreateWebviewPanel = vi.spyOn(
      vscode.window,
      "createWebviewPanel"
    );
    const spyOnReadFileSync = vi.spyOn(fs, "readFileSync");
    const spyFetch = vi.spyOn(global, "fetch");
    const context = {
      subscriptions: [],
    };
    const providers = registerExplorerViews(context as any);
    registerExplorerCommands(providers);
    await vscode.commands.executeCommand(
      "fluentci-explorer.env_vars.addEnvVar"
    );
    await vscode.commands.executeCommand(
      "fluentci-explorer.env_vars.editEnvVar",
      {
        name: "HELLO",
      }
    );
    await vscode.commands.executeCommand(
      "fluentci-explorer.env_vars.deleteEnvVar",
      {
        name: "HELLO",
      }
    );
    vscode.commands.executeCommand("fluentci-explorer.env_vars.refresh");

    expect(spyOnCommands).toHaveBeenCalledTimes(11);
    expect(spyOnCommands).toHaveBeenCalledWith(
      "fluentci-explorer.env_vars.addEnvVar",
      expect.any(Function)
    );
    expect(spyOnCommands).toHaveBeenCalledWith(
      "fluentci-explorer.env_vars.editEnvVar",
      expect.any(Function)
    );
    expect(spyOnCommands).toHaveBeenCalledWith(
      "fluentci-explorer.env_vars.deleteEnvVar",
      expect.any(Function)
    );
    expect(spyOnReadFileSync).toHaveBeenCalledTimes(3);
  });
});
