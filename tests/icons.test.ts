import { expect, test, describe, vi, afterEach } from "vitest";
import { initResources, getIconPath } from "../src/icons";

afterEach(() => {
  vi.restoreAllMocks();
});

vi.mock("vscode", () => {
  return {
    extensionUri: "/home/user/.vscode/extensions/fluentci",
    Uri: {
      joinPath: vi.fn((...args: string[]) => {
        return args.join("/");
      }),
    },
  };
});

describe("icons", () => {
  test("initResources()", () => {
    const context = {
      extensionUri: "/home/user/.vscode/extensions/fluentci",
    };
    initResources(context as any);
    expect(context.extensionUri).toBe("/home/user/.vscode/extensions/fluentci");
  });

  test("getIconPath()", () => {
    const iconPath = getIconPath("test.svg");
    expect(iconPath).toBe(
      "/home/user/.vscode/extensions/fluentci/resources/icons/light/test.svg"
    );
  });
});
