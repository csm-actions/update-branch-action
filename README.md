# Update Branch Action

[![DeepWiki](https://img.shields.io/badge/Ask_DeepWiki-000000.svg?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAyCAYAAAAnWDnqAAAAAXNSR0IArs4c6QAAA05JREFUaEPtmUtyEzEQhtWTQyQLHNak2AB7ZnyXZMEjXMGeK/AIi+QuHrMnbChYY7MIh8g01fJoopFb0uhhEqqcbWTp06/uv1saEDv4O3n3dV60RfP947Mm9/SQc0ICFQgzfc4CYZoTPAswgSJCCUJUnAAoRHOAUOcATwbmVLWdGoH//PB8mnKqScAhsD0kYP3j/Yt5LPQe2KvcXmGvRHcDnpxfL2zOYJ1mFwrryWTz0advv1Ut4CJgf5uhDuDj5eUcAUoahrdY/56ebRWeraTjMt/00Sh3UDtjgHtQNHwcRGOC98BJEAEymycmYcWwOprTgcB6VZ5JK5TAJ+fXGLBm3FDAmn6oPPjR4rKCAoJCal2eAiQp2x0vxTPB3ALO2CRkwmDy5WohzBDwSEFKRwPbknEggCPB/imwrycgxX2NzoMCHhPkDwqYMr9tRcP5qNrMZHkVnOjRMWwLCcr8ohBVb1OMjxLwGCvjTikrsBOiA6fNyCrm8V1rP93iVPpwaE+gO0SsWmPiXB+jikdf6SizrT5qKasx5j8ABbHpFTx+vFXp9EnYQmLx02h1QTTrl6eDqxLnGjporxl3NL3agEvXdT0WmEost648sQOYAeJS9Q7bfUVoMGnjo4AZdUMQku50McDcMWcBPvr0SzbTAFDfvJqwLzgxwATnCgnp4wDl6Aa+Ax283gghmj+vj7feE2KBBRMW3FzOpLOADl0Isb5587h/U4gGvkt5v60Z1VLG8BhYjbzRwyQZemwAd6cCR5/XFWLYZRIMpX39AR0tjaGGiGzLVyhse5C9RKC6ai42ppWPKiBagOvaYk8lO7DajerabOZP46Lby5wKjw1HCRx7p9sVMOWGzb/vA1hwiWc6jm3MvQDTogQkiqIhJV0nBQBTU+3okKCFDy9WwferkHjtxib7t3xIUQtHxnIwtx4mpg26/HfwVNVDb4oI9RHmx5WGelRVlrtiw43zboCLaxv46AZeB3IlTkwouebTr1y2NjSpHz68WNFjHvupy3q8TFn3Hos2IAk4Ju5dCo8B3wP7VPr/FGaKiG+T+v+TQqIrOqMTL1VdWV1DdmcbO8KXBz6esmYWYKPwDL5b5FA1a0hwapHiom0r/cKaoqr+27/XcrS5UwSMbQAAAABJRU5ErkJggg==)](https://deepwiki.com/csm-actions/update-branch-action)
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

## Actions' Available Versions

As of Update Branch Action v0.1.2, it is released using [release-js-action](https://github.com/suzuki-shunsuke/release-js-action).
[About available versions, please see the document.](https://github.com/suzuki-shunsuke/release-js-action/blob/main/docs/available_versions.md)
