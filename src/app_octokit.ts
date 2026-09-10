import * as core from "@actions/core";
import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";

/**
 * Builds an Octokit client authenticated as the GitHub App.
 *
 * @suzuki-shunsuke/github-app-token doesn't authenticate as the app itself, so
 * the caller decides how the app is authenticated and which Octokit build is
 * used.
 */
export const newAppOctokit = (): Octokit =>
  new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: core.getInput("app_id", { required: true }),
      privateKey: core.getInput("app_private_key", { required: true }),
    },
  });
