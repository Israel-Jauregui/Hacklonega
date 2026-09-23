# Permissions for each GitHub role. Nothing here grants IAM write access, so
# neither workflow can widen its own permissions.

# ---------------------------------------------------------------- plan (read-only)

data "aws_iam_policy_document" "plan" {
  statement {
    sid       = "StateRead"
    actions   = ["s3:ListBucket"]
    resources = [local.state_bucket_arn]
  }

  statement {
    sid       = "StateObjectRead"
    actions   = ["s3:GetObject"]
    resources = ["${local.state_bucket_arn}/site/*"]
  }

  # S3-native lockfile: plan takes and releases a lock, nothing else.
  statement {
    sid       = "StateLock"
    actions   = ["s3:PutObject", "s3:DeleteObject"]
    resources = ["${local.state_bucket_arn}/site/*.tflock"]
  }

  # Bucket-level reads only; plan never reads site objects.
  statement {
    sid       = "SiteBucketRead"
    actions   = ["s3:GetBucket*", "s3:GetEncryptionConfiguration", "s3:GetLifecycleConfiguration", "s3:GetAccelerateConfiguration", "s3:GetReplicationConfiguration", "s3:ListBucket"]
    resources = [local.site_bucket_arn]
  }

  statement {
    sid = "EdgeRead"
    actions = [
      "cloudfront:Get*",
      "cloudfront:List*",
      "cloudfront:Describe*",
      "acm:DescribeCertificate",
      "acm:ListCertificates",
      "acm:ListTagsForCertificate",
      "acm:GetCertificate",
    ]
    resources = ["*"]
  }

  statement {
    sid       = "BudgetRead"
    actions   = ["budgets:ViewBudget", "budgets:ListTagsForResource"]
    resources = ["arn:${local.partition}:budgets::${local.account_id}:budget/${var.project}-*"]
  }
}

# ---------------------------------------------------------------- apply

data "aws_iam_policy_document" "apply" {
  source_policy_documents = [data.aws_iam_policy_document.plan.json]

  statement {
    sid       = "StateWrite"
    actions   = ["s3:PutObject", "s3:DeleteObject"]
    resources = ["${local.state_bucket_arn}/site/*"]
  }

  statement {
    sid       = "SiteBucketManage"
    actions   = ["s3:*"]
    resources = [local.site_bucket_arn]
  }

  # CloudFront and ACM have only partial resource-level support, so these are
  # account-wide. Only the protected, reviewer-gated environment can use them.
  statement {
    sid = "EdgeManage"
    actions = [
      "cloudfront:*",
      "acm:RequestCertificate",
      "acm:DeleteCertificate",
      "acm:AddTagsToCertificate",
      "acm:RemoveTagsFromCertificate",
      "acm:UpdateCertificateOptions",
    ]
    resources = ["*"]
  }

  statement {
    sid       = "BudgetManage"
    actions   = ["budgets:ModifyBudget", "budgets:TagResource", "budgets:UntagResource"]
    resources = ["arn:${local.partition}:budgets::${local.account_id}:budget/${var.project}-*"]
  }
}

# ---------------------------------------------------------------- deploy

data "aws_iam_policy_document" "deploy" {
  statement {
    sid       = "SiteList"
    actions   = ["s3:ListBucket"]
    resources = [local.site_bucket_arn]
  }

  statement {
    sid       = "SiteObjects"
    actions   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
    resources = ["${local.site_bucket_arn}/*"]
  }

  statement {
    sid       = "FindDistribution"
    actions   = ["cloudfront:ListDistributions"]
    resources = ["*"]
  }

  statement {
    sid       = "Invalidate"
    actions   = ["cloudfront:CreateInvalidation", "cloudfront:GetInvalidation"]
    resources = ["arn:${local.partition}:cloudfront::${local.account_id}:distribution/*"]
  }
}

locals {
  role_policies = {
    plan   = data.aws_iam_policy_document.plan.json
    apply  = data.aws_iam_policy_document.apply.json
    deploy = data.aws_iam_policy_document.deploy.json
  }
}

resource "aws_iam_role_policy" "github" {
  for_each = local.role_policies
  name     = "${var.project}-${each.key}"
  role     = aws_iam_role.github[each.key].id
  policy   = each.value
}
