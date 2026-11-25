# Demo: Use a Remote Microsoft Learn MCP Server with GitHub Copilot Coding Agent

## Objective

Configure the **Microsoft Learn MCP server** as a remote MCP server for the GitHub Copilot Coding Agent.

In this demo, the Coding Agent will use Microsoft Learn MCP to find current Microsoft guidance before implementing **rate limiting in the Incident Management API**.

This demonstrates how a remote MCP server can give the Coding Agent access to external tools and knowledge while it works on a development task.

---

## Step 1: Configure the MCP Servers

On GitHub:

1. Open the **Incident Management repository**.
2. Go to **Settings**.
3. Select **Copilot → Coding agent**.
4. Locate the **MCP / Model Context Protocol** configuration.
5. Add the Microsoft Learn MCP server.

If you already have MarkItDown configured, your configuration can contain both servers:

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
    },
    "microsoft-learn": {
      "type": "http",
      "url": "https://learn.microsoft.com/api/mcp",
      "tools": [
        "*"
      ]
    }
  }
}
```

---

## Local vs. Remote MCP

The two MCP servers in this configuration demonstrate two different connection types.

| MCP Server | Type | Purpose |
|---|---|---|
| **MarkItDown** | Local / `stdio` | Gives the Coding Agent document-conversion capabilities |
| **Microsoft Learn** | Remote / `http` | Gives the Coding Agent access to Microsoft Learn tools and documentation |

### MarkItDown MCP

MarkItDown is started as a local process:

```json
"type": "stdio",
"command": "markitdown-mcp"
```

The command must therefore be available in the Coding Agent environment.

### Microsoft Learn MCP

Microsoft Learn is accessed remotely:

```json
"type": "http",
"url": "https://learn.microsoft.com/api/mcp"
```

The Coding Agent connects to the remote MCP endpoint rather than starting a locally installed MCP process.

This means you do **not** need to install Microsoft Learn MCP through the Copilot setup workflow in the same way that you install `markitdown-mcp`.

---

## Step 2: Create a GitHub Issue

Create a new issue in the repository.

### Issue Title

```
Add rate limiting to the Incident Management API
```

### Issue Description

```
Add rate limiting to the Incident Management API.

Before making any changes, use the Microsoft Learn MCP server
to find the current Microsoft guidance for rate limiting in ASP.NET Core.

Use the information returned by the Microsoft Learn MCP tools
to determine the appropriate implementation.

Then implement rate limiting in the application and run the
relevant tests.

In the pull request, explain which Microsoft guidance was used.
```

---

## Step 3: Assign the Issue to Copilot

After creating the issue:

1. Open the issue.
2. Assign the issue to **Copilot**.
3. Wait for the Coding Agent session to start.
4. Open **Agents**.
5. Open the Coding Agent session.
6. Watch the session logs.

> **Add screenshot here:** Issue assigned to Copilot and Coding Agent session started.

---

## Step 4: Watch the Coding Agent Session

Open the agent session and follow the logs.

At the beginning of the session, you may see multiple MCP servers being started or prepared.

For example, the available MCP servers may include:

- GitHub MCP
- Playwright MCP
- MarkItDown MCP
- Microsoft Learn MCP

> **Add screenshot here:** Coding Agent session showing the available MCP servers.

---

## Step 5: Look for Microsoft Learn MCP Usage

The important part of this demo is not simply seeing that the **Microsoft Learn MCP server started**.

Look further into the session log for evidence that the Microsoft Learn MCP tools were actually invoked.

For this task, you should see activity related to searching Microsoft documentation for **ASP.NET Core rate limiting**.

For example, the session might show activity such as:

```
Microsoft Docs Search
```

or another Microsoft Learn MCP tool call.

> **Add screenshot here:** Microsoft Learn MCP tool being invoked to find rate-limiting guidance.
<img width="2446" height="1255" alt="image" src="https://github.com/user-attachments/assets/843dd63e-a5af-45d7-b17b-229af7ff97e2" />

---

## Step 6: Why Are Multiple MCP Servers Started?

At the beginning of a Coding Agent session, GitHub prepares the agent's **available toolbox**.

The Coding Agent may therefore initialize several MCP servers before it starts solving the task.

Your repository configuration adds:

- **MarkItDown MCP**
- **Microsoft Learn MCP**

Other MCP capabilities may also be available in the Coding Agent environment.

Starting or initializing an MCP server does **not** necessarily mean the Coding Agent actually used that MCP server to complete the task.

Think of it this way:

**Start server = Make the tool available**

**Tool call = Actually use the tool**

---

## Step 7: Server Available vs. Tool Used

This distinction is important when demonstrating MCP.

### Server Started

You may see an entry similar to:

```
Start 'microsoft-learn' MCP server
```

This means the Microsoft Learn MCP server is available to the agent.

It does **not** prove that the agent used Microsoft Learn.

### Tool Invoked

Later, you should see an actual Microsoft Learn tool invocation related to the task.

For example:

```
Microsoft Docs Search
```

This demonstrates that the Coding Agent actually used a tool exposed by the Microsoft Learn MCP server.

The workflow is:

```text
Start MCP Server
      ↓
Discover Available Tools
      ↓
Coding Agent Determines a Tool Is Needed
      ↓
Invoke Microsoft Learn MCP Tool
      ↓
Receive Microsoft Documentation
      ↓
Use the Information to Complete the Task
```

---

## Step 8: Observe the Agent's Reasoning Flow

For this task, the Coding Agent should follow a flow similar to:

1. Read the GitHub Issue.
2. Inspect the Incident Management repository.
3. Recognize that current Microsoft guidance is required.
4. Use the Microsoft Learn MCP server.
5. Search for guidance about rate limiting in ASP.NET Core.
6. Review the information returned by Microsoft Learn.
7. Inspect the API implementation.
8. Determine how rate limiting should be added.
9. Implement the change.
10. Run the relevant tests.
11. Create a pull request.

This is an important part of the demo because the Microsoft Learn MCP server is being used as part of a **larger agentic workflow**.

---

## Step 9: Review the Pull Request

Once the Coding Agent completes the task, open the pull request.

Review:

- The files changed
- The rate-limiting implementation
- Any configuration changes
- Tests that were added or updated
- Test results
- The Microsoft guidance referenced by the Coding Agent

The pull request should explain which Microsoft guidance was used to determine the implementation.

---

## Local MCP vs. Remote MCP

You can now use the MarkItDown and Microsoft Learn demos to explain the difference between local and remote MCP servers.

| | MarkItDown MCP | Microsoft Learn MCP |
|---|---|---|
| **Type** | `stdio` | `http` |
| **Runs** | In the Coding Agent environment | Remote service |
| **Installation required in agent environment** | Yes | No local installation |
| **Primary purpose in this demo** | Read a PDF | Search Microsoft documentation |
| **Example tool usage** | Convert PDF to Markdown | Find ASP.NET Core guidance |

---

## What Does the Microsoft Learn MCP Add?

Without Microsoft Learn MCP, you could ask the Coding Agent:

```
Add rate limiting to the Incident Management API.
```

The agent would need to solve the task using the context and tools otherwise available to it.

With Microsoft Learn MCP, the task explicitly requires the agent to retrieve current Microsoft guidance first:

```
Before making any changes, use the Microsoft Learn MCP server
to find the current Microsoft guidance for rate limiting in ASP.NET Core.

Use the information returned by the Microsoft Learn MCP tools
to determine the appropriate implementation.
```

The development decision is therefore grounded in information retrieved through the MCP tool.

---

## How the Components Work Together

| Component | Role |
|---|---|
| **GitHub Copilot Coding Agent** | The agent that reasons about and performs the development task |
| **Microsoft Learn MCP** | Provides remote Microsoft Learn tools to the agent |
| **Microsoft Learn documentation** | Provides guidance used to inform the implementation |
| **Incident Management repository** | Contains the application the agent modifies |
| **GitHub Issue** | Defines the task and explicitly requires use of Microsoft Learn MCP |

---

## Demo Flow

```text
GitHub Issue
      ↓
GitHub Copilot Coding Agent
      ↓
Microsoft Learn MCP
      ↓
Microsoft Learn guidance
      ↓
Coding Agent evaluates the guidance
      ↓
Inspect Incident Management API
      ↓
Implement rate limiting
      ↓
Run tests
      ↓
Create pull request
```

---

## Key Takeaway

MCP makes additional tools available to the Coding Agent.

In this example:

**Coding Agent = Agent**

**Microsoft Learn MCP = Remote tool provider**

**Microsoft Learn = External knowledge source**

The important distinction to show learners is:

**MCP server started ≠ MCP tool used**

Instead:

**Server started → Tool available**

**Tool invoked → Tool actually used**

This demo shows the Coding Agent using a **remote MCP server** to retrieve relevant Microsoft guidance and then applying that information to a real development task.
