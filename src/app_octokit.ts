import * as core from "@actions/core";
import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";
import { createJwt } from "@suzuki-shunsuke/github-app-jwt-aws-kms";

/**
 * Builds an Octokit client authenticated as the GitHub App.
 *
 * @suzuki-shunsuke/github-app-token doesn't authenticate as the app itself, so
 * the caller decides how the app is authenticated and which Octokit build is
 * used.
 *
 * When aws_kms_key_id is set, the private key never leaves AWS KMS and only the
 * JWT signing is delegated to it. Otherwise app_private_key is used.
 */
export const newAppOctokit = (): Octokit => {
  const appId = core.getInput("app_id", { required: true });
  const kmsKeyId = core.getInput("aws_kms_key_id");
  if (kmsKeyId) {
    core.info(`signing GitHub App JSON Web Tokens with AWS KMS: ${kmsKeyId}`);
    return new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId,
        createJwt: createJwt({ keyId: kmsKeyId }),
      },
    });
  }
  const privateKey = core.getInput("app_private_key");
  if (!privateKey) {
    throw new Error("Either app_private_key or aws_kms_key_id is required");
  }
  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId,
      privateKey,
    },
  });
};
