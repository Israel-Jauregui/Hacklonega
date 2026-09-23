#!/usr/bin/env bash
# Stable hash of what a saved Terraform plan would change. Used to check that
# the plan applied is the plan that was reviewed.
set -euo pipefail
terraform show -json "$1" \
  | jq -S -c '[.resource_changes[]? | select(.change.actions != ["no-op"])
               | {address, actions: .change.actions, after: .change.after}]' \
  | sha256sum | cut -d' ' -f1
