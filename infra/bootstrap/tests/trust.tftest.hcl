mock_provider "aws" {
  mock_data "aws_caller_identity" {
    defaults = { account_id = "123456789012" }
  }
  mock_data "aws_partition" {
    defaults = { partition = "aws" }
  }
  mock_data "aws_iam_policy_document" {
    defaults = { json = "{}" }
  }
}

run "roles_pin_repo_id_and_environment" {
  command = plan

  assert {
    condition = output.trusted_subjects == {
      plan   = "repo:Israel-Jauregui@29392107/Hacklonega@1379925648:environment:infrastructure-plan"
      apply  = "repo:Israel-Jauregui@29392107/Hacklonega@1379925648:environment:infrastructure"
      deploy = "repo:Israel-Jauregui@29392107/Hacklonega@1379925648:environment:production"
    }
    error_message = "Each role must trust exactly one environment of this repository."
  }
}

run "rejects_wildcard_subject" {
  command = plan
  variables {
    github_oidc_sub_prefix = "repo:Israel-Jauregui/*"
  }
  expect_failures = [var.github_oidc_sub_prefix]
}
