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
  const action = core.getInput("action");

  if (core.getState("post")) {
    await revoke(core.getState("token"), core.getState("expires_at"));
    return;
  }
  core.saveState("post", "true");

  switch (action) {
    case "client":
      await client.action();
      return;
    case "server":
      await server.action();
      return;
    default:
      throw new Error(`Unknown action: ${action}`);
  }
};
