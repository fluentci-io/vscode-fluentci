import { expect, test, describe, vi, afterEach, beforeEach } from "vitest";
import { registerConfigsCommand } from "../../src/commands/configs";
import * as childProcess from "child_process";
import * as vscode from "vscode";
import { initTerminal } from "../../src/terminal";
import { initOutputChannel } from "../../src/outputChannel";

afterEach(() => {
  vi.restoreAllMocks();
});

const mocks = vi.hoisted(() => {
  return {
    quickpick: {
      title: "",
      items: [],
      onDidChangeSelection: vi.fn((...args: any[]) => {
        args[0]([
          {
            label: "Basic",
            description: "A Minimal Pipeline to get you started",
            name: "base_pipeline",
            readme:
              "https://cdn.jsdelivr.net/gh/fluent-ci-templates/rust-pipeline@v0.6.3/README.md",
            url: "https://pkg.fluentci.io/base_pipeline@v0.5.2",
          },
        ]);
      }),
      onDidHide: vi.fn(),
      show: vi.fn(),
      dispose: vi.fn(),
    },
  };
});

beforeEach(() => {
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
        createQuickPick: vi.fn((...args: any[]) => mocks.quickpick),
        setStatusBarMessage: vi.fn(),
        showInformationMessage: vi.fn(),
        showErrorMessage: vi.fn(),
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
});

vi.mock("child_process", () => {
  return {
    spawn: vi.fn((..._args: string[]) => ({
      stdout: {
        on: vi.fn((...args: any[]) => {
          args[1]("");
        }),
      },
      stderr: {
        on: vi.fn((...args: any[]) => {
          args[1]("");
        }),
      },
      on: vi.fn((...args: any[]) => {
        args[1](0);
      }),
    })),
  };
});

describe("commands", () => {
  test("registerConfigsCommand() - remove config", () => {
    vi.mock("fs", () => {
      return {
        existsSync: vi.fn((_path: string) => {
          return true;
        }),
      };
    });
    const terminal = {
      show: vi.fn(),
      sendText: vi.fn(),
    };
    const outputChannel = {
      appendLine: vi.fn(),
    };
    initTerminal(terminal as any);
    initOutputChannel(outputChannel as any);
    const spyOnCommands = vi.spyOn(vscode.commands, "registerCommand");
    const spyOnSpawn = vi.spyOn(childProcess, "spawn");
    registerConfigsCommand();
    vscode.commands.executeCommand("fluentci.removeConfigs");
    expect(spyOnCommands).toHaveBeenCalledWith(
      "fluentci.removeConfigs",
      expect.any(Function)
    );
    expect(spyOnSpawn).toHaveBeenCalledWith("rm", [
      "-rf",
      "/workspace/.fluentci",
    ]);
  });
});
