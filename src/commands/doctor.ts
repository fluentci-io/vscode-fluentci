import * as vscode from "vscode";
import { sendTextToTerminal, showTerminal } from "../terminal";

export function registerDoctorCommand() {
  vscode.commands.registerCommand("fluentci.doctor", () => {
    showTerminal(true);
    sendTextToTerminal("fluentci doctor");
  });
}
