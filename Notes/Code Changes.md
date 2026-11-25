## Demo 1: Add an About Page to the UI

Give the following prompt to the **GitHub Copilot Coding Agent**:

### Prompt

```
Analyze the UI application.

Add a new "About" page.

Requirements:
- Add route /about
- Display title "GitHub Copilot Demo"
- Show current date
- Follow existing UI styling conventions

Update all required files.
```

### What the agent will do

The agent will:

1. Inspect routing
2. Locate the existing page structure
3. Create the new component/page
4. Update navigation

### Test the Changes Locally

Once the changes are available in the repository, update your local copy.

Open VS Code and give prompt

```
Update with the latest changes from the GitHub repository julietrajan/icm main branch
```
---

## Demo 2: Add a Health Endpoint to the API

Give the following prompt to the **GitHub Copilot Coding Agent**:

```text
Analyze the API project.

Add a new endpoint:

GET /health

Response:

{
  "status": "healthy"
}

Follow existing project patterns.
Add any required route registrations.
```

### What the agent will do

The agent will:

1. Inspect routes
2. Inspect controllers
3. Create the required code
4. Wire the endpoint

### Expected Result

Calling:

```text
GET /health
```

Should return:

```json
{
  "status": "healthy"
}
```

---

## Demo 3: Connect the UI to the Health API

Now extend the scenario so that the agent works across both the **API** and **UI**.

Give the following prompt:

```text
Add a health check screen.

Requirements:

1. Call GET /health from the API.
2. Display status on the UI.
3. Show green badge when healthy.
4. Follow existing architecture and coding standards.

Update both api and ui folders.
```

### What the agent will do

The agent will:

1. Inspect the API implementation
2. Find the `/health` endpoint
3. Inspect the existing UI architecture
4. Determine how the UI makes API calls
5. Create the health check screen
6. Connect the UI to `GET /health`
7. Display the returned health status
8. Follow the existing coding and styling conventions

## Why This Is an Agentic Scenario

Now the agent works **across folders and application layers**.

It needs to understand the relationship between the API and UI:

```text
API → GET /health → UI → Display health status
```

Instead of being told exactly which files to modify, the agent must:

- Explore the repository
- Identify the appropriate files
- Understand the existing architecture
- Make coordinated changes across the API and UI
- Follow the project's existing patterns

This is the first real **agentic scenario** in the demo.
