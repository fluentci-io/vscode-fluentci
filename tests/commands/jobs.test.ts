import { expect, test, describe, vi, afterEach, beforeEach } from "vitest";
import * as vscode from "vscode";
import { registerJobsCommands } from "../../src/commands/jobs";
import { initResources } from "../../src/icons";
import { initOutputChannel } from "../../src/outputChannel";
import { initTerminal } from "../../src/terminal";

afterEach(() => {
  vi.restoreAllMocks();
});

const mocks = vi.hoisted(() => ({
  fn: Promise.resolve(),
  quickpick: {
    title: "",
    items: [],
    onDidChangeSelection: vi.fn((...args: any[]) => {
      mocks.fn = args[0]([
        {
          label: "test",
          description: "Run tests",
        },
      ]);
    }),
    onDidHide: vi.fn(),
    show: vi.fn(),
    dispose: vi.fn(),
  },
}));

vi.mock("fs", () => {
  return {
    existsSync: vi.fn((_path: string) => {
      return true;
    }),
  };
});

vi.mock("child_process", () => {
  return {
    spawn: vi.fn((..._args: string[]) => ({
      stdout: {
        on: vi.fn((...args: any[]) => {
          args[1](`[{"name":"test","description":"Run tests"}]`);
        }),
      },
    })),
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
      createTerminal: vi.fn((...args: any[]) => ({
        show: vi.fn(),
        sendText: vi.fn(),
      })),
      createTreeView: vi.fn(),
      createQuickPick: vi.fn((...args: any[]) => mocks.quickpick),
      setStatusBarMessage: vi.fn(),
      showInputBox: vi.fn(),
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
  test("registerJobsCommands()", async () => {
    const context = {
      extensionUri: "/home/user/.vscode/extensions/fluentci",
    };
    const outputChannel = vscode.window.createOutputChannel("Fluent CI");
    const terminal = vscode.window.createTerminal("Fluent CI");

    initResources(context as any);
    initOutputChannel(outputChannel as any);
    initTerminal(terminal as any);

    const spyOnCommands = vi.spyOn(vscode.commands, "registerCommand");
    const spyOnShowQuickpick = vi.spyOn(mocks.quickpick, "show");
    const spyOnShowTerminal = vi.spyOn(terminal, "show");
    const spyOnSendTextToTerminal = vi.spyOn(terminal, "sendText");
    registerJobsCommands();
    vscode.commands.executeCommand("fluentci.runJob");
    expect(spyOnCommands).toHaveBeenCalledTimes(2);
    expect(spyOnCommands).toHaveBeenCalledWith(
      "fluentci.runJob",
      expect.any(Function)
    );
    await mocks.fn;
    expect(mocks.quickpick.title).toBe("Select a Job");
    expect(mocks.quickpick.items).toEqual([
      {
        label: "test",
        description: "Run tests",
      },
    ]);
    expect(spyOnShowTerminal).toHaveBeenCalledWith(true);
    expect(spyOnSendTextToTerminal).toHaveBeenCalledWith("fluentci run . test");
    expect(spyOnShowQuickpick).toHaveBeenCalledOnce();
    vscode.commands.executeCommand("fluentci.runJobFromPrebuiltPipeline");
    expect(spyOnCommands).toHaveBeenCalledWith(
      "fluentci.runJobFromPrebuiltPipeline",
      expect.any(Function)
    );

    expect(mocks.quickpick.title).toBe("Select a Pipeline (1/2)");
    expect(mocks.quickpick.items.length).toBe(28);
    await mocks.fn;
    expect(mocks.quickpick.title).toBe("Select a Job (2/2)");
    expect(mocks.quickpick.items).toEqual([
      {
        label: "test",
        description: "Run tests",
      },
    ]);
    expect(spyOnShowQuickpick).toBeCalledTimes(3);
  });
});
