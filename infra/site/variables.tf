variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project" {
  type    = string
  default = "hacklonega"
}

variable "budget_limit_usd" {
  description = "Monthly cost budget. Alerts fire at 50% and 100% actual, and 100% forecast."
  type        = number
  default     = 10
}

variable "budget_alert_email" {
  description = "Recipient for budget alerts. Supplied as an environment secret; never committed."
  type        = string
  sensitive   = true
}

# ---------------------------------------------------------------- Phase 3

variable "domain_name" {
  description = "Apex domain (e.g. example.org). Empty keeps the site on the CloudFront hostname."
  type        = string
  default     = ""

  validation {
    condition     = var.domain_name == "" || can(regex("^([a-z0-9-]+\\.)+[a-z]{2,}$", var.domain_name))
    error_message = "domain_name must be a lowercase apex domain with no scheme or trailing dot."
  }
}

variable "include_www" {
  description = "Also serve www.<domain>, which redirects to the apex (the canonical host)."
  type        = bool
  default     = true
}

variable "cloudflare_zone_id" {
  description = "Cloudflare zone ID for domain_name. Not secret; required when domain_name is set."
  type        = string
  default     = ""

  validation {
    condition     = var.cloudflare_zone_id == "" || can(regex("^[0-9a-f]{32}$", var.cloudflare_zone_id))
    error_message = "cloudflare_zone_id must be a 32-character hex zone ID."
  }
}
