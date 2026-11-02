import * as core from "@actions/core";
import * as github from "@actions/github";
import * as githubAppToken from "@suzuki-shunsuke/github-app-token";
import { deleteLabel } from "./delete_label";
import { newAppOctokit } from "./app_octokit";

export type Request = {
  owner: string;
  repo: string;
  prNumber: number;
};

// GitHub owner and repository names consist of alphanumerics, "-", "_", and ".".
const validateName = (key: string, value: string): string => {
  if (!/^[A-Za-z0-9_.-]+$/.test(value) || /^\.+$/.test(value)) {
    throw new Error(`${key} is invalid: ${value}`);
  }
  return value;
};

/**
 * Parses a pull request number strictly.
 * Number() and parseInt() accept values such as "0x1A", "1e3", " 42 ",
 * and "123abc", so the format is checked first.
 */
const parsePRNumber = (key: string, value: string): number => {
  const n = Number(value);
  if (!/^[1-9][0-9]*$/.test(value) || !Number.isSafeInteger(n)) {
    throw new Error(`${key} must be a positive integer, got ${value}`);
  }
  return n;
};

export const parseLabelDescription = (description: string): Request => {
  // Format: "owner/repo/pr_number"
  const parts = description.split("/");
  if (parts.length !== 3) {
    throw new Error(
      `Invalid label description format: ${description}. Expected format: owner/repo/pr_number`,
    );
  }
  return {
    owner: validateName(
      "the repository owner of the label description",
      parts[0],
    ),
    repo: validateName(
      "the repository name of the label description",
      parts[1],
    ),
    prNumber: parsePRNumber(
      "the pull request number of the label description",
      parts[2],
    ),
  };
};

const dispatchInputNames = [
  "repository_owner",
  "repository_name",
  "pull_request_number",
] as const;

/**
 * Reads the pull request from the inputs of a workflow_dispatch event, which
 * the client action sets.
 */
export const readDispatchInputs = (
  inputs: Record<string, unknown> | undefined,
): Request => {
  const values: Record<string, string> = {};
  const missing: string[] = [];
  for (const name of dispatchInputNames) {
    const value = inputs?.[name];
    if (typeof value !== "string" || !value) {
      missing.push(name);
      continue;
    }
    values[name] = value;
  }
  if (missing.length > 0) {
    throw new Error(
      `The workflow_dispatch event must have the inputs ${dispatchInputNames.join(", ")}. Missing: ${missing.join(", ")}`,
    );
  }
  return {
    owner: validateName("repository_owner", values.repository_owner),
    repo: validateName("repository_name", values.repository_name),
    prNumber: parsePRNumber("pull_request_number", values.pull_request_number),
  };
};

/**
 * Fails unless a workflow_dispatch event runs on the default branch.
 *
 * Unlike a label event, which always runs the workflow on the default branch,
 * workflow_dispatch lets the client choose any branch or tag of the server
 * repository, where an old and vulnerable server workflow may remain.
 * The default branch is read from the event payload, so no API call is needed.
 */
export const validateRef = (
  ref: string,
  defaultBranch: string | undefined,
): void => {
  if (!defaultBranch) {
    throw new Error(
      "The default branch of the server repository isn't found in the event payload",
    );
  }
  if (ref !== `refs/heads/${defaultBranch}`) {
    throw new Error(
      `The server workflow must run on the default branch ${defaultBranch}, but got ${ref}`,
    );
  }
};

/**
 * Reads the pull request to update.
 *
 * When the server workflow is run by a workflow_dispatch event, it's read from
 * the inputs of the event. Otherwise it's read from the label
 * (labels:created event), and the label is deleted.
 */
const readRequest = async (): Promise<Request> => {
  if (github.context.eventName === "workflow_dispatch") {
    validateRef(
      github.context.ref,
      github.context.payload.repository?.default_branch,
    );
    return readDispatchInputs(github.context.payload.inputs);
  }
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
  return parseLabelDescription(labelDescription);
};

export const action = async () => {
  const { owner, repo, prNumber } = await readRequest();

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
    octokit: newAppOctokit(),
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
    if (isAlreadyUpToDate(error)) {
      core.notice("The branch is already up to date. Skipping the update.");
      return;
    }
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

// The update-a-pull-request-branch API returns 422 when the head branch already contains the base branch.
// https://docs.github.com/rest/pulls/pulls#update-a-pull-request-branch
export const isAlreadyUpToDate = (error: unknown): boolean => {
  if (typeof error !== "object" || error === null) {
    return false;
  }
  const { status, message } = error as { status?: unknown; message?: unknown };
  return (
    status === 422 &&
    typeof message === "string" &&
    message.includes("There are no new commits on the base branch")
  );
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
  return githubAppToken.revoke(token.token, {
    baseUrl: github.context.apiUrl,
  });
};
