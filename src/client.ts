import * as core from "@actions/core";
import * as github from "@actions/github";
import * as updateBranchAction from "@csm-actions/update-branch-action";

export const action = async () => {
  const appID = core.getInput("app_id", { required: true });
  const appPrivateKey = core.getInput("app_private_key", { required: true });
  const serverRepositoryName = core.getInput("server_repository_name", {
    required: true,
  });
  const serverRepositoryOwner = core.getInput("server_repository_owner");
  const owner = core.getInput("repository_owner") || github.context.repo.owner;
  const repo = core.getInput("repository_name") || github.context.repo.repo;
  const pullRequestNumberInput = core.getInput("pull_request_number").trim();

  let numbers: number[] = [];
  if (pullRequestNumberInput.startsWith("[")) {
    numbers = JSON.parse(pullRequestNumberInput);
  } else {
    for (const n of pullRequestNumberInput.split("\n")) {
      const a = n
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map(Number);
      numbers.push(...a);
    }
  }

  const results = await Promise.allSettled(
    numbers.map((prNumber) =>
      updateBranchAction.update({
        appID,
        appPrivateKey,
        serverRepositoryName,
        serverRepositoryOwner,
        owner,
        repo,
        pullRequestNumber: prNumber,
      }),
    ),
  );

  const errors: Error[] = [];
  for (const result of results) {
    if (result.status === "rejected") {
      core.error(result.reason);
      errors.push(result.reason);
    }
  }
  if (results.some((result) => result.status === "fulfilled")) {
    core.notice(
      `Branches will be updated. Please check the server workflow: ${github.context.serverUrl}/${serverRepositoryOwner}/${serverRepositoryName}/actions`,
    );
  }
  if (errors.length > 0) {
    throw new Error(`Failed to update ${errors.length} PR(s)`);
  }
};
