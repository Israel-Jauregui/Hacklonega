# Phase 3: everything here is count = 0 until domain_name is set.

resource "aws_acm_certificate" "site" {
  count                     = local.has_domain ? 1 : 0
  provider                  = aws.us_east_1
  domain_name               = var.domain_name
  subject_alternative_names = var.include_www ? [local.www_name] : []
  validation_method         = "DNS"
  key_algorithm             = "EC_prime256v1"

  lifecycle {
    create_before_destroy = true
  }
}

locals {
  # Keyed by the statically known names so for_each works before the
  # certificate exists.
  acm_validation = {
    for name in local.aliases : name => one([
      for o in aws_acm_certificate.site[0].domain_validation_options : o if o.domain_name == name
    ])
  }
}

resource "cloudflare_dns_record" "acm_validation" {
  for_each = local.acm_validation
  zone_id  = var.cloudflare_zone_id
  name     = trimsuffix(each.value.resource_record_name, ".")
  type     = each.value.resource_record_type
  content  = trimsuffix(each.value.resource_record_value, ".")
  ttl      = 300
  proxied  = false
  comment  = "ACM validation (${var.project}, Terraform)"
}

resource "aws_acm_certificate_validation" "site" {
  count                   = local.has_domain ? 1 : 0
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.site[0].arn
  validation_record_fqdns = [for r in cloudflare_dns_record.acm_validation : r.name]
}

# DNS-only (grey cloud): CloudFront stays the single CDN/TLS edge. The apex
# CNAME is flattened by Cloudflare.
resource "cloudflare_dns_record" "site" {
  for_each = toset(local.aliases)
  zone_id  = var.cloudflare_zone_id
  name     = each.value
  type     = "CNAME"
  content  = aws_cloudfront_distribution.site.domain_name
  ttl      = 300
  proxied  = false
  comment  = "CloudFront (${var.project}, Terraform)"
}

# Proves ownership of the whole domain to Google Search Console, which is
# where the sitemap is submitted and indexing is monitored.
resource "cloudflare_dns_record" "google_site_verification" {
  count   = local.has_domain && var.google_site_verification != "" ? 1 : 0
  zone_id = var.cloudflare_zone_id
  name    = var.domain_name
  type    = "TXT"
  content = "\"${var.google_site_verification}\""
  ttl     = 3600
  proxied = false
  comment = "Google Search Console (${var.project}, Terraform)"
}
