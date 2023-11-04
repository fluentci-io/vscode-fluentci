# Node.js Pipeline

[![fluentci pipeline](https://img.shields.io/badge/dynamic/json?label=pkg.fluentci.io&labelColor=%23000&color=%23460cf1&url=https%3A%2F%2Fapi.fluentci.io%2Fv1%2Fpipeline%2Fnodejs_pipeline&query=%24.version)](https://pkg.fluentci.io/nodejs_pipeline)
[![deno module](https://shield.deno.dev/x/nodejs_pipeline)](https://deno.land/x/nodejs_pipeline)
![deno compatibility](https://shield.deno.dev/deno/^1.37)
[![codecov](https://img.shields.io/codecov/c/gh/fluent-ci-templates/nodejs-pipeline)](https://codecov.io/gh/fluent-ci-templates/nodejs-pipeline)

A ready-to-use CI/CD Pipeline for your [Node.js](https://nodejs.org/en) projects.

## 🚀 Usage

Run the following command:

```bash
dagger run fluentci nodejs_pipeline
```

Or, if you want to use it as a template:

```bash
fluentci init -t nodejs
```

This will create a `.fluentci` folder in your project.

Now you can run the pipeline with:

```bash
dagger run fluentci .
```

Or simply:

```bash
fluentci
```

## Environment variables

| Variable          | Description                                | Default    |
| ----------------- | ------------------------------------------ | ---------- |
| NODE_VERSION      | Node version to use                        |  18.16.1   |
| PACKAGE_MANAGER   | Package manager to use (npm, yarn, pnpm)   |  npm       |

## Jobs

| Job     | Description          |
| ------- | -------------------- |
| build   | Build the project    |
| install | Install dependencies |
| test    | Run the tests        |
| run     | Run a custom task    |

```graphql
build(
  nodeVersion: String!, 
  packageManager: String!, 
  src: String!
): String

install(
  nodeVersion: String!,
  packageManager: String!, 
  src: String!
): String

run(
  nodeVersion: String!, 
  packageManager: String!, 
  src: String!, 
  task: String!
): String

test(
  nodeVersion: String!, 
  packageManager: String!, 
  src: String!
): String
```

## Programmatic usage

You can also use this pipeline programmatically:

```ts
import { test, build } from "https://pkg.fluentci.io/nodejs_pipeline@v0.4.2/mod.ts";

await test();
await build();
```
