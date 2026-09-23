#!/usr/bin/env bash
# Owner-run, idempotent GitHub setup for Israel-Jauregui/Hacklonega.
# Needs `gh auth login` as a repository admin. Reviewed before running; nothing
# here touches AWS or Cloudflare.
#
#   scripts/configure-github.sh                  environments, ruleset, Actions policy
#   scripts/configure-github.sh --account-id 123456789012
#                                                also sets AWS_ACCOUNT_ID
#   scripts/configure-github.sh --secrets        prompts for secrets (typed into gh,
#                                                hidden, never echoed or stored)
set -euo pipefail

REPO="Israel-Jauregui/Hacklonega"
OWNER_LOGIN="Israel-Jauregui"
ACTIONS_APP_ID=15368 # GitHub Actions, for required status checks

account_id="" ; want_secrets=false
while [ $# -gt 0 ]; do
  case "$1" in
    --account-id) account_id="$2"; shift 2 ;;
    --secrets) want_secrets=true; shift ;;
    *) echo "unknown option: $1" >&2; exit 2 ;;
  esac
done

owner_id="$(gh api "users/$OWNER_LOGIN" --jq .id)"

echo "== Actions: read-only token by default, SHA-pinned allow-list"
gh api -X PUT "repos/$REPO/actions/permissions/workflow" \
  -f default_workflow_permissions=read -F can_approve_pull_request_reviews=false
gh api -X PUT "repos/$REPO/actions/permissions" \
  -F enabled=true -f allowed_actions=selected -F sha_pinning_required=true
gh api -X PUT "repos/$REPO/actions/permissions/selected-actions" --input - <<JSON
{"github_owned_allowed": true, "verified_allowed": false,
 "patterns_allowed": ["aws-actions/configure-aws-credentials@*", "hashicorp/setup-terraform@*"]}
JSON

echo "== Environments (main branch only)"
make_env() { # name, needs_reviewer
  local reviewers='[]'
  [ "$2" = yes ] && reviewers="[{\"type\":\"User\",\"id\":$owner_id}]"
  gh api -X PUT "repos/$REPO/environments/$1" --input - >/dev/null <<JSON
{"reviewers": $reviewers, "prevent_self_review": false,
 "deployment_branch_policy": {"protected_branches": false, "custom_branch_policies": true}}
JSON
  gh api "repos/$REPO/environments/$1/deployment-branch-policies" --jq '.branch_policies[].name' \
    | grep -qx main \
    || gh api -X POST "repos/$REPO/environments/$1/deployment-branch-policies" -f name=main -f type=branch >/dev/null
  echo "   $1 (reviewer required: $2)"
}
make_env infrastructure-plan no
make_env infrastructure yes
make_env production yes

echo "== Ruleset for main"
ruleset="$(cat <<JSON
{
  "name": "main protection",
  "target": "branch",
  "enforcement": "active",
  "conditions": {"ref_name": {"include": ["~DEFAULT_BRANCH"], "exclude": []}},
  "rules": [
    {"type": "deletion"},
    {"type": "non_fast_forward"},
    {"type": "pull_request", "parameters": {
      "required_approving_review_count": 0,
      "dismiss_stale_reviews_on_push": true,
      "require_code_owner_review": false,
      "require_last_push_approval": false,
      "required_review_thread_resolution": true,
      "allowed_merge_methods": ["merge", "squash"]}},
    {"type": "required_status_checks", "parameters": {
      "strict_required_status_checks_policy": true,
      "required_status_checks": [
        {"context": "Frontend checks", "integration_id": $ACTIONS_APP_ID},
        {"context": "Terraform checks", "integration_id": $ACTIONS_APP_ID}]}}
  ]
}
JSON
)"
existing="$(gh api "repos/$REPO/rulesets" --jq '.[] | select(.name=="main protection") | .id')"
if [ -n "$existing" ]; then
  gh api -X PUT "repos/$REPO/rulesets/$existing" --input - <<<"$ruleset" >/dev/null
else
  gh api -X POST "repos/$REPO/rulesets" --input - <<<"$ruleset" >/dev/null
fi
echo "   active"

if [ -n "$account_id" ]; then
  [[ "$account_id" =~ ^[0-9]{12}$ ]] || { echo "account id must be 12 digits" >&2; exit 2; }
  gh variable set AWS_ACCOUNT_ID --repo "$REPO" --body "$account_id"
  echo "== AWS_ACCOUNT_ID set"
fi

if $want_secrets; then
  echo "== Secrets. Leave a prompt empty (Ctrl-C) to skip; values go straight to GitHub."
  for env in infrastructure-plan infrastructure; do
    echo "-- BUDGET_ALERT_EMAIL for $env"
    gh secret set BUDGET_ALERT_EMAIL --repo "$REPO" --env "$env"
  done
fi

echo "Done. Review: https://github.com/$REPO/settings/environments and /settings/rules"
