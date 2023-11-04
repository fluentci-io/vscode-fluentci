import Client, { connect } from "../../deps.ts";

export enum Job {
  test = "test",
  build = "build",
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
    const pm = Deno.env.get("PACKAGE_MANAGER") || packageManager || "npm";
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
      .withExec([pm, "run", "test"]);

    const result = await ctr.stdout();

    console.log(result);
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
    const pm = Deno.env.get("PACKAGE_MANAGER") || packageManager || "npm";
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
      .withExec([pm, "run", "build"]);

    const result = await ctr.stdout();

    console.log(result);
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
      .withExec([pm, "run", task]);

    const result = await ctr.stdout();

    console.log(result);
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
  [Job.build]: build,
  [Job.run]: run,
  [Job.install]: install,
};

export const jobDescriptions: Record<Job, string> = {
  [Job.test]: "Run tests",
  [Job.build]: "Build the project",
  [Job.run]: "Run a task",
  [Job.install]: "Install dependencies",
};
