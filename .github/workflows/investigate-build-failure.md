---
on:
  workflow_dispatch:

features:
  action-mode: release

permissions:
  contents: read
  actions: read
  copilot-requests: write

safe-outputs:
  create-issue:
    max: 1
---

# Investigate Incident Management Build Failure

Investigate the failed CI validation for the Incident Management application.

Examine the failed GitHub Actions build and the relevant repository code.

Determine the root cause of the failure.

Identify the smallest appropriate change needed to resolve the failure.

Explain what caused the failure and why the proposed change would resolve it.

Create a GitHub issue using the create-issue safe output containing:

- A summary of the failed workflow
- The root cause
- The affected file and location
- The recommended remediation
- The validation steps to run after applying the fix

Do not modify repository code.

Provide a clear investigation and recommended remediation for human review.
