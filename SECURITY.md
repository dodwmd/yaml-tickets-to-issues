# Security Policy

## Supported Versions

We provide security updates for the following versions of the project:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0.0 | :x:                |

## Reporting a Vulnerability

### Reporting Security Issues

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them to the security team by emailing [INSERT SECURITY EMAIL].

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

### When to report a vulnerability

* You think you discovered a potential security vulnerability in the project
* You are unsure how a vulnerability affects the project
* You think you discovered a vulnerability in another project that the project depends on

### When not to report a vulnerability

* You need help applying security related updates
* Your issue is not security related

## Security Updates and Alerts

Security updates will be released as new minor or patch versions. All security updates will be accompanied by a [GitHub Security Advisory](https://github.com/dodwmd/yaml-tickets-to-issues/security/advisories).

## Security Considerations

When using this project, keep the following security considerations in mind:

1. **GitHub Token Permissions**:
   - The action requires a GitHub token with `repo` scope to create and update issues
   - Never expose your GitHub token in your workflow files or logs
   - Use GitHub's built-in `secrets` to store sensitive information

2. **YAML File Security**:
   - Be cautious when processing YAML files from untrusted sources
   - The action validates YAML files against a strict schema to prevent injection attacks

3. **Dependencies**:
   - We regularly update dependencies to include security patches
   - Dependencies are locked to specific versions to prevent supply chain attacks

## Security Best Practices

1. **Keep the action up to date**:
   - Always use the latest version of the action to benefit from security updates
   - Consider pinning to a specific version to avoid unexpected updates

2. **Minimize token permissions**:
   - Use the principle of least privilege when assigning permissions
   - Consider using fine-grained personal access tokens with minimal required permissions

3. **Review your workflow files**:
   - Regularly review your GitHub Actions workflow files for security best practices
   - Use `pull_request_target` with caution as it can be a security risk

## Disclosure Policy

When the security team receives a security bug report, they will assign it to a primary handler. This person will coordinate the fix and release process, involving the following steps:

1. Confirm the problem and determine the affected versions.
2. Audit code to find any potential similar problems.
3. Prepare fixes for all releases still under maintenance. These fixes will be released as quickly as possible.

## Comments on this Policy

If you have suggestions on how this process could be improved, please submit a pull request or open an issue to discuss.
