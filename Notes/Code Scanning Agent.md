# Demo: Create a Code Scanner Custom Agent

## Objective

Create a repository custom agent that reviews code and pull requests for security, maintainability, quality, testing, and compliance issues before code is merged.

The agent will act as a **senior software security and quality reviewer**.

---

## Step 1: Create the Custom Agent

1. Open the repository in GitHub.
2. Select **Agents**.
3. Open the agent selector.
4. Select **Create a custom agent**.
5. Name the agent file:

```
code-scanner.agent.md
```

The custom agent file should be stored in:

```
.github/agents/code-scanner.agent.md
```

---

## Step 2: Add the Agent Instructions

Add the following content to the custom agent file:

```markdown
---
name: Code Scanner
description: Reviews code for security, maintainability, quality, and compliance issues before code is merged.
---

You are a senior software security and quality reviewer.

When reviewing code:

## Security Checks

Look for:

- Hardcoded secrets
- API keys
- Connection strings
- Passwords
- Tokens
- Sensitive URLs
- Insecure authentication patterns
- Missing authorization checks
- SQL injection risks
- Command injection risks
- Cross-site scripting risks

## Code Quality Checks

Look for:

- Duplicate code
- Dead code
- Unused imports
- Large functions
- Poor naming conventions
- Missing error handling
- Missing logging
- Magic numbers
- Poor maintainability

## Python Checks

Review for:

- PEP 8 compliance
- Type hints
- Exception handling
- Dependency issues
- Performance bottlenecks

## Testing Checks

Verify:

- Unit tests exist
- Edge cases are covered
- Negative scenarios are tested

## Review Output

Provide:

### Critical Issues

List security or stability risks.

### Medium Findings

List maintainability concerns.

### Suggestions

List recommended improvements.

### Merge Recommendation

Provide one of the following recommendations:

- Approve
- Approve with comments
- Changes required

Never modify code directly unless explicitly instructed.

Provide file names and line numbers whenever possible.
```

---

## Step 3: Commit the Custom Agent

Commit the new custom agent file to the repository.

After the file is committed, supported GitHub Copilot experiences can discover the **Code Scanner** agent.

---

## Demo 1: Review a Pull Request

Open the pull request that you want to review and select the **Code Scanner** custom agent.

Give the following prompt:

```
Review the pull request for security, coding standards, and maintainability.

Provide:

- Critical findings
- Medium findings
- Low findings
- Merge recommendation
```

### Expected Review

The Code Scanner should:

1. Review the files changed in the pull request.
2. Identify security issues.
3. Check coding standards.
4. Identify maintainability concerns.
5. Categorize findings by severity.
6. Provide a merge recommendation.

---

## Demo 2: Create an Intentionally Insecure Python File

> **Important:** The following code is intentionally insecure and incomplete. Use it only in a disposable training repository. Do not run or deploy it.

Create the following file:

```
LTM/test.py
```

Add this code:

```python
password = "xx"

def getUser(id):
    query = f"SELECT * FROM users WHERE id={id}"
    return query
```

This example intentionally contains issues that the Code Scanner should identify, including:

- A hardcoded password
- A potential SQL injection vulnerability
- A noncompliant Python function name
- Missing type hints
- Missing error handling
- Missing documentation
- No input validation
- No tests

Commit the file to the repository.

---

## Step 4: Select the Code Scanner Agent

1. Open **GitHub Copilot** from the top menu.
2. Open the agent selector.
3. Select **Code Scanner**.
4. Ask the agent to review the file.

---

## Step 5: Review the Test File

Give the following prompt:

```
Review the file LTM/test.py in the current repository.

Identify:
- Security issues
- Code quality issues
- Maintainability concerns

Provide:
- Critical findings
- Medium findings
- Low findings
- Recommendations
```

---

## Expected Findings

The Code Scanner should identify findings such as:

### Critical Findings

- The `password` variable contains a hardcoded credential.
- The SQL query is constructed using an f-string, creating a potential SQL injection vulnerability.

### Medium Findings

- The function name `getUser` does not follow Python's `snake_case` naming convention.
- The function does not include type hints.
- The input is not validated.
- The function does not include error handling.
- The code does not use parameterized queries.

### Low Findings

- The function does not include a docstring.
- The variable names could be more descriptive.
- No logging is implemented.
- No unit tests are available.

### Recommendations

- Remove hardcoded credentials and use a secure secret-management solution.
- Replace the dynamically constructed SQL statement with a parameterized query.
- Rename `getUser` to `get_user`.
- Add type hints and documentation.
- Add input validation and error handling.
- Add unit tests covering valid, invalid, and malicious input.
- Rotate any credential that may have been committed to the repository.

---

## Outcome

You have created and tested a repository custom agent that specializes in reviewing code for security and quality issues.

**Custom Agent → Pull Request Review → Security Analysis → Quality Findings → Merge Recommendation**
