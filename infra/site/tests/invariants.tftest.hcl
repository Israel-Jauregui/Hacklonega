# Offline security invariants: mock providers, no credentials, no state.
# Run with `terraform test` after `terraform init -backend=false`.

mock_provider "aws" {
  mock_data "aws_caller_identity" {
    defaults = { account_id = "123456789012" }
  }
  mock_data "aws_iam_policy_document" {
    defaults = { json = "{}" }
  }
  mock_resource "aws_cloudfront_distribution" {
    defaults = {
      arn         = "arn:aws:cloudfront::123456789012:distribution/EXAMPLE"
      domain_name = "d111111abcdef8.cloudfront.net"
    }
  }
  mock_resource "aws_cloudfront_function" {
    defaults = { arn = "arn:aws:cloudfront::123456789012:function/example" }
  }
}

mock_provider "aws" {
  alias = "us_east_1"
  mock_resource "aws_acm_certificate" {
    defaults = {
      arn = "arn:aws:acm:us-east-1:123456789012:certificate/example"
      domain_validation_options = [
        { domain_name = "example.org", resource_record_name = "_a.example.org.", resource_record_type = "CNAME", resource_record_value = "_b.acm-validations.aws." },
        { domain_name = "www.example.org", resource_record_name = "_c.www.example.org.", resource_record_type = "CNAME", resource_record_value = "_d.acm-validations.aws." },
      ]
    }
  }
  mock_resource "aws_acm_certificate_validation" {
    defaults = { certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/example" }
  }
}

mock_provider "cloudflare" {}

variables {
  budget_alert_email = "alerts@example.invalid"
}

run "phase2_private_origin_and_headers" {
  command = plan

  assert {
    condition = alltrue([
      aws_s3_bucket_public_access_block.site.block_public_acls,
      aws_s3_bucket_public_access_block.site.block_public_policy,
      aws_s3_bucket_public_access_block.site.ignore_public_acls,
      aws_s3_bucket_public_access_block.site.restrict_public_buckets,
    ])
    error_message = "S3 public access must be fully blocked."
  }

  assert {
    condition     = aws_s3_bucket_ownership_controls.site.rule[0].object_ownership == "BucketOwnerEnforced"
    error_message = "ACLs must be disabled on the site bucket."
  }

  assert {
    condition     = aws_cloudfront_origin_access_control.site.signing_behavior == "always" && aws_cloudfront_origin_access_control.site.origin_access_control_origin_type == "s3"
    error_message = "CloudFront must always sign origin requests with OAC."
  }

  assert {
    condition     = aws_cloudfront_distribution.site.default_cache_behavior[0].viewer_protocol_policy == "redirect-to-https"
    error_message = "HTTP must redirect to HTTPS."
  }

  assert {
    condition     = aws_cloudfront_distribution.site.default_cache_behavior[0].compress
    error_message = "Compression must be on."
  }

  assert {
    condition     = length(aws_cloudfront_distribution.site.aliases) == 0 && aws_cloudfront_distribution.site.viewer_certificate[0].cloudfront_default_certificate
    error_message = "Phase 2 must stay on the default CloudFront hostname."
  }

  assert {
    condition     = length(aws_acm_certificate.site) == 0 && length(cloudflare_dns_record.site) == 0
    error_message = "No domain resources without domain_name."
  }

  assert {
    condition = alltrue([for d in [
      "script-src 'self'", "style-src 'self'", "img-src 'self' blob:", "frame-ancestors 'none'",
      "object-src 'none'", "base-uri 'self'", "form-action 'none'",
    ] : strcontains(aws_cloudfront_response_headers_policy.security.security_headers_config[0].content_security_policy[0].content_security_policy, d)])
    error_message = "CSP is missing a required directive."
  }

  assert {
    condition     = !strcontains(aws_cloudfront_response_headers_policy.security.security_headers_config[0].content_security_policy[0].content_security_policy, "unsafe-")
    error_message = "CSP must not allow unsafe-inline or unsafe-eval."
  }
}

run "phase3_domain_dns_only_and_modern_tls" {
  command = plan

  variables {
    domain_name        = "example.org"
    cloudflare_zone_id = "0123456789abcdef0123456789abcdef"
  }

  assert {
    condition     = toset(aws_cloudfront_distribution.site.aliases) == toset(["example.org", "www.example.org"])
    error_message = "Apex and www must both be aliases."
  }

  assert {
    condition     = aws_cloudfront_distribution.site.viewer_certificate[0].minimum_protocol_version == "TLSv1.2_2021" && aws_cloudfront_distribution.site.viewer_certificate[0].ssl_support_method == "sni-only"
    error_message = "Custom domain must use SNI and TLS 1.2+."
  }

  assert {
    condition     = alltrue([for r in cloudflare_dns_record.site : r.proxied == false]) && alltrue([for r in cloudflare_dns_record.acm_validation : r.proxied == false])
    error_message = "Cloudflare records must start DNS-only."
  }

  assert {
    condition     = strcontains(aws_cloudfront_function.canonical_host.code, "'www.example.org'") && strcontains(aws_cloudfront_function.canonical_host.code, "https://example.org")
    error_message = "www must redirect to the apex."
  }
}

run "rejects_domain_without_zone" {
  command = plan

  variables {
    domain_name = "example.org"
  }

  expect_failures = [check.domain_needs_zone]
}
