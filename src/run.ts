import * as core from "@actions/core";
import * as githubAppToken from "@suzuki-shunsuke/github-app-token";
import * as client from "./client";
import * as server from "./server";

const revoke = async (token: string, expiresAt: string) => {
  if (!token) {
    return;
  }
  if (expiresAt && githubAppToken.hasExpired(expiresAt)) {
    core.info("GitHub App token has already expired");
    return;
  }
  core.info("Revoking GitHub App token");
  return githubAppToken.revoke(token);
};

export const main = async () => {
  if (core.getState("post")) {
    await revoke(core.getState("token"), core.getState("expires_at"));
    return;
  }
  core.saveState("post", "true");

  const serverRepositoryName = core.getInput("server_repository_name");
  if (serverRepositoryName) {
    await client.action();
  } else {
    await server.action();
  }
};
