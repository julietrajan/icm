# Demo: Generate Improvement Opportunities and Assign an Issue to GitHub Copilot

## Objective

Use GitHub Copilot to analyze the repository, identify improvement opportunities, create GitHub Issues, and then assign an issue to the **GitHub Copilot coding agent** for implementation.

---

## Step 1: Analyze the Repository

Give the following prompt:

### Prompt

```
Analyze the repository.

Create a backlog of improvement opportunities.

Generate GitHub Issues for:
- Technical debt
- Missing tests
- Documentation gaps
- Security improvements

Provide acceptance criteria for each issue.
```

After running the prompt, Copilot analyzes the repository and identifies improvement opportunities.

<br>

> **Add screenshot here:** GitHub Issues created from the repository analysis.

<br>
<img width="2356" height="1264" alt="image" src="https://github.com/user-attachments/assets/bfe4ec73-3a6a-479c-9045-461dd6106790" />

---

## Step 2: Review the Generated Issues

Review the GitHub Issues created by Copilot.

Check that each issue includes:

- A clear description of the improvement
- The area of the repository affected
- Recommended changes
- Acceptance criteria

Choose one of the issues that you want Copilot to implement.

---

## Step 3: Assign the Issue to Copilot

Open the selected GitHub Issue.

Under **Assignees**, assign the issue to **Copilot**.

<br>

> **Add screenshot here:** Assigning the GitHub Issue to Copilot.

<br>
<img width="2002" height="582" alt="image" src="https://github.com/user-attachments/assets/c3541a99-bf72-409a-be95-662eaa8f4dc2" />

Once assigned, the GitHub Copilot coding agent starts working on the issue.

---

## Step 4: Monitor Copilot's Progress

Copilot analyzes the issue and repository, implements the required changes, and creates a pull request.

<br>

> **Add screenshot here:** Copilot working on the issue and creating the pull request.

<br>

---

## Step 5: Review the Pull Request

Open the pull request created by Copilot.

Review:

- The files changed
- The code changes
- The implementation against the issue requirements
- The acceptance criteria
- Any checks or tests that were run

Also verify that Copilot created a new branch for the changes.

Open the branch and confirm that the requested change has been implemented.

---

## Step 6: Mark the Pull Request as Ready for Review

After reviewing Copilot's changes, click **Ready for review**.

<br>

> **Add screenshot here:** Ready for review.

<br>

After clicking **Ready for review**, the pull request moves from draft status to ready for review.

<br>

> **Add screenshot here:** Pull request ready for review.


<br>

---

## Step 7: Merge the Pull Request

Once you are satisfied with the implementation:

1. Click **Merge pull request**.
2. Review the merge information.
3. Click **Confirm merge**.

<br>

> **Add screenshot here:** Merge pull request and Confirm merge.

<br>

---

## Outcome

You have now completed an end-to-end GitHub Copilot coding agent workflow:

**Repository Analysis → Improvement Backlog → GitHub Issue → Assign to Copilot → Implementation → Branch → Pull Request → Review → Merge**

This demonstrates how the GitHub Copilot coding agent can move beyond code generation and work from a GitHub Issue to implement and deliver a repository change.
