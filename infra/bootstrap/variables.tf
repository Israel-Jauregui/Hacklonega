variable "aws_region" {
  description = "Region for the Terraform state bucket. Keep aligned with infra/site."
  type        = string
  default     = "us-east-1"
}

variable "project" {
  description = "Name prefix for every bootstrap resource."
  type        = string
  default     = "hacklonega"
}

variable "github_oidc_sub_prefix" {
  description = <<-EOT
    Exact OIDC `sub` prefix GitHub issues for this repository. This repository
    (created after July 15, 2026) uses the immutable owner@id/repo@id format,
    read from GET /repos/{owner}/{repo}/actions/oidc/customization/sub.
  EOT
  type        = string
  default     = "repo:Israel-Jauregui@29392107/Hacklonega@1379925648"

  validation {
    condition     = can(regex("^repo:[^:*]+$", var.github_oidc_sub_prefix))
    error_message = "Must be a literal repo:... prefix with no wildcards or colons after the repo."
  }
}

variable "create_oidc_provider" {
  description = "Set false if the account already has the token.actions.githubusercontent.com provider."
  type        = bool
  default     = true
}
