import { expect, test, describe, vi, afterEach } from "vitest";
import { registerConfigsCommand } from "../../src/commands/configs";
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

describe("commands", () => {
  test("registerConfigsCommand()", () => {
    const terminal = {
      show: vi.fn(),
      sendText: vi.fn(),
    };
    const outputChannel = {
      appendLine: vi.fn(),
    };
    const spyShowTerminal = vi.spyOn(terminal, "show");
    const spySendText = vi.spyOn(terminal, "sendText");
    const spyAppendLine = vi.spyOn(outputChannel, "appendLine");
    initTerminal(terminal as any);
    initOutputChannel(outputChannel as any);
    const spyOnCommands = vi.spyOn(vscode.commands, "registerCommand");
    const spyCreateQuikPick = vi.spyOn(vscode.window, "createQuickPick");
    const spyOnQuickPickShow = vi.spyOn(mocks.quickpick, "show");
    const spyDidHide = vi.spyOn(mocks.quickpick, "onDidHide");
    const spyDidChangeSelection = vi.spyOn(
      mocks.quickpick,
      "onDidChangeSelection"
    );
    registerConfigsCommand();
    vscode.commands.executeCommand("fluentci.init");
    expect(spyOnCommands).toHaveBeenCalledTimes(2);
    expect(spyOnCommands).toHaveBeenCalledWith(
      "fluentci.init",
      expect.any(Function)
    );
    expect(spyOnCommands).toHaveBeenCalledWith(
      "fluentci.removeConfigs",
      expect.any(Function)
    );
    expect(spyCreateQuikPick).toHaveBeenCalledTimes(1);
    expect(spyOnQuickPickShow).toHaveBeenCalledTimes(1);
    expect(spyDidHide).toHaveBeenCalledTimes(1);
    expect(spyDidChangeSelection).toHaveBeenCalledTimes(1);
    expect(mocks.quickpick.title).toBe("Create from Prebuilt Pipeline");
    expect(mocks.quickpick.items.length).toBe(28);
    expect(spyShowTerminal).toHaveBeenCalledWith(true);
    expect(spySendText).toHaveBeenCalledWith("fluentci init -t base_pipeline");
    expect(spyAppendLine).toHaveBeenCalledWith("Workspace folder: /workspace");
  });
});
