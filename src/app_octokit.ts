import * as core from "@actions/core";
import { KMSClient } from "@aws-sdk/client-kms";
import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";
import { credentials } from "@suzuki-shunsuke/actions-aws-oidc";
import { createJwt } from "@suzuki-shunsuke/github-app-jwt-aws-kms";

/**
 * Builds a KMS client.
 *
 * When aws_role_to_assume is set, the IAM role is assumed here with the GitHub
 * OIDC token, and the resulting credentials never leave this process. Later
 * steps of the job can't see them, unlike credentials that
 * aws-actions/configure-aws-credentials exports as environment variables or
 * writes to ~/.aws/credentials.
 *
 * Otherwise the standard AWS credential chain is used, so
 * aws-actions/configure-aws-credentials still works as before.
 */
const newKMSClient = (): KMSClient => {
  const roleArn = core.getInput("aws_role_to_assume");
  if (!roleArn) {
    return new KMSClient({});
  }
  core.info(`assuming an AWS IAM role with the GitHub OIDC token: ${roleArn}`);
  return new KMSClient({ credentials: credentials({ roleArn }) });
};

/**
 * Builds an Octokit client authenticated as the GitHub App.
 *
 * @suzuki-shunsuke/github-app-token doesn't authenticate as the app itself, so
 * the caller decides how the app is authenticated and which Octokit build is
 * used.
 *
 * When aws_kms_key_id is set, the private key never leaves AWS KMS and only the
 * JWT signing is delegated to it. Otherwise app_private_key is used.
 *
 * The app is identified by either client_id or app_id. @octokit/auth-app passes
 * the value straight through as the JSON Web Token issuer, and GitHub accepts
 * both, recommending the Client ID.
 */
export const newAppOctokit = (): Octokit => {
  const appId = core.getInput("client_id") || core.getInput("app_id");
  if (!appId) {
    throw new Error("Either client_id or app_id is required");
  }
  const kmsKeyId = core.getInput("aws_kms_key_id");
  if (kmsKeyId) {
    core.info(`signing GitHub App JSON Web Tokens with AWS KMS: ${kmsKeyId}`);
    return new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId,
        createJwt: createJwt({ keyId: kmsKeyId, client: newKMSClient() }),
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
