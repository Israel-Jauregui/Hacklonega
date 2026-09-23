# Hacklonega deployment runbook

Owner actions for Phase 2 (GitHub + AWS) and Phase 3 (domain + launch), in
order. Every step that needs an approval, a bill, or a credential is yours;
nothing here asks you to paste a secret anywhere except directly into `gh` or
the AWS/Cloudflare consoles.

## How it fits together

| Piece | Where | Runs as |
|---|---|---|
| OIDC provider, Terraform state bucket, 3 GitHub roles | `infra/bootstrap` | You, once, from your machine |
| S3 origin, CloudFront + OAC, headers, budget, (Phase 3) ACM + Cloudflare DNS | `infra/site` | `Infrastructure` workflow |
| PR/main checks, builds the `site-dist` artifact | `.github/workflows/ci.yml` | Every PR and push to `main` |
| Terraform plan → approved apply | `.github/workflows/terraform.yml` | Push to `main` touching `infra/site`, or manual |
| Upload the exact CI artifact to S3 + invalidate | `.github/workflows/deploy.yml` | After green CI on `main`, or manual rollback |

GitHub environments and the AWS roles they unlock:

| Environment | Reviewer | Role | Can do |
|---|---|---|---|
| `infrastructure-plan` | none (main only) | `hacklonega-github-plan` | Read state and site config, take the state lock |
| `infrastructure` | you | `hacklonega-github-apply` | Change the site stack (no IAM) |
| `production` | you | `hacklonega-github-deploy` | Write site objects, invalidate CloudFront |

Each role trusts exactly one `sub` claim. This repository was created after
July 15, 2026, so GitHub issues **immutable** subjects:

```
repo:Israel-Jauregui@29392107/Hacklonega@1379925648:environment:<env>
```

(read from `GET /repos/Israel-Jauregui/Hacklonega/actions/oidc/customization/sub`).
Every AWS job prints its `OIDC sub:` before assuming a role. If a role
assumption fails, compare that line with `terraform output trusted_subjects`
in `infra/bootstrap`.

---

## Phase 2: GitHub and AWS

### 1. GitHub settings (≈2 min)

```bash
scripts/configure-github.sh
```

Expected: read-only default `GITHUB_TOKEN`; Actions limited to GitHub-owned,
`aws-actions/configure-aws-credentials` and `hashicorp/setup-terraform`, all
SHA-pinned; three environments restricted to `main`; the `main protection`
ruleset (PR required, `Frontend checks` + `Terraform checks` required and up to
date, stale approvals dismissed, no force-push or deletion).

The ruleset requires 0 approvals because you are the only maintainer and
GitHub does not let you approve your own PR. Raise it to 1 when a second
maintainer joins, and turn on code-owner review then.

### 2. AWS bootstrap (≈5 min, one time)

Use an admin identity from IAM Identity Center (short-lived), not access keys.

```bash
aws sso login --profile <your-admin-profile>
```

```bash
cd infra/bootstrap && AWS_PROFILE=<your-admin-profile> terraform init && AWS_PROFILE=<your-admin-profile> terraform apply
```

Review the plan: 1 OIDC provider (set `-var create_oidc_provider=false` if the
account already has one), 1 state bucket, 3 roles and 3 inline policies. No
access keys are created.

Expected outputs: `aws_account_id`, `state_bucket`
(`hacklonega-tfstate-<account>`), `role_arns`, `trusted_subjects`.

Keep `infra/bootstrap/terraform.tfstate` somewhere private (password manager
attachment or a private bucket). It has no secrets but you need it to change
the roles later. It is gitignored.

### 3. Connect GitHub to the account and add the budget email (≈1 min)

```bash
scripts/configure-github.sh --account-id <aws_account_id output> --secrets
```

You'll be prompted (hidden input) for `BUDGET_ALERT_EMAIL` in
`infrastructure-plan` and `infrastructure`.

### 4. Merge the site PR

Merge the open PR once both checks are green. On `main` this starts:

1. **CI**, which builds and uploads `site-dist`.
2. **Infrastructure → Plan**. Read the plan in the run summary. Expect about
   12 resources to add: bucket and its settings, OAC, response-headers policy,
   function, distribution, budget.
3. **Infrastructure → Apply**, waiting for you. Approve it. CloudFront takes 5–10 min.
4. **Deploy site**, also waiting for you. Approve it **after** Apply has
   finished. If you approved it too early and it failed, re-run the job.

The Deploy summary prints `Live at https://dxxxx.cloudfront.net/`.

### 5. Validate on the CloudFront hostname

```bash
H=dxxxxxxxxxxxxx.cloudfront.net
```

```bash
curl -sI https://$H/ | grep -iE '^(HTTP|content-security-policy|strict-transport|x-frame|x-content-type|referrer-policy|permissions-policy|cache-control)'
```

Expected: `HTTP/2 200`, the CSP containing `img-src 'self' blob:`, and `cache-control: no-cache`.

```bash
curl -sI http://$H/ | head -1
```

Expected: `301`.

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://$H/does-not-exist
```

Expected: `404`, which serves the styled 404 page.

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://hacklonega-site-<account>.s3.amazonaws.com/index.html
```

Expected: `403`, so the bucket is not publicly readable.

Also check the asset `cache-control` (`public, max-age=31536000, immutable`)
by `curl -sI` on one `/assets/*.js` URL from the page source.

**Browser check (desktop, mouse):** open the site, open DevTools → Console:
no CSP violations. Drag the steeple ball; it should rotate as a 3D sphere. If
it stays flat, the `blob:` image source is being blocked.

Phase 2 is done when all of the above pass.

---

## Releasing and rolling back

**Release:** merge to `main`. CI builds, Deploy waits for your approval,
then publishes that exact artifact.

**Roll back the site** (artifacts are kept 30 days):

```bash
gh run list --repo Israel-Jauregui/Hacklonega --workflow ci.yml --branch main --event push --status success --limit 10
```

```bash
gh workflow run deploy.yml --repo Israel-Jauregui/Hacklonega -f ci_run_id=<older run id>
```

Approve the `production` job. Old hashed assets are never deleted by deploys,
so the older `index.html` always finds its files.

**Emergency, no GitHub:** the site bucket is versioned (30 days). In the S3
console, *Show versions* → restore the previous `index.html`, then create a
CloudFront invalidation for `/` and `/index.html`.

**Roll back infrastructure:** revert the commit in a PR and merge; approve the
resulting Apply. Never run `terraform apply` for `infra/site` from a laptop.

---

## Phase 3: domain, DNS, TLS

Everything below is off until the `DOMAIN_NAME` variable is set. Canonical host
is the apex; `www` 301-redirects to it through a CloudFront Function.

### 6. Domain: `hacklonega.dev`

Registrar: **Namecheap**. Authoritative DNS: **Cloudflare**
(`fay.ns.cloudflare.com`, `memphis.ns.cloudflare.com`, already live as of
2026-09-23). No DS record at the registry and no CAA records, so ACM can issue
and there's no DNSSEC to unwind.

`.dev` is on the browser HSTS preload list: it is HTTPS-only everywhere, so
the site will not load over plain HTTP until the certificate is attached.

Before step 8, in Cloudflare → hacklonega.dev → DNS → Records, **delete the
existing `hacklonega.dev` and `www` records** (currently proxied, orange
cloud). Terraform creates its own DNS-only CNAMEs and will fail if these
exist.

In Namecheap, keep **Auto-Renew** on and the registrant email verified; the
domain's DNS no longer lives there, so don't add records in Namecheap.

### 7. Cloudflare tokens (≈3 min)

Cloudflare → My Profile → API Tokens → Create Custom Token. Create **two**,
each with **Zone Resources: Include → Specific zone → your domain**, no other
zones, and an expiry date:

| Token | Permission | GitHub environment |
|---|---|---|
| `hacklonega-dns-read` | Zone · DNS · Read | `infrastructure-plan` |
| `hacklonega-dns-edit` | Zone · DNS · Edit | `infrastructure` |

Paste each directly into gh (hidden prompt):

```bash
gh secret set CLOUDFLARE_API_TOKEN --repo Israel-Jauregui/Hacklonega --env infrastructure-plan
```

```bash
gh secret set CLOUDFLARE_API_TOKEN --repo Israel-Jauregui/Hacklonega --env infrastructure
```

### 8. Point Terraform at the domain

Zone ID is on the zone's Overview page (not secret).

```bash
gh variable set CLOUDFLARE_ZONE_ID --repo Israel-Jauregui/Hacklonega --body <zone id>
```

```bash
gh variable set DOMAIN_NAME --repo Israel-Jauregui/Hacklonega --body hacklonega.dev
```

Merge the `feature/domain-hacklonega-dev` PR (canonical URL, absolute OG
image, robots, sitemap), then run:

```bash
gh workflow run terraform.yml --repo Israel-Jauregui/Hacklonega
```

Expected plan: ACM certificate (us-east-1, apex + www), 2 validation records,
2 DNS-only CNAMEs, distribution updated with aliases and TLS 1.2+, function
updated. Approve Apply; certificate validation usually takes 2–10 minutes.

### 9. Launch checks

```bash
D=hacklonega.dev
```

```bash
for u in https://$D/ https://www.$D/ http://$D/ http://www.$D/; do printf '%s -> ' "$u"; curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' "$u"; done
```

Expected: apex `200`. www → `301 https://$D/`. http → `301` to https. No redirect loops.

```bash
dig +short $D A; dig +short $D AAAA; dig +short www.$D CNAME
```

Expected: CloudFront addresses (IPv4 and IPv6), and not Cloudflare proxy IPs.

```bash
echo | openssl s_client -connect $D:443 -servername $D 2>/dev/null | openssl x509 -noout -issuer -subject -ext subjectAltName
```

Expected: Amazon issuer, and both names in the SAN.

Then repeat the Phase 2 header, 404, S3-denial and browser checks on the real
domain, click every footer/legal link and every Register button on phone and
desktop, and confirm no `.tfstate`/plan/secret is in the repo
(`git log --all --stat | grep -iE 'tfstate|tfplan|tfvars'` is empty).

Record privately (not in this repo): AWS account ID and owner, Cloudflare
account owner, domain renewal date and auto-renew setting, monthly cost
expectation (roughly $1–3 at event-site traffic, budget alarm at $10), and
incident contacts.

### Later, optional

- **DNSSEC:** enable in Cloudflare once the zone has been stable for a week,
  then add the DS record at the registrar (automatic on Cloudflare Registrar).
- **Cloudflare proxy (orange cloud):** don't, unless there's a documented need.
  It puts a second CDN and TLS edge in front of CloudFront and needs its own
  testing of TLS mode, Host headers, caching, redirects and headers.
- **Logging:** off by default. If you enable CloudFront or S3 access logs,
  update the privacy wording in the footer and `CodeHawks-FrontEnd/README.md`.
