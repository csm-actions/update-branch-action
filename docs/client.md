# Client Action

[action.yaml](../action.yaml)

Client Action creates and deletes a GitHub Issue label to request updating a branch to a server workflow.

## Example

Coming soon.

## Inputs

### Required Inputs

- `app_id`: A GitHub App ID
- `app_private_key`: A GitHub App Private Key
- `server_repository_name`: A GitHub Repository name where a server workflow works

### Optional Inputs

- `server_repository_owner`: A GitHub Repository owner where a server workflow works
- `repository_owner`: A repository name of the updated pull request. By default, the repository where the client workflow is run
- `repository_name`: A repository name of the updated pull request. By default, the repository where the client workflow is run
- `pull_request_number`: A pull request number of the updated pull request. By default, it's `${{github.event.pull_request.number}}`

## Outputs

Nothing.
