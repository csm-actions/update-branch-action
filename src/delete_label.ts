import * as core from "@actions/core";
import * as github from "@actions/github";

export const deleteLabel = async (labelName: string) => {
  if (!core.getBooleanInput("delete_label")) {
    return;
  }
  const repository = `${github.context.repo.owner}/${github.context.repo.repo}`;
  const token = core.getInput("github_token_to_delete_label");
  if (!token) {
    core.warning(
      `Failed to delete a label of ${repository}: github_token_to_delete_label is required`,
    );
    return;
  }
  if (!labelName) {
    core.warning(
      `Failed to delete a label of ${repository}: label_name is required`,
    );
    return;
  }
  try {
    await _deleteLabel(token, labelName);
  } catch (error) {
    core.warning(
      `Failed to delete a label ${labelName} of ${repository}: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
    );
  }
};

const _deleteLabel = async (token: string, labelName: string) => {
  const octokit = github.getOctokit(token);
  const param = {
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    name: labelName,
  };
  core.info(`Deleting a label ${labelName} of ${param.owner}/${param.repo}`);
  await octokit.rest.issues.deleteLabel(param);
};
