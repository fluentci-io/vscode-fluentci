import Client, { connect } from "../../deps.ts";

export enum Job {
  test = "test",
  coverage = "coverage",
  build = "build",
  publish = "publish",
  run = "run",
  install = "install",
}

export const exclude = [".git", ".devbox", "node_modules", ".fluentci"];

export const test = async (
  src = ".",
  packageManager?: string,
  nodeVersion?: string
) => {
  await connect(async (client: Client) => {
    const context = client.host().directory(src);
    const pm = Deno.env.get("PACKAGE_MANAGER") || packageManager || "bun";
    const version = Deno.env.get("NODE_VERSION") || nodeVersion || "v18.16.1";
    const ctr = client
      .pipeline(Job.test)
      .container()
      .from("pkgxdev/pkgx:latest")
      .withExec(["apt-get", "update"])
      .withExec(["apt-get", "install", "-y", "ca-certificates"])
      .withExec([
        "pkgx",
        "install",
        `node@${version}`,
        "npm",
        "bun",
        "pnpm",
        "classic.yarnpkg.com",
        "rtx",
      ])
      .withExec(["sh", "-c", "echo 'eval $(rtx activate bash)' >> ~/.bashrc"])
      .withMountedCache(
        "/app/node_modules",
        client.cacheVolume(`node_modules_${pm}`)
      )
      .withDirectory("/app", context, { exclude })
      .withWorkdir("/app")
      .withExec([pm, "install"])
      .withExec([
        "sh",
        "-c",
        "[ -f client.gen.ts ] && rm client.gen.ts || true",
      ])
      .withExec([pm, "run", "test", "--", "--run"]);

    await ctr.stdout();
  });
  return "Done";
};

export const build = async (
  src = ".",
  packageManager?: string,
  nodeVersion?: string
) => {
  await connect(async (client: Client) => {
    const context = client.host().directory(src);
    const pm = Deno.env.get("PACKAGE_MANAGER") || packageManager || "bun";
    const version = Deno.env.get("NODE_VERSION") || nodeVersion || "18.16.1";
    const ctr = client
      .pipeline(Job.build)
      .container()
      .from("pkgxdev/pkgx:latest")
      .withExec(["apt-get", "update"])
      .withExec(["apt-get", "install", "-y", "ca-certificates"])
      .withExec([
        "pkgx",
        "install",
        `node@${version}`,
        "npm",
        "bun",
        "pnpm",
        "classic.yarnpkg.com",
        "rtx",
      ])
      .withExec(["sh", "-c", "echo 'eval $(rtx activate bash)' >> ~/.bashrc"])
      .withMountedCache(
        "/app/node_modules",
        client.cacheVolume(`node_modules_${pm}`)
      )
      .withMountedCache("/app/dist", client.cacheVolume("dist"))
      .withDirectory("/app", context, { exclude })
      .withWorkdir("/app")
      .withExec([
        "sh",
        "-c",
        "[ -f client.gen.ts ] && rm client.gen.ts || true",
      ])
      .withExec([pm, "install"])
      .withExec([pm, "run", "vsce:package"])
      .withExec(["ls", "-la"]);

    await ctr.stdout();
  });
  return "Done";
};

export const publish = async (
  src = ".",
  packageManager?: string,
  nodeVersion?: string
) => {
  await connect(async (client: Client) => {
    const context = client.host().directory(src);
    const pm = Deno.env.get("PACKAGE_MANAGER") || packageManager || "bun";
    const version = Deno.env.get("NODE_VERSION") || nodeVersion || "18.16.1";
    const token = Deno.env.get("VSCE_PAT");
    if (!token) {
      throw new Error(
        "VSCE_PAT not set, see https://code.visualstudio.com/api/working-with-extensions/publishing-extension"
      );
    }
    const ctr = client
      .pipeline(Job.publish)
      .container()
      .from("pkgxdev/pkgx:latest")
      .withExec(["apt-get", "update"])
      .withExec(["apt-get", "install", "-y", "ca-certificates"])
      .withExec([
        "pkgx",
        "install",
        `node@${version}`,
        "npm",
        "bun",
        "pnpm",
        "classic.yarnpkg.com",
        "rtx",
      ])
      .withExec(["sh", "-c", "echo 'eval $(rtx activate bash)' >> ~/.bashrc"])
      .withMountedCache(
        "/app/node_modules",
        client.cacheVolume(`node_modules_${pm}`)
      )
      .withMountedCache("/app/dist", client.cacheVolume("dist"))
      .withDirectory("/app", context, { exclude })
      .withWorkdir("/app")
      .withExec([
        "sh",
        "-c",
        "[ -f client.gen.ts ] && rm client.gen.ts || true",
      ])
      .withEnvVariable("VSCE_PAT", token)
      .withExec([pm, "install"])
      .withExec([pm, "run", "vsce:package"])
      .withExec(["ls", "-la"])
      .withExec([pm, "run", "vsce:publish"])
      .withExec([
        "bash",
        "-c",
        `cp fluentci-*.vsix vscode-fluentci-${Deno.env.get(
          "RELEASE_VERSION"
        )}.vsix`,
      ]);

    await ctr
      .file(`vscode-fluentci-${Deno.env.get("RELEASE_VERSION")}.vsix`)
      .export(`./vscode-fluentci-${Deno.env.get("RELEASE_VERSION")}.vsix`);
    await ctr.stdout();
  });
  return "Done";
};

export const run = async (
  src = ".",
  task: string,
  packageManager?: string,
  nodeVersion?: string
) => {
  await connect(async (client: Client) => {
    const context = client.host().directory(src);
    const pm = Deno.env.get("PACKAGE_MANAGER") || packageManager || "npm";
    const version = Deno.env.get("NODE_VERSION") || nodeVersion || "18.16.1";
    const ctr = client
      .pipeline(Job.run)
      .container()
      .from("pkgxdev/pkgx:latest")
      .withExec(["apt-get", "update"])
      .withExec(["apt-get", "install", "-y", "ca-certificates"])
      .withExec([
        "pkgx",
        "install",
        `node@${version}`,
        "npm",
        "bun",
        "pnpm",
        "classic.yarnpkg.com",
        "rtx",
      ])
      .withExec(["sh", "-c", "echo 'eval $(rtx activate bash)' >> ~/.bashrc"])
      .withMountedCache(
        "/app/node_modules",
        client.cacheVolume(`node_modules_${pm}`)
      )
      .withMountedCache("/app/dist", client.cacheVolume("dist"))
      .withDirectory("/app", context, { exclude })
      .withWorkdir("/app")
      .withExec([
        "sh",
        "-c",
        "[ -f client.gen.ts ] && rm client.gen.ts || true",
      ])
      .withExec([pm, "install"])
      .withExec([pm, "run", task]);

    const result = await ctr.stdout();

    console.log(result);
  });
  return "Done";
};

export const coverage = async (src = ".") => {
  await connect(async (client: Client) => {
    const context = client.host().directory(src);
    const version = Deno.env.get("NODE_VERSION") || "18.16.1";
    const ctr = client
      .pipeline(Job.run)
      .container()
      .from("pkgxdev/pkgx:latest")
      .withExec(["apt-get", "update"])
      .withExec(["apt-get", "install", "-y", "ca-certificates"])
      .withExec(["pkgx", "install", `node@${version}`, "bun", "pnpm", "rtx"])
      .withExec(["sh", "-c", "echo 'eval $(rtx activate bash)' >> ~/.bashrc"])
      .withMountedCache("/app/node_modules", client.cacheVolume(`node_modules`))
      .withDirectory("/app", context, { exclude })
      .withWorkdir("/app")
      .withExec([
        "sh",
        "-c",
        "[ -f client.gen.ts ] && rm client.gen.ts || true",
      ])
      .withExec(["pnpm", "install"])
      .withExec(["bun", "run", "coverage"]);

    await ctr.stdout();
    await ctr.directory("/app/coverage").export("./coverage");
  });
  return "Done";
};

export const install = async (
  src = ".",
  packageManager?: string,
  nodeVersion?: string
) => {
  await connect(async (client: Client) => {
    const context = client.host().directory(src);
    const pm = Deno.env.get("PACKAGE_MANAGER") || packageManager || "npm";
    const version = Deno.env.get("NODE_VERSION") || nodeVersion || "18.16.1";
    const ctr = client
      .pipeline(Job.install)
      .container()
      .from("pkgxdev/pkgx:latest")
      .withExec(["apt-get", "update"])
      .withExec(["apt-get", "install", "-y", "ca-certificates"])
      .withExec([
        "pkgx",
        "install",
        `node@${version}`,
        "npm",
        "bun",
        "pnpm",
        "classic.yarnpkg.com",
        "rtx",
      ])
      .withExec(["sh", "-c", "echo 'eval $(rtx activate bash)' >> ~/.bashrc"])
      .withMountedCache(
        "/app/node_modules",
        client.cacheVolume(`node_modules_${pm}`)
      )
      .withMountedCache("/app/dist", client.cacheVolume("dist"))
      .withDirectory("/app", context, { exclude })
      .withWorkdir("/app")
      .withExec([pm, "install"]);

    const result = await ctr.stdout();

    console.log(result);
  });
  return "Done";
};

export type JobExec =
  | ((
      src?: string,
      packageManager?: string,
      nodeVersion?: string
    ) => Promise<string>)
  | ((
      src: string,
      task: string,
      packageManager?: string,
      nodeVersion?: string
    ) => Promise<string>);

export const runnableJobs: Record<Job, JobExec> = {
  [Job.test]: test,
  [Job.coverage]: coverage,
  [Job.build]: build,
  [Job.publish]: publish,
  [Job.run]: run,
  [Job.install]: install,
};

export const jobDescriptions: Record<Job, string> = {
  [Job.test]: "Run tests",
  [Job.coverage]: "Run tests with coverage",
  [Job.build]: "Build the project",
  [Job.publish]: "Publish to VSCode Marketplace",
  [Job.run]: "Run a task",
  [Job.install]: "Install dependencies",
};
