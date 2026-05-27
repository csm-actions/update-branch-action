import * as core from "@actions/core";
import * as github from "@actions/github";
import * as githubAppToken from "@suzuki-shunsuke/github-app-token";
import { deleteLabel } from "./delete_label";

const parseLabelDescription = (
  description: string,
): { owner: string; repo: string; prNumber: number } => {
  // Format: "owner/repo/pr_number"
  const parts = description.split("/");
  if (parts.length !== 3) {
    throw new Error(
      `Invalid label description format: ${description}. Expected format: owner/repo/pr_number`,
    );
  }
  return {
    owner: parts[0],
    repo: parts[1],
    prNumber: Number(parts[2]),
  };
};

export const action = async () => {
  const labelDescription = core.getInput("label_description", {
    required: false,
  });
  const labelName = core.getInput("label_name", {
    required: false,
  });
  if (!labelDescription) {
    throw new Error("Label description is required");
  }

  await deleteLabel(labelName);

  const { owner, repo, prNumber } = parseLabelDescription(labelDescription);

  const permissions: githubAppToken.Permissions = {
    pull_requests: "write",
    contents: "write",
  };
  core.info(
    `creating a GitHub App token: ${JSON.stringify({
      owner: owner,
      repositories: [repo],
      permissions: permissions,
    })}`,
  );
  const token = await githubAppToken.create({
    appId: core.getInput("app_id", { required: true }),
    privateKey: core.getInput("app_private_key", { required: true }),
    owner: owner,
    repositories: [repo],
    permissions: permissions,
  });

  const octokit = github.getOctokit(token.token);

  try {
    core.notice(
      `Updating a PR branch: ${process.env.GITHUB_SERVER_URL}/${owner}/${repo}/pull/${prNumber}`,
    );
    await octokit.rest.pulls.updateBranch({
      owner,
      repo,
      pull_number: prNumber,
    });
  } catch (error) {
    // Post error comment to PR
    const workflowUrl = `${process.env.GITHUB_SERVER_URL}/${github.context.repo.owner}/${github.context.repo.repo}/actions/runs/${github.context.runId}`;
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body: `## :x: Failed to update the branch\n\n[Workflow](${workflowUrl})`,
    });
    throw error;
  } finally {
    await revoke(token);
  }
};

export const revoke = async (token: githubAppToken.Token) => {
  if (!token) {
    return;
  }
  if (token.expiresAt && githubAppToken.hasExpired(token.expiresAt)) {
    core.info("GitHub App token has already expired");
    return;
  }
  core.info("Revoking GitHub App token");
  return githubAppToken.revoke(token.token);
};
