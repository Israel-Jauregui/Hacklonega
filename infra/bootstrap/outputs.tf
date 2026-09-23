output "aws_account_id" {
  description = "Set as the AWS_ACCOUNT_ID repository variable (scripts/configure-github.sh does this)."
  value       = local.account_id
}

output "state_bucket" {
  value = aws_s3_bucket.state.bucket
}

output "role_arns" {
  value = { for k, r in aws_iam_role.github : k => r.arn }
}

output "trusted_subjects" {
  description = "Exact sub claims each role accepts. Compare with the 'Show OIDC subject' step in a workflow run."
  value       = { for k, env in local.roles : k => "${var.github_oidc_sub_prefix}:environment:${env}" }
}
