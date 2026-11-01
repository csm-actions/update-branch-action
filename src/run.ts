import * as core from "@actions/core";
import * as client from "./client";
import * as server from "./server";

export const main = async () => {
  if (
    core.getInput("server_repository_name") ||
    core.getInput("server_workflow_ref")
  ) {
    await client.action();
  } else {
    await server.action();
  }
};
