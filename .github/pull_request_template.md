## What changed

<!-- One or two sentences. Link the issue if there is one. -->

## Checks

- [ ] CI is green (Frontend checks and Terraform checks)
- [ ] No secrets, `.tfstate`, plan files, or `.tfvars` added
- [ ] Any new third-party Action is pinned to a full commit SHA with its tag in a comment
- [ ] Visual changes checked on desktop and a phone-width viewport
- [ ] If this touches `infra/site`: I will review the Infrastructure **Plan** job before approving **Apply**
- [ ] If this changes scripts, styles, images or external links: the CSP in `infra/site/main.tf` still allows them
