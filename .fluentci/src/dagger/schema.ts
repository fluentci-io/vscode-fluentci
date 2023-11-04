import {
  queryType,
  makeSchema,
  dirname,
  join,
  resolve,
  stringArg,
  nonNull,
} from "../../deps.ts";

import { test, build, install, run } from "./jobs.ts";

const Query = queryType({
  definition(t) {
    t.string("test", {
      args: {
        src: nonNull(stringArg()),
        packageManager: nonNull(stringArg()),
        nodeVersion: nonNull(stringArg()),
      },
      resolve: async (_root, args, _ctx) =>
        await test(args.src, args.packageManager, args.nodeVersion),
    });
    t.string("build", {
      args: {
        src: nonNull(stringArg()),
        packageManager: nonNull(stringArg()),
        nodeVersion: nonNull(stringArg()),
      },
      resolve: async (_root, args, _ctx) =>
        await build(args.src, args.packageManager, args.nodeVersion),
    });
    t.string("install", {
      args: {
        src: nonNull(stringArg()),
        packageManager: nonNull(stringArg()),
        nodeVersion: nonNull(stringArg()),
      },
      resolve: async (_root, args, _ctx) =>
        await install(args.src, args.packageManager, args.nodeVersion),
    });
    t.string("run", {
      args: {
        src: nonNull(stringArg()),
        task: nonNull(stringArg()),
        packageManager: nonNull(stringArg()),
        nodeVersion: nonNull(stringArg()),
      },
      resolve: async (_root, args, _ctx) =>
        await run(args.src, args.task, args.packageManager, args.nodeVersion),
    });
  },
});

export const schema = makeSchema({
  types: [Query],
  outputs: {
    schema: resolve(join(dirname(".."), dirname(".."), "schema.graphql")),
    typegen: resolve(join(dirname(".."), dirname(".."), "gen", "nexus.ts")),
  },
});
