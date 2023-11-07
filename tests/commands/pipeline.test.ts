import { expect, test, describe, vi, afterEach } from "vitest";
import * as vscode from "vscode";
import { registerPipelineCommands } from "../../src/commands/pipeline";
import { initResources } from "../../src/icons";
import { initOutputChannel } from "../../src/outputChannel";
import { initTerminal } from "../../src/terminal";

afterEach(() => {
  vi.restoreAllMocks();
});

const mocks = vi.hoisted(() => ({
  quickpick: {
    title: "",
    items: [],
    onDidChangeSelection: vi.fn((...args: any[]) => {
      args[0]([
        {
          label: "Chromatic",
          description:
            "A ready-to-use Pipeline for uploading Storybook to Chromatic",
          name: "chromatic_pipeline",
          readme:
            "https://cdn.jsdelivr.net/gh/fluent-ci-templates/chromatic-pipeline@v0.6.6/README.md",
          url: "https://pkg.fluentci.io/chromatic_pipeline@v0.6.6",
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
  test("registerPipelinesCommand()", () => {
    const context = {
      extensionUri: "/home/user/.vscode/extensions/fluentci",
      subscriptions: [],
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
    registerPipelineCommands(context as any);
    expect(spyOnCommands).toHaveBeenCalledTimes(2);
    vscode.commands.executeCommand("fluentci.run");
    expect(spyOnShowTerminal).toBeCalledWith(true);
    expect(spyOnSendTextToTerminal).toBeCalledWith("fluentci run .");
    vscode.commands.executeCommand("fluentci.runPrebuiltPipeline");
    expect(mocks.quickpick.title).toBe("Select a Pipeline");
    expect(mocks.quickpick.items.length).toBe(28);
    expect(spyOnShowTerminal).toBeCalledWith(true);
    expect(spyOnSendTextToTerminal).toBeCalledWith(
      "fluentci run chromatic_pipeline"
    );
    expect(spyOnShowQuickpick).toHaveBeenCalledOnce();
  });
});
