import { expect, test, describe, vi, afterEach } from "vitest";
import * as vscode from "vscode";
import { registerDoctorCommand } from "../../src/commands/doctor";
import { initTerminal } from "../../src/terminal";

afterEach(() => {
  vi.restoreAllMocks();
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
  test("registerDoctorCommand()", () => {
    const terminal = {
      show: vi.fn(),
      sendText: vi.fn(),
    };
    initTerminal(terminal as any);
    const spyOnCommands = vi.spyOn(vscode.commands, "registerCommand");
    const spyOnSendText = vi.spyOn(terminal, "sendText");
    const spyOnShow = vi.spyOn(terminal, "show");
    registerDoctorCommand();
    vscode.commands.executeCommand("fluentci.doctor");
    expect(spyOnCommands).toHaveBeenCalledTimes(1);
    expect(spyOnCommands).toHaveBeenCalledWith(
      "fluentci.doctor",
      expect.any(Function)
    );
    expect(spyOnSendText).toHaveBeenCalledTimes(1);
    expect(spyOnShow).toHaveBeenCalledTimes(1);
    expect(spyOnSendText).toHaveBeenCalledWith("fluentci doctor");
  });
});
