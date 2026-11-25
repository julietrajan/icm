# Demo: Generate Repository Documentation

## Objective

Use GitHub Copilot to analyze the existing repository and generate technical documentation for the architecture, API, and UI without modifying the application source code.

---

## Prompt

Give the following prompt to **GitHub Copilot**:

```
Review the repository.

Create:
- Architecture.md
- API.md
- UI.md

Include diagrams in Mermaid format where applicable.
Do not modify source code.
```

---

## What the Agent Will Do

GitHub Copilot will review the repository and generate:

- **Architecture.md** - Documents the overall application architecture and major components.
- **API.md** - Documents the API structure, endpoints, and relevant implementation details.
- **UI.md** - Documents the UI structure, components, and application flow.
- **Mermaid diagrams** - Adds diagrams where they help explain the architecture or application flow.

The agent should create documentation files only and **not modify the application source code**.

---

## Review the Generated Documentation

Open each generated Markdown file and review the content:

1. `Architecture.md`
2. `API.md`
3. `UI.md`

Check that:

- The documentation reflects the existing repository.
- The API and UI components are accurately described.
- Mermaid diagrams render correctly.
- No application source code was modified.

---

## Outcome

You have used GitHub Copilot to turn an existing codebase into structured technical documentation.

**Repository → Copilot Analysis → Architecture Documentation → API Documentation → UI Documentation → Mermaid Diagrams**
