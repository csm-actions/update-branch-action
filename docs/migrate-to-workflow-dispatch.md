# Migrate from labels to workflow_dispatch

As of v1.2.0, the client workflow can run the server workflow by a `workflow_dispatch` event instead of creating a label in the server repository.
[See also how to trigger the server workflow.](../README.md#how-to-trigger-the-server-workflow)

Updating the action doesn't change the behavior, so you can migrate gradually.

## Steps

1. Add `actions:write` to the Client GitHub App and approve the new permission on the installation. Until it's approved, client actions with `server_workflow_ref` fail. Keep `issues:write` until the migration completes, because clients that still use `server_repository_name` need it
2. Add a `workflow_dispatch` server workflow alongside the existing label-based one
3. Set `server_workflow_ref` in client workflows. You can keep `server_repository_name`, but `server_repository_owner` and `server_repository_name` must point to the same repository
4. After all clients are migrated, remove the label-based server workflow and `issues:write` from the Client GitHub App

Before migrating, read [the risks of `actions:write` and how to protect the server workflow](../README.md#workflow_dispatch-and-actionswrite).

## Server workflow

The server workflow must declare the `workflow_dispatch` inputs below, which the client action sets.
You don't need to pass them to the action, because the action reads them from the event.

```yaml
name: Update Branch
run-name: Update Branch (${{ inputs.repository_owner }}/${{ inputs.repository_name }}/${{ inputs.pull_request_number }})
on:
  workflow_dispatch:
    inputs:
      repository_owner:
        required: true
      repository_name:
        required: true
      pull_request_number:
        required: true
jobs:
  update_branch:
    runs-on: ubuntu-24.04
    timeout-minutes: 10
    environment: main # Restrict the deployment branches to the default branch
    permissions: {}
    steps:
      - uses: csm-actions/update-branch-action@latest
        with:
          app_id: ${{ vars.SERVER_APP_ID }}
          app_private_key: ${{ secrets.SERVER_PRIVATE_KEY }}
```

## Client workflow

```yaml
- uses: csm-actions/update-branch-action@latest
  with:
    app_id: ${{ vars.CLIENT_APP_ID }}
    app_private_key: ${{ secrets.CLIENT_PRIVATE_KEY }}
    # <owner>/<repo>/.github/workflows/<workflow file>@<branch or tag>
    server_workflow_ref: ${{ vars.UPDATE_BRANCH_SERVER_WORKFLOW_REF }}
```

Managing `server_workflow_ref` with an organization variable lets you change it later, e.g. when you rename the server repository or the workflow file, without fixing client workflows.
