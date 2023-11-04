import { gql } from "../../deps.ts";

export const test = gql`
  query test($src: String!, $packageManager: String!, $nodeVersion: String!) {
    test(src: $src, packageManager: $packageManager, nodeVersion: $nodeVersion)
  }
`;

export const build = gql`
  query build($src: String!, $packageManager: String!, $nodeVersion: String!) {
    build(src: $src, packageManager: $packageManager, nodeVersion: $nodeVersion)
  }
`;

export const run = gql`
  query run(
    $src: String!
    $task: String!
    $packageManager: String!
    $nodeVersion: String!
  ) {
    run(
      src: $src
      task: $task
      packageManager: $packageManager
      nodeVersion: $nodeVersion
    )
  }
`;

export const install = gql`
  query install($src: String!) {
    install(
      src: $src
      packageManager: $packageManager
      nodeVersion: $nodeVersion
    )
  }
`;
