# Demo: Use a Local MarkItDown MCP Server with GitHub Copilot Coding Agent

## Objective

Configure the **MarkItDown MCP server** for the GitHub Copilot Coding Agent and use it to extract requirements from a PDF stored in the repository.

In this demo, the Coding Agent will:

1. Use the MarkItDown MCP tool to read a PDF.
2. Extract incident response-target requirements.
3. Locate the relevant application logic.
4. Implement the requirements.
5. Add or update tests.
6. Create a pull request.

This demonstrates how a locally installed MCP server can provide an additional tool to the Coding Agent.

---

## Step 1: Add the Requirements Document

Add the incident requirements document to the following location in the repository:

```
docs/Incident-Requirements.pdf
```

Commit the PDF to the repository.

> Do not include real customer, personal, confidential, or sensitive information in the training document.

---

## Step 2: Configure the MarkItDown MCP Server

On GitHub:

1. Open the **Incident Management repository**.
2. Go to **Settings**.
3. Select **Copilot → Coding agent**.
4. Locate the **MCP / Model Context Protocol** configuration.
5. Add the following configuration.

```json
{
  "mcpServers": {
    "markitdown": {
      "type": "stdio",
      "command": "markitdown-mcp",
      "args": [],
      "tools": [
        "convert_to_markdown"
      ]
    }
  }
}
```

### What This Configuration Does

| Setting | Purpose |
|---|---|
| `markitdown` | Defines the name of the MCP server |
| `stdio` | Runs the server as a local standard input/output process |
| `markitdown-mcp` | Command used to start the MCP server |
| `convert_to_markdown` | Tool made available to the Coding Agent |

The `convert_to_markdown` tool allows the Coding Agent to convert supported files, including the PDF in this demo, into Markdown that the agent can process.

---

## Step 3: Add the Copilot Setup Workflow

The Coding Agent's environment must have the `markitdown-mcp` command installed before it can start the MCP server.

Create the following workflow file:

```
.github/workflows/copilot-setup-steps.yml
```

Add the following content:

```yaml
name: Copilot Setup Steps

on:
  workflow_dispatch:

jobs:
  copilot-setup-steps:
    runs-on: ubuntu-latest

    permissions:
      contents: read

    steps:
      - name: Check out repository
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install MarkItDown MCP
        run: |
          python -m pip install --upgrade pip
          python -m pip install markitdown-mcp

      - name: Verify MarkItDown MCP
        run: |
          command -v markitdown-mcp
          markitdown-mcp --help
```

### What the Workflow Does

1. Checks out the repository.
2. Configures Python 3.12.
3. Upgrades `pip`.
4. Installs the MarkItDown MCP package.
5. Verifies that the `markitdown-mcp` command is available.

Commit the workflow file to the repository.

---

## Step 4: Verify the Setup Workflow

Before assigning the issue to Copilot:

1. Open the **Actions** tab.
2. Select **Copilot Setup Steps**.
3. Select **Run workflow**.
4. Wait for the workflow to complete.
5. Confirm that the **Install MarkItDown MCP** and **Verify MarkItDown MCP** steps succeed.

If the verification step fails, check:

- Whether the package installed successfully
- Whether the `markitdown-mcp` command is available on the path
- Whether the package and command names are correct
- Whether the Python version is supported

> **Add screenshot here:** Successful Copilot Setup Steps workflow.
<img width="1149" height="601" alt="image" src="https://github.com/user-attachments/assets/3bea0593-2609-4f16-bf8f-e7a091443a76" />

---

## Step 5: Create the GitHub Issue

Create a new issue in the repository.

### Issue Title

```
Implement response targets from the incident requirements
```

### Issue Description

```
Use the MarkItDown MCP server's convert_to_markdown tool to read:

docs/Incident-Requirements.pdf

Do not use a different PDF extraction library or manually infer the
requirements.

After reading the document:

1. Summarize the incident response-target requirements in the session log.
2. Identify where severity and response-target logic is implemented.
3. Update the application so that the correct response target is displayed
   when a severity is selected.
4. Add or update tests for every severity level.
5. Run the relevant tests.
6. Create a pull request that explains:
   - which requirements were extracted from the document;
   - which files were changed;
   - how the implementation was validated.

Do not modify the requirements document.
```

---

## Step 6: Assign the Issue to Copilot

After creating the issue:

1. Open the issue.
2. Assign the issue to **Copilot**.
3. Wait for the Coding Agent to start.
4. Open the Coding Agent session.
5. Monitor the session log.

> **Add screenshot here:** Issue assigned to Copilot.

---

## Step 7: Check the Actions Run

Open the **Actions** tab and locate the Coding Agent run.

Confirm that the setup process:

1. Checks out the repository.
2. Sets up Python.
3. Installs the MarkItDown MCP package.
4. Verifies that `markitdown-mcp` is available.
5. Starts the Coding Agent task.

> **Add screenshot here:** Running Copilot cloud agent workflow.

---

## Step 8: Verify MarkItDown MCP Usage

In the Coding Agent session log, look for evidence that the agent:

1. Started the `markitdown` MCP server.
2. Discovered the `convert_to_markdown` tool.
3. Called `convert_to_markdown`.
4. Passed `docs/Incident-Requirements.pdf` to the tool.
5. Extracted the incident response-target requirements.
6. Summarized the extracted requirements before modifying the application.

The agent should not use another PDF library or manually infer the document's contents.

> **Add screenshot here:** MarkItDown MCP `convert_to_markdown` tool invocation.

---

## Step 9: Review the Implementation

After the Coding Agent completes the task, open the pull request.

Review the following areas:

### Extracted Requirements

Confirm that the pull request explains which response-target requirements were extracted from the PDF.

### Application Changes

Confirm that the application displays the correct response target when a severity is selected.

### Test Coverage

Confirm that tests exist for every severity level described in the requirements document.

### Validation

Confirm that the relevant tests were run successfully.

### Document Integrity

Confirm that the Coding Agent did not modify:

```
docs/Incident-Requirements.pdf
```

---

## Step 10: Review the Pull Request

Before merging, verify:

- The requirements in the pull request match the PDF.
- The implementation follows the existing project structure.
- Every severity level has test coverage.
- The relevant tests pass.
- No unrelated files were changed.
- The requirements document was not modified.
- The pull request explains how the implementation was validated.

If the implementation is correct:

1. Select **Ready for review**, if the pull request is still a draft.
2. Complete the review.
3. Select **Merge pull request**.
4. Select **Confirm merge**.

---

## How the Components Work Together

| Component | Role |
|---|---|
| **GitHub Copilot Coding Agent** | Understands the issue, analyzes the repository, implements the change, and creates the pull request |
| **MarkItDown MCP server** | Provides the document-conversion tool |
| **`convert_to_markdown`** | Converts the PDF content into Markdown the agent can process |
| **Copilot setup workflow** | Installs and verifies the MCP server in the agent environment |
| **Requirements PDF** | Provides the response-target requirements |
| **GitHub Issue** | Defines the task and instructs the agent to use the MCP tool |

---

## Normal Coding Agent vs. Coding Agent with MarkItDown MCP

### Normal Coding Agent

Without the MCP server, the Coding Agent primarily works with files and tools already available in its environment.

```
Read the requirements and implement the response-target logic.
```

This instruction does not specify how the PDF requirements should be extracted.

### Coding Agent with MarkItDown MCP

With MarkItDown MCP, the agent is explicitly given a document-conversion tool.

```
Use the MarkItDown MCP server's convert_to_markdown tool to read:

docs/Incident-Requirements.pdf
```

This makes the role of MCP clear:

**Coding Agent = Agent**

**MarkItDown MCP = Additional document-conversion tool available to the agent**

---

## Workflow Summary

```text
Requirements PDF
      ↓
GitHub Issue
      ↓
GitHub Copilot Coding Agent
      ↓
MarkItDown MCP
      ↓
convert_to_markdown
      ↓
Extracted response-target requirements
      ↓
Application changes and tests
      ↓
Pull request
```

---

## Key Takeaway

The MarkItDown MCP server extends the Coding Agent with a specialized document-processing capability.

The Coding Agent does not need to guess the requirements or rely on an unspecified PDF library. The agent uses the configured `convert_to_markdown` tool to extract the requirements and then applies those requirements to the application.

**GitHub Copilot Coding Agent + MarkItDown MCP = An agent that can read repository documents and use the extracted information to complete a development task.**
