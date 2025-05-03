# Update Branch Action

[![License](http://img.shields.io/badge/license-mit-blue.svg?style=flat-square)](https://raw.githubusercontent.com/securefix-action/update-branch-action/main/LICENSE) | [Versioning Policy](https://github.com/suzuki-shunsuke/versioning-policy/blob/main/POLICY.md)

`Update Branch Action` is a set of GitHub Actions to update pull request branches securely by [the Client/Server Model](https://github.com/securefix-action/client-server-model-docs).

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

This action allows you to update pull request branches securely by [the Client/Server Model](https://github.com/securefix-action/client-server-model-docs).

## Example

Coming soon.

## Getting Started

Coming soon.

## Actions

Update Branch Action composes of following actions:

- [securefix-action/update-branch-action](docs/client.md) ([action.yaml](action.yaml)): Client action
- [securefix-action/update-branch-action/server](server) ([action.yaml](server/action.yaml)): Server action
