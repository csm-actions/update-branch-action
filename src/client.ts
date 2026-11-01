import * as core from "@actions/core";
import * as github from "@actions/github";
import * as updateBranchAction from "@csm-actions/update-branch-action";
import { newAppOctokit } from "./app_octokit";

/**
 * Validates a pull request number strictly, as the server does, so that an
 * invalid value fails here instead of in the server workflow.
 */
const validatePRNumber = (value: unknown): number => {
  const s = String(value).trim();
  const n = Number(s);
  if (!/^[1-9][0-9]*$/.test(s) || !Number.isSafeInteger(n)) {
    throw new Error(
      `pull_request_number must be positive integers, got ${JSON.stringify(value)}`,
    );
  }
  return n;
};

/**
 * Parses pull request numbers separated by commas or newlines,
 * or a JSON array of them.
 */
export const parsePullRequestNumbers = (input: string): number[] => {
  const pullRequestNumberInput = input.trim();
  if (pullRequestNumberInput.startsWith("[")) {
    const parsed: unknown = JSON.parse(pullRequestNumberInput);
    if (!Array.isArray(parsed)) {
      throw new Error("pull_request_number must be a JSON array");
    }
    return parsed.map(validatePRNumber);
  }
  const numbers: number[] = [];
  for (const n of pullRequestNumberInput.split("\n")) {
    const a = n
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map(validatePRNumber);
    numbers.push(...a);
  }
  return numbers;
};

export const action = async () => {
  const appOctokit = newAppOctokit();
  const serverRepositoryName = core.getInput("server_repository_name");
  const serverRepositoryOwner = core.getInput("server_repository_owner");
  const serverWorkflowRef = core.getInput("server_workflow_ref");
  const owner = core.getInput("repository_owner") || github.context.repo.owner;
  const repo = core.getInput("repository_name") || github.context.repo.repo;
  const numbers = parsePullRequestNumbers(core.getInput("pull_request_number"));

  const results = await Promise.allSettled(
    numbers.map((prNumber) =>
      updateBranchAction.update({
        appOctokit,
        serverWorkflowRef,
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
  // With server_workflow_ref, the URL of each server workflow run is printed
  // by the library, so this notice is for the label-based flow.
  if (
    !serverWorkflowRef &&
    results.some((result) => result.status === "fulfilled")
  ) {
    core.notice(
      `Branches will be updated. Please check the server workflow: ${github.context.serverUrl}/${serverRepositoryOwner}/${serverRepositoryName}/actions`,
    );
  }
  if (errors.length > 0) {
    throw new Error(`Failed to update ${errors.length} PR(s)`);
  }
};
