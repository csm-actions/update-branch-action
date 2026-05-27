import * as core from "@actions/core";
import * as client from "./client";
import * as server from "./server";

export const main = async () => {
  const serverRepositoryName = core.getInput("server_repository_name");
  if (serverRepositoryName) {
    await client.action();
  } else {
    await server.action();
  }
};
