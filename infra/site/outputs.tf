output "bucket_name" {
  value = aws_s3_bucket.site.bucket
}

output "distribution_id" {
  value = aws_cloudfront_distribution.site.id
}

output "cloudfront_domain_name" {
  description = "Phase 2 validation URL: https://<this>/"
  value       = aws_cloudfront_distribution.site.domain_name
}

output "site_url" {
  value = local.has_domain ? "https://${var.domain_name}/" : "https://${aws_cloudfront_distribution.site.domain_name}/"
}

output "certificate_status" {
  value = local.has_domain ? aws_acm_certificate.site[0].status : "not requested (no domain_name)"
}
