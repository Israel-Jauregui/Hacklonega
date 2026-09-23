#!/usr/bin/env bash
# Prints the OIDC `sub` claim this job would present to AWS (never the token).
# Compare it with `terraform output trusted_subjects` from infra/bootstrap.
set -euo pipefail
token="$(curl -sSf -H "Authorization: bearer $ACTIONS_ID_TOKEN_REQUEST_TOKEN" \
  "$ACTIONS_ID_TOKEN_REQUEST_URL&audience=sts.amazonaws.com" | jq -r .value)"
payload="$(cut -d. -f2 <<<"$token" | tr '_-' '/+')"
while (( ${#payload} % 4 )); do payload+="="; done
echo "OIDC sub: $(base64 -d <<<"$payload" | jq -r .sub)"
