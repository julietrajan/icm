# GitHub Copilot CLI

## Overview

GitHub Copilot CLI brings Copilot into the terminal, allowing developers to explore repositories, ask questions, modify files, review changes, run commands, and coordinate development tasks without leaving the command line.

In this demo, you will:

1. Install GitHub Copilot CLI.
2. Start Copilot in a project folder.
3. explore models and commands.
4. Update a README file.
5. Use Fleet to delegate work to subagents.
6. Create and test a project skill.
7. Manage the session context.
8. Review changes.
9. Share the session.

> The commands and features available can depend on the installed GitHub Copilot CLI version and your GitHub Copilot entitlement.

---

# Demo 1: Install GitHub Copilot CLI

## Step 1: Check the Prerequisites

Before installing GitHub Copilot CLI, confirm that Node.js and npm are available:

```bash
node --version
```

```bash
npm --version
```

## Step 2: Install GitHub Copilot CLI

Run:

```bash
npm install -g @github/copilot
```

## Step 3: Verify the Installation

Run:

```bash
copilot --help
```

If the command is not found, restart the terminal and try again.

---

# Demo 2: Start Copilot in a Project

## Step 1: Navigate to the Project Folder

Move to the Incident Management repository:

```bash
cd path/to/incident-management
```

Confirm the current folder:

```bash
pwd
```

Check the repository status:

```bash
git status
```

## Step 2: Start GitHub Copilot CLI

Run:

```bash
copilot
```

GitHub Copilot CLI starts an interactive session using the current project folder as context.

> **Add screenshot here:** GitHub Copilot CLI interactive session.
<img width="1453" height="904" alt="image" src="https://github.com/user-attachments/assets/8d845823-5746-49f0-b204-edfa464052bc" />

---

# Demo 3: Use Copilot to Update a File

You can start Copilot with a prompt directly from the terminal.

Run:

```bash
copilot "Review the README and make it beginner-friendly."
```

Copilot should inspect the repository and propose changes to the README.

Before accepting any changes:

1. Review the proposed modifications.
2. Confirm that only the intended files are affected.
3. Review the Git diff.
4. Run any relevant validation commands.

Check the changes:

```bash
git diff
```

Check the files modified:

```bash
git status
```

---

# Demo 4: Explore Commands and Models

Inside the interactive Copilot CLI session, use:

```text
/help
```

This displays the commands available in the installed version.

To review or change the model, use:

```text
/model
```

If supported by the installed version, you can also explore available models using:

```text
/models
```

> Use `/help` as the authoritative reference for the commands supported by the installed CLI version.

---

# Demo 5: Use Fleet for Parallel Agent Execution

## What Is Fleet?

In GitHub Copilot CLI, Fleet allows the main Copilot agent to delegate parts of a complex task to subagents.

Think of Fleet as moving from:

```text
One Copilot agent doing everything
```

to:

```text
One lead Copilot agent coordinating multiple subagents
```

The main Copilot agent acts as the **orchestrator**.

The main agent:

1. Analyzes the request.
2. Determines whether the work can be decomposed.
3. Identifies dependencies between tasks.
4. Delegates suitable work to subagents.
5. Coordinates the overall result.

Where tasks are independent, delegated subagents may work in parallel.

---

## Simple Example

Imagine the Incident Management application needs the following improvements:

- Add authentication.
- Create API tests.
- Improve the UI.
- Update the documentation.

Without Fleet, Copilot may process these requirements as part of one agent workflow.

With Fleet, the work could conceptually be coordinated like this:

```text
Main Copilot agent
        │
        ├── Subagent: Authentication
        ├── Subagent: API tests
        ├── Subagent: UI changes
        └── Subagent: Documentation
```

The main Copilot agent coordinates the work and manages dependencies.

> Do not assume that four tasks always result in exactly four subagents. Copilot determines whether delegation is appropriate and how the request should be decomposed.

---

## Run a Fleet Prompt

Inside the Copilot CLI session, run:

```text
/fleet Implement authentication, tests, UI improvements, and documentation updates for the Incident Management application.
```

The main Copilot agent analyzes the request and determines which parts can be delegated.

> **Add screenshot here:** Fleet decomposing work into subtasks.

---

## Influence the Orchestration

Copilot controls Fleet orchestration by default, but the developer can provide additional direction in the prompt.

For example:

```text
/fleet Implement the approved plan. Use @test-agent for testing and @docs-agent for documentation.
```

This prompt expresses a preference for specific custom agents.

The main Copilot agent still coordinates:

- Task decomposition
- Dependencies
- Delegation
- Parallel execution
- Result consolidation

---

## Fleet Conceptual Flow

```text
Developer request
        ↓
Main Copilot agent analyzes the request
        ↓
Agent identifies independent and dependent tasks
        ↓
Suitable tasks are delegated
        ↓
Subagents work on assigned tasks
        ↓
Main agent coordinates the results
```

---

# Demo 6: Review Background Tasks

After starting a Fleet task, use:

```text
/tasks
```

This displays tasks associated with the current session, including work delegated to subagents.

Use the task view to:

- Monitor task status.
- Identify background work.
- Open individual tasks.
- Review completed-task summaries.
- Understand how Fleet decomposed the request.

> **Add screenshot here:** Background tasks created through Fleet.

---

# Demo 7: Create a Project Skill with Copilot CLI

## What Is a Project Skill?

A project skill provides reusable instructions and guidance for a particular task.

In this demo, you will create an **Incident Resolution Planner** skill that helps developers investigate incidents and prepare safe implementation plans.

The skill will be stored at:

```text
.github/skills/incident-resolution-planner/SKILL.md
```

---

## Skill-Creation Prompt

Give Copilot the following prompt:

```text
Create a project skill named incident-resolution-planner.

Store it at:

.github/skills/incident-resolution-planner/SKILL.md

The skill must help a developer investigate and plan the resolution of an incident or bug in an existing application.

The skill should:

- Understand the incident description and acceptance criteria
- Identify the likely affected application components
- Inspect relevant source files before proposing changes
- Trace the flow from the user interface through APIs and data storage
- Identify possible root causes
- Distinguish confirmed evidence from assumptions
- Assess security, reliability, and regression risks
- Recommend files that may need modification
- Propose tests for the incident scenario
- Produce a safe implementation plan
- Avoid changing files unless the developer explicitly requests implementation

The output must contain:

1. Incident summary
2. Evidence collected
3. Affected components
4. Root-cause hypotheses
5. Risk assessment
6. Recommended implementation plan
7. Test scenarios
8. Documentation updates
9. Questions or missing information
10. Definition-of-done checklist

Before creating any files, show me the proposed SKILL.md for review.
```

---

## Review Before Creation

Copilot should first display the proposed `SKILL.md`.

Review the proposed skill and confirm that:

- The skill has a clear purpose.
- The instructions prioritize repository evidence.
- Confirmed findings are separated from assumptions.
- Security and regression risks are considered.
- The skill does not modify files automatically.
- The output structure is consistent.
- The definition of done is clear.

After reviewing the proposed content, tell Copilot to create the file.

For example:

```text
The proposed skill looks good.

Create the SKILL.md file at the specified location.

Do not modify any other files.
```

---

## Verify the Skill File

Check the repository status:

```bash
git status
```

Review the created file:

```bash
git diff -- .github/skills/incident-resolution-planner/SKILL.md
```

The expected project structure is:

```text
.github/
└── skills/
    └── incident-resolution-planner/
        └── SKILL.md
```

---

# Demo 8: Test the Incident Resolution Planner Skill

## Scenario

Use a realistic authorization issue:

```text
An Azure DevOps work item reports that standard users can close critical incidents, but only incident managers should have that permission.

Investigate this repository using the incident-resolution-planner skill.

Do not modify files.

Identify:

- Evidence collected
- Affected components
- Possible root cause
- Security and reliability risks
- Recommended implementation plan
- Required tests
- Documentation updates
- Missing information
- Definition-of-done checklist
```

The skill should guide Copilot to investigate before recommending changes.

---

## Expected Investigation Flow

Copilot should:

1. Understand the reported incident.
2. Inspect the relevant source files.
3. Trace the authorization flow.
4. Identify where incident closure is handled.
5. Identify where roles or permissions are checked.
6. Separate evidence from assumptions.
7. Assess the security impact.
8. Recommend the smallest safe change.
9. Propose positive and negative test scenarios.
10. Produce an implementation plan.

The skill should not modify repository files during this phase.

---

# Demo 9: Implement the Approved Plan

After reviewing and approving the investigation plan, follow with:

```text
Now implement the approved plan on a new branch.

Make the smallest safe change.

Add the required tests.

Run the relevant validation commands.

Do not make unrelated changes.
```

Before implementation, Copilot should:

1. Create or use a dedicated branch.
2. Confirm the files likely to be changed.
3. Follow the approved implementation plan.
4. Add the required tests.
5. Run relevant validation commands.
6. Summarize the changes.

Review the resulting changes:

```bash
git status
```

```bash
git diff
```

---

# Demo 10: Explore Available Skills

To list available skills, use:

```text
/skills list
```

To inspect the Incident Resolution Planner skill, use:

```text
/skills info incident-resolution-planner
```

Use these commands to verify that the project skill is discoverable and to review its metadata or instructions.

> If these commands are not recognized, use `/help` to check the skill-related commands supported by the installed CLI version.

---

# Demo 11: Change the Model

To review or change the model used in the current session, use:

```text
/model
```

Depending on the installed CLI version and account configuration, Copilot may display available model choices.

A model choice may affect:

- Reasoning behavior
- Response speed
- Context capacity
- Code-generation behavior
- Tool-use behavior

Select a model appropriate for the task and within your organization's policies.

---

# Demo 12: Manage the Context Window

## View the Context

Use:

```text
/context
```

This helps you understand how much of the model's context window is currently occupied.

The context may include:

- Conversation history
- User prompts
- Copilot responses
- Repository files
- Tool results
- Task information
- Instructions
- Session state

---

## Compact the Session

As a session becomes longer, use `/compact` to reduce the amount of detailed conversation history retained in the active context.

For example:

```text
/compact Focus on the authentication design discussion, agreed implementation plan, affected files, security decisions, and remaining tasks.
```

When you run `/compact`, Copilot should create a smaller summary of the relevant conversation context so work can continue in the same session.

Conceptually:

```text
Large conversation history
        ↓
Compact the important information
        ↓
Retain goals, decisions, files, and next steps
        ↓
Free context space
        ↓
Continue working in the same session
```

---

## Before Compacting

A long session may contain:

```text
User: Analyze the architecture.
Copilot: Architecture explanation.

User: Trace the authentication flow.
Copilot: Authentication analysis.

User: Identify authorization risks.
Copilot: Security findings.

User: Create an implementation plan.
Copilot: Proposed plan.

User: Discuss test coverage.
Copilot: Test recommendations.
```

## After Compacting

Copilot may retain a concise summary such as:

```text
Project: Incident Management application

Key decisions:
- Use the existing authentication architecture.
- Add role-based authorization for incident closure.
- Standard users must not close critical incidents.
- Incident managers can close critical incidents.

Affected areas:
- Authorization policy
- Incident API endpoint
- Incident service
- Role validation
- Unit and integration tests

Remaining tasks:
- Implement the approved authorization change.
- Add positive and negative tests.
- Run the relevant validation commands.
```

The compacted summary is intended to help continue the **current session** with less context usage.

Do not assume that the compacted context will automatically be available in a different session.

---

# Demo 13: Use Session Checkpoints

Use the relevant session-checkpoint command shown by:

```text
/help
```

Session checkpoints can help preserve important moments during longer development tasks.

Good checkpoint moments include:

- Architecture understanding completed
- Implementation plan approved
- Security decision confirmed
- Code changes completed
- Tests completed
- Work ready for review

> Command availability and syntax can vary. Check `/help` in the installed CLI version before the demo.

---

# Demo 14: Review Code Changes

Use:

```text
/review
```

The review command allows Copilot to analyze code changes without leaving the CLI.

Use it before committing changes to identify:

- Potential bugs
- Security issues
- Maintainability concerns
- Missing tests
- Unhandled edge cases
- Unrelated changes
- Documentation gaps

A useful review workflow is:

```text
Implement change
        ↓
Run tests
        ↓
Review git diff
        ↓
Run /review
        ↓
Address findings
        ↓
Commit changes
```

Also inspect the changes directly:

```bash
git diff
```

```bash
git status
```

---

# Demo 15: Share the Session

Use:

```text
/share
```

Depending on the available sharing options, Copilot CLI may allow you to share or export the current session as:

- A link to a session on GitHub
- A Markdown file
- An interactive HTML file
- A private GitHub Gist

This is useful when you want to:

- Share an investigation with another developer.
- Preserve an implementation discussion.
- Capture prompts and responses.
- Document design decisions.
- Share troubleshooting steps.
- Keep a record outside the active CLI session.

Before sharing, review the session for:

- Credentials
- Tokens
- Customer data
- Internal URLs
- Sensitive source code
- Personal information
- Confidential incident details

---

# Useful Commands

| Command | Purpose |
|---|---|
| `copilot` | Start an interactive GitHub Copilot CLI session |
| `copilot "prompt"` | Start Copilot with a direct prompt |
| `/help` | Display commands supported by the installed CLI version |
| `/model` | Review or change the model |
| `/fleet` | Ask Copilot to coordinate a complex task using subagents |
| `/tasks` | Review tasks and delegated subtasks |
| `/skills list` | List available skills |
| `/skills info <skill-name>` | Show information about a skill |
| `/context` | Review context-window usage |
| `/compact` | Compact the current conversation context |
| `/review` | Review code changes from the CLI |
| `/share` | Share or export the current session |

---

# Complete Demo Flow

```text
Install GitHub Copilot CLI
        ↓
Open the Incident Management project
        ↓
Start an interactive Copilot session
        ↓
Review and improve the README
        ↓
Explore models and available commands
        ↓
Use Fleet for a complex request
        ↓
Monitor delegated tasks
        ↓
Create a project skill
        ↓
Use the skill to investigate an incident
        ↓
Approve the implementation plan
        ↓
Implement the smallest safe change
        ↓
Review the code changes
        ↓
Compact the context if required
        ↓
Share the session
```

---

# Suggested Trainer Narrative

You can introduce the demo with:

> So far, we have used GitHub Copilot in the editor, through the Coding Agent, and in GitHub workflows. GitHub Copilot CLI brings the same agentic experience into the terminal, where developers already navigate repositories, run builds, execute tests, and manage Git.

When demonstrating Fleet, explain:

> The main Copilot agent acts as an orchestrator. It analyzes the request and decides whether parts of the work can be delegated. Independent tasks may be handled by subagents in parallel, but the number of subagents is determined by Copilot rather than directly by the number of bullet points in the prompt.

When demonstrating skills, explain:

> A skill provides reusable instructions for a repeatable development task. Instead of explaining how to investigate an incident every time, we capture the process in a project skill and allow Copilot to apply it consistently.

When demonstrating context management, explain:

> A long-running development session can consume a significant amount of context. The context and compact commands help us understand and manage that context while continuing the same task.

---

# Key Takeaway

GitHub Copilot CLI is more than a command generator.

It can support a broader development workflow:

```text
Understand
    ↓
Plan
    ↓
Delegate
    ↓
Implement
    ↓
Validate
    ↓
Review
    ↓
Share
```

The key concepts demonstrated are:

- **Interactive GitHub Copilot in the terminal**
- **Repository-aware assistance**
- **Fleet orchestration and subagents**
- **Reusable project skills**
- **Context management**
- **Code review**
- **Session sharing**

This demonstrates how GitHub Copilot CLI can support a developer from initial repository exploration through implementation, validation, review, and collaboration.
