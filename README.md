# Update Branch Action

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/csm-actions/update-branch-action)
[![License](http://img.shields.io/badge/license-mit-blue.svg?style=flat-square)](https://raw.githubusercontent.com/csm-actions/update-branch-action/main/LICENSE) | [Versioning Policy](https://github.com/suzuki-shunsuke/versioning-policy/blob/main/POLICY.md) | [action.yaml](action.yaml)

`Update Branch Action` is a set of GitHub Actions to update pull request branches securely by [the Client/Server Model](https://github.com/csm-actions/client-server-model-docs).

![image](https://github.com/user-attachments/assets/3c513b13-36e3-43f8-bf7b-13a776d52925)

Update Branch Action allows you to update pull request branches securely without sharing a GitHub App private key with strong permissions such as `contents:write` across GitHub Actions workflows.
It elevates the security of your workflows to the next level.

## Features

- 💪 Update pull request branches
- 🛡 Secure
  - You don't need to pass a GitHub App private key with strong permissions to GitHub Actions workflows on the client side
- 😊 Easy to use
  - You don't need to host a server application

## Overview

There are several cases where you may want to update a branch in CI.

- You may want to update open pull requests when a PR is merged into the default branch.
- You may need to update a branch that only specific GitHub Apps can commit to, due to Branch Rulesets.
  - Pull requests created by GitHub Apps like Renovate are sometimes restricted so that humans cannot modify them.
- A reviewer may want to update a branch via CI using a GitHub App

This action allows you to update pull request branches securely by [the Client/Server Model](https://github.com/csm-actions/client-server-model-docs).

## Example

- [Client Workflow](https://github.com/csm-actions/demo-client/blob/main/.github/workflows/update_branch.yaml)
- [Server Workflow](https://github.com/csm-actions/demo-server/blob/main/.github/workflows/update_branch.yaml)

## Getting Started

1. Create two repositories from templates [demo-server](https://github.com/new?template_name=demo-server&template_owner=csm-actions) and [demo-client](https://github.com/new?template_name=demo-client&template_owner=csm-actions)
1. [Create a GitHub App for server](#github-app-for-server)
1. [Create a GitHub App for client](#github-app-for-client)
1. Create GitHub App private keys
1. [Add GitHub App's id and private keys to GitHub Secrets and Variables](#add-github-apps-id-and-private-keys-to-github-secrets-and-variables)
1. [Fix the server workflow if necessary](#fix-the-server-workflow-if-necessary)
1. [Fix the client workflow if necessary](#fix-the-client-workflow-if-necessary)
1. [Create a pull request in the client repository](#create-a-pull-request-in-the-client-repository)
1. [Post a comment `/ub` to the pull request](#post-a-comment-ub-to-the-pull-request)

### GitHub App for server

Deactivate Webhook.

Permissions:

- `contents:write`: To create commits
- `pull_requests:write`: To notify problems on the server side to pull requests

Installed Repositories: Install the app into the server repository and client repositories.

### GitHub App for client

Deactivate Webhook.

Permissions:

- `issues:write`: To create labels

Installed Repositories: Install the app into the server repository and client repositories.

### Add GitHub App's id and private keys to GitHub Secrets and Variables

Add GitHub App's private keys and ID to Repository Secrets and Variables

- client
  - id: client repository's variable `DEMO_CLIENT_APP_ID`
  - private key: client repository's Repository Secret `DEMO_CLIENT_PRIVATE_KEY`
- server
  - id: server repository's variable `DEMO_SERVER_APP_ID`
  - private key: server repository's Repository Secret `DEMO_SERVER_PRIVATE_KEY`

### Store the private key in AWS KMS instead (optional)

A GitHub App private key in GitHub Secrets never expires, so anyone who obtains
it can generate access tokens indefinitely.
Importing the key into AWS KMS removes that risk: the key can never be exported,
and only the JSON Web Token signing is delegated to KMS.

Set the input `aws_kms_key_id` instead of `app_private_key`.

The app can be identified by either `client_id` or `app_id`. GitHub recommends
the Client ID, and it takes precedence when both are set.

Set `aws_role_to_assume` and the action assumes the IAM role itself with the
GitHub OIDC token. The AWS credentials then stay inside this action and are
never exported, so later steps of the job can't see them. The session lasts 900
seconds, the shortest AWS STS accepts, which is far longer than the signing
takes.

```yaml
permissions:
  id-token: write # Required to assume the AWS IAM role via OIDC
  contents: read

steps:
  - uses: csm-actions/update-branch-action@d77c511bd7d3e25dbbddd7c5b6ca0414e748838d # v1.1.0
    with:
      client_id: ${{vars.DEMO_CLIENT_APP_CLIENT_ID}}
      aws_role_to_assume: ${{vars.ROLE_TO_ASSUME}}
      aws_kms_key_id: ${{vars.KMS_KEY_ID}}
```

`aws_role_to_assume` covers assuming a role with OIDC and nothing else. If you
need any of the other options `aws-actions/configure-aws-credentials` offers,
such as an external ID or a session policy, use that action and leave
`aws_role_to_assume` unset. The credentials it exports as `AWS_ACCESS_KEY_ID`,
`AWS_SECRET_ACCESS_KEY` and `AWS_SESSION_TOKEN` are read then, though they are
visible to the rest of the job.

Those environment variables are the only other source. A profile in
`~/.aws/credentials`, IMDS on a self-hosted EC2 runner and the credentials of an
ECS or EKS task are not read, so reach for
`aws-actions/configure-aws-credentials` to use any of them.

The KMS key must be an RSA 2048 key whose usage is `SIGN_VERIFY`, created with
`--origin EXTERNAL` so that the GitHub App private key can be imported into it.
The IAM role needs `kms:Sign` on that key.

### Fix the server workflow if necessary

[Workflow](https://github.com/csm-actions/demo-server/blob/main/.github/workflows/securefix.yaml)

If you change a variable name and a secret name, please fix the workflow.

### Fix the client workflow if necessary

[Workflow](https://github.com/csm-actions/demo-client/blob/main/.github/workflows/update_branch.yaml)

- If you change a variable name and a secret name, please fix the workflow
- If you change the server repository name, please fix the input `server_repository`

### Create a pull request in the client repository

Please create a pull request in the client repository.
An empty commit is enough.

```sh
git checkout -b test-pr HEAD~1
git commit --allow-empty -m test
gh pr create
```

e.g. [demo-client#15](https://github.com/csm-actions/demo-client/pull/15)

### Post a comment `/ub` to the pull request

Please post a comment `/ub` to the pull request you created.
Then the client workflow and server workflow are run and the pull request branch is updated.

![image](https://github.com/user-attachments/assets/f62f5677-982b-4eb2-9634-2eaf1ecbbd78)

## Actions' Available Versions

As of Update Branch Action v0.1.2, it is released using [release-js-action](https://github.com/suzuki-shunsuke/release-js-action).
[About available versions, please see the document.](https://github.com/suzuki-shunsuke/release-js-action/blob/main/docs/available_versions.md)
