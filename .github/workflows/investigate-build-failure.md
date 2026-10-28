---
on:
  workflow_dispatch:

permissions:
  contents: read
  actions: read
  copilot-requests: write
---

# Investigate Incident Management Build Failure

Investigate the failed CI validation for the Incident Management application.

Examine the failed GitHub Actions build and the relevant repository code.

Determine the root cause of the failure.

Identify the smallest appropriate change needed to resolve the failure.

Explain what caused the failure and why the proposed change would resolve it.

Do not modify repository code. Provide a clear investigation and recommended remediation for human review.