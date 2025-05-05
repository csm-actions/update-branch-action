# Update Branch Action

[![License](http://img.shields.io/badge/license-mit-blue.svg?style=flat-square)](https://raw.githubusercontent.com/csm-actions/update-branch-action/main/LICENSE) | [Versioning Policy](https://github.com/suzuki-shunsuke/versioning-policy/blob/main/POLICY.md)

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
- 😉 [OSS (MIT License)](LICENSE)

## Overview

There are several cases where you may want to update a branch in CI.

- You may want to update open pull requests when a PR is merged into the default branch.
- You may need to update a branch that only specific GitHub Apps can commit to, due to Branch Rulesets.
  - Pull requests created by GitHub Apps like Renovate are sometimes restricted so that humans cannot modify them.
- A reviewer may want to update a branch via CI using a GitHub App

This action allows you to update pull request branches securely by [the Client/Server Model](https://github.com/csm-actions/client-server-model-docs).

## Example

- [Client Workflow](https://github.com/csm-actions/demo-client/blob/main/.github/workflows/update_branch.yaml)
- [Server Workflow](https://github.com/csm-actions/demo-server/blob/df6e4805d058889b2258334c173e99214ac2bdf6/.github/workflows/securefix.yaml#L29-L40)

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

## Actions

Update Branch Action composes of following actions:

- [csm-actions/update-branch-action](action.yaml): Client action
- [csm-actions/update-branch-action/server](server/action.yaml): Server action
