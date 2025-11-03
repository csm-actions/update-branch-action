import * as core from "@actions/core";
import * as github from "@actions/github";
import * as githubAppToken from "@suzuki-shunsuke/github-app-token";
import { newName } from "@csm-actions/label";

type Inputs = {
  appID: string;
  appPrivateKey: string;
  serverRepositoryName: string;
  serverRepositoryOwner: string;
  owner: string;
  repo: string;
  pullRequestNumber: string;
};

export const main = async () => {
  if (core.getState("post")) {
    const token = core.getState("token");
    const expiresAt = core.getState("expires_at");
    if (token) {
      if (expiresAt && githubAppToken.hasExpired(expiresAt)) {
        core.info("GitHub App token has already expired");
        return;
      }
      // This is post-cleanup: revoke the token created during main execution
      core.info("Revoking GitHub App token");
      return githubAppToken.revoke(token);
    }
    return;
  }
  core.saveState("post", "true");

  const inputs = {
    appID: core.getInput("app_id", {
      required: true,
    }),
    appPrivateKey: core.getInput("app_private_key", {
      required: true,
    }),
    serverRepositoryName: core.getInput("server_repository_name", {
      required: true,
    }),
    serverRepositoryOwner: core.getInput("server_repository_owner"),
    owner: core.getInput("repository_owner") || github.context.repo.owner,
    repo: core.getInput("repository_name") || github.context.repo.repo,
    pullRequestNumber: core.getInput("pull_request_number").trim(),
  };

  let numbers: number[] = [];
  if (inputs.pullRequestNumber.startsWith("[")) {
    numbers = JSON.parse(inputs.pullRequestNumber);
  } else {
    for (const n of inputs.pullRequestNumber.split("\n")) {
      const a = n.split(",").map(s => s.trim()).filter(s => s.length > 0).map(Number);
      numbers.push(...a);
    }
  }

  const permissions: githubAppToken.Permissions = {
    issues: "write",
  };
  core.info(`creating a GitHub App token: ${JSON.stringify({
    owner: inputs.serverRepositoryOwner,
    repositories: [inputs.serverRepositoryName],
    permissions: permissions,
  })}`);
  const token = await githubAppToken.create({
    appId: core.getInput("app_id"),
    privateKey: core.getInput("app_private_key"),
    owner: inputs.serverRepositoryOwner,
    repositories: [inputs.serverRepositoryName],
    permissions: permissions,
  });
  for (const prNumber of numbers) {
    const labelName = newName("update-branch-");
    const description = `${inputs.owner}/${inputs.repo}/${prNumber}`;
    core.info(`creating a label: ${JSON.stringify({
      owner: inputs.serverRepositoryOwner,
      repo: inputs.serverRepositoryName,
      label: {
        name: labelName,
        description: description,
      },
    })}`);
    const octokit = github.getOctokit(token.token);
    await octokit.rest.issues.createLabel({
      owner: inputs.serverRepositoryOwner,
      repo: inputs.serverRepositoryName,
      name: labelName,
      description: description,
    });
  }
};
