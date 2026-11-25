# IncidentDesk

IncidentDesk helps you track issues, assign work, and record how incidents are resolved. An **incident** is an issue that needs attention, such as a network outage or an application error.

The app has two parts: a **React 19 frontend** (the interface you open in your browser) and a **.NET 10 ASP.NET Core API backend** (the service that reads and saves incidents). Records are stored in a local JSON file, so you do not need to set up a database or external service.

**Start here:** [Install the prerequisites](#prerequisites), [run the app](#run-locally), then [create an incident](#try-the-app). You do not need the API reference to use the browser interface.

> **Local development only:** The app has no sign-in or access controls. Do not expose it publicly or enter sensitive production data. See [Data storage](#data-storage) for storage and deployment limitations.

## Features

- Dashboard counts for total, active, critical, and resolved incidents.
- Create, view, edit, and delete incidents with confirmation.
- Priority, category, reporter, assignee, and status tracking.
- Search, status/priority filters, sorting, and active/resolved views.
- Overdue badges and red Updated timestamps for active incidents with no update for 24 hours or more.
- Export matching incidents to CSV in the displayed sort order.
- Timestamped incident notes and resolution/reopening timestamps.
- Responsive layout, accessible native dialogs, and blue-accented light/dark themes.
- Server-side validation and explicit API/UI error reporting.
- Protection against overwriting someone else's changes: outdated edits and deletes are rejected.
- Local JSON-file storage; records remain available after restarting the app.

## Prerequisites

Install these tools before starting:

| Tool | What to install | Why you need it |
|---|---|---|
| [.NET SDK](https://dotnet.microsoft.com/download/dotnet/10.0) | .NET **10 SDK**, not just the runtime | Builds and runs the backend |
| [Node.js](https://nodejs.org/en/download) | Node.js **22.12 or later in the 22.x series**, or another Vite 7-compatible version | Runs the frontend tools; includes **npm**, the package manager that downloads JavaScript dependencies |
| Editor (optional) | [Visual Studio Code](https://code.visualstudio.com/) | Lets you edit files and open terminals in one place |

Open a PowerShell terminal and check that the required tools are available:

```powershell
dotnet --version
node --version
npm --version
```

The commands should print version numbers, including `10.x` for the .NET SDK and a compatible Node.js version. If a command is not recognized, install the tool and reopen your terminal.

## Run locally

These examples use **Windows PowerShell**. Copy only the commands inside each code block.

### 1. Open the project folder

Clone the repository using Git, or download and extract its ZIP from GitHub. Open the resulting folder in your editor.

Open a terminal in the **project root**: the folder containing `IncidentManagement.sln`, `IncidentManagement.Api`, and `client`. In VS Code, use **Terminal > New Terminal**.

Unless a step says otherwise, run the commands below from that folder.

### 2. Start the backend (terminal 1)

```powershell
dotnet run --project .\IncidentManagement.Api --launch-profile http
```

The first run restores .NET dependencies and builds the API, which may take a little longer. Wait for output showing that the service is listening on **http://localhost:5051**.

**Leave this terminal running.** It will not return to the command prompt while the backend is active.

### 3. Start the frontend (terminal 2)

Open a **second terminal in the project root**, keeping the first one running:

```powershell
npm --prefix .\client install
npm --prefix .\client run dev
```

`npm install` downloads the frontend dependencies. You need it on the first run and after dependency changes; on later runs, just use `npm --prefix .\client run dev`.

Wait for the frontend to report that it is ready, then open **http://127.0.0.1:5173** in your browser. Keep both terminals running while using the app.

The frontend forwards `/api` requests to the backend automatically through Vite, its development server. You do not need to configure browser cross-origin access (CORS).

### 4. Stop or restart the app

Press **Ctrl+C** in each terminal to stop its server. To restart, repeat the backend and frontend start commands; there is no need to reinstall dependencies each time. Stopping the app does not delete saved incidents.

### Optional: start using VS Code tasks

After installing frontend dependencies, run `dotnet build .\IncidentManagement.sln` from the project root. Then choose **Terminal > Run Task** and run **Run incident API** and **Run React UI** as separate tasks instead of the terminal commands above.

The API task uses the existing build. Rebuild the backend after changing C# code and before restarting that task.

## Try the app

The app loads records from `IncidentManagement.Api\Data\incidents.json`, so you may see existing incidents rather than an empty dashboard. Changes made in the interface are saved to that file. To experiment without changing existing records, stop the backend and follow the [storage override instructions](#use-a-separate-data-file-optional) before restarting it.

1. Select **New incident**.
2. Enter an **Incident title**, **Description**, and **Reported by**. Choose a priority and category; **Assigned to** is optional.
3. Select **Create incident**. New incidents start with the status **New**.
4. Open an incident to view its details, edit it, or add a note. When editing, use **Status** to track progress, then select **Save changes**.
5. Use search and filters to find records, or **Export CSV** to download the matching incidents for a spreadsheet.

Resolved and closed incidents no longer count as active. The dashboard summarizes total, active, critical, and resolved incidents.

In the incident list, active incidents (New, In progress, or On hold) show an **Overdue** badge beside a red **Updated** timestamp after 24 hours without an update. Resolved and closed incidents are never marked overdue. The indicator checks the time once a minute while the page is open; it does not change incident data or fetch updates from the API. Use **Refresh** to load changes made elsewhere.

Use **Light mode** / **Dark mode** in the header to switch themes. The initial theme follows your system preference unless the URL includes `?scoutTheme=light` or `?scoutTheme=dark`. Switching themes with the button does not save your preference across reloads.

## Troubleshooting

| Problem | What to do |
|---|---|
| `dotnet`, `node`, or `npm` is not recognized | Install the required tool from [Prerequisites](#prerequisites), then reopen the terminal or VS Code. |
| PowerShell says `npm.ps1` cannot run because scripts are disabled | Use `npm.cmd` instead of `npm` in the commands, for example `npm.cmd --prefix .\client run dev`. |
| A command cannot find the project or `package.json` | Check that your terminal is in the project root. The frontend commands above use `--prefix .\client` to select its folder. |
| Port `5051` or `5173` is already in use | Check for another copy of this app running in your terminals and stop that copy with **Ctrl+C**. Do not stop unrelated processes. The frontend requires port `5173`. |
| The page opens but incidents do not load | Confirm the backend is still running on port `5051`. Check the browser's error message and the backend terminal for details. |
| An edit or delete reports a conflict | Someone changed the record after you loaded it. Reload it and review the latest values before trying again. |
| Saving or loading reports a storage error | Check the backend logs, file permissions, and whether another program is locking the data file. Do not delete existing data to clear the error; see [Data storage](#data-storage). |

To check whether the backend is responding, run this in another PowerShell terminal:

```powershell
Invoke-RestMethod http://localhost:5051/api/health
```

The response contains `status: healthy`. This checks only that the backend is running, not that the incident data file can be read.

## Project structure

Use this map when you are ready to explore the code:

```text
IncidentManagement.sln
IncidentManagement.Api\
  Controllers\       HTTP endpoints
  Models\            Incident entities, enums, request validation, file schema
  Services\          IIncidentService and JsonIncidentService
  Data\incidents.json
client\
  src\
    components\      Forms, detail view, and modal
    models\          Shared UI defaults, labels, and constants
    services\        API client, error handling, and CSV export
    App.jsx          Dashboard and application state
    styles.css       Responsive layout and blue light/dark theme palettes
tests\
  api.test.mjs       Real HTTP integration tests using Node's built-in test runner
  incidentCsv.test.mjs CSV formatting and spreadsheet-safety tests
  incidentModel.test.mjs UI model defaults, labels, and constants tests
  incidentService.test.mjs API client tests with mocked fetch
  theme.test.mjs     Theme palette and contrast checks
```

## Export incidents

CSV is a text format that spreadsheet applications can open.

Select **Export CSV** beside **Refresh** to download the currently loaded incidents matching the selected view, search, and status/priority filters. Rows follow the displayed sort order. Export is disabled while loading, during a mutation, or when no incidents match; it does not refresh or change records.

Downloads are named `incidents-YYYY-MM-DD.csv` using the current UTC date. Columns are Reference, Title, Status, Priority, Category, Reporter, Assignee, Created At, Updated At, and Resolved At. All exported timestamps use ISO 8601 UTC; unset assignees and resolution timestamps are blank. Descriptions and notes are not included.

Files use UTF-8 with a BOM, quoted comma-separated fields, and CRLF record separators. Formula-like values, including leading whitespace/control variants, receive an apostrophe prefix to reduce spreadsheet formula execution when opened directly. Some viewers display this prefix; re-saving or transforming the file can change these protections.

## Data storage

Data is saved to `IncidentManagement.Api\Data\incidents.json`, relative to the API content root, not the shell's current directory. The file includes a schema version, the next incident number, incidents, and notes. Back it up before modifying it manually. Do not edit it while the API is running.

### Use a separate data file (optional)

Stop the backend first. In its terminal, set a different storage path and restart it from the project root. Replace the example path with a writable location on your computer, preferably outside a synced folder:

```powershell
$env:Storage__FilePath = "C:\path\to\incidents.json"
dotnet run --project .\IncidentManagement.Api --launch-profile http
```

Choose a new, writable path to start with no incidents, or an existing compatible file to load its records. The override applies to processes started from that terminal. After stopping the API, remove it before restarting with the default workspace store:

```powershell
Remove-Item Env:\Storage__FilePath
```

### How saving works

The API rereads the file for each operation and writes through a flushed temporary file before atomically replacing the original (swapping in the completed file rather than overwriting it in place). Windows file-lock/access errors during replacement receive four short, logged retries (750 ms total delay) to tolerate brief scanner/sync-client locks; persistent errors still fail explicitly. Invalid JSON, incomplete/incompatible schemas, and persistent storage access errors produce HTTP 500 and server logs; they are not treated as an empty store.

Each incident has a `version` number that changes when the record is updated, including when a note is added. Edits and deletes must supply the current version so they cannot silently overwrite a newer change. The browser interface handles this for you.

**Deployment limitation:** this is a local, single-API-process application. The lock coordinates requests within that process only. Do not run multiple API processes against the same file or deploy to a shared/network-synchronized file store. This workspace may reside in OneDrive; avoid running it on more than one synced computer at a time. Authentication and authorization are intentionally not included; do not expose this application publicly or use it for sensitive production data without adding access control, HTTPS, and an appropriate persistence layer.

## API reference (optional)

The **API** is the HTTP interface used by the frontend. This section is for calling it directly or developing another client; you can skip it when using only the browser interface.

With the backend running, you can read the incidents from PowerShell:

```powershell
Invoke-RestMethod http://localhost:5051/api/incidents
```

The base address for all endpoints below is `http://localhost:5051`. `{id}` and `{version}` are placeholders: replace them with values from an incident returned by the API.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Process health |
| GET | `/api/incidents` | List incidents (latest update first) |
| GET | `/api/incidents/{id}` | Incident details and notes |
| POST | `/api/incidents` | Create incident |
| PUT | `/api/incidents/{id}` | Edit incident; include current `version` |
| POST | `/api/incidents/{id}/notes` | Add a note |
| DELETE | `/api/incidents/{id}?version={version}` | Delete incident |

Example JSON request body for `POST /api/incidents` (sends a new incident to the backend):

```json
{
  "title": "VPN connection unavailable",
  "description": "Remote employees cannot connect to the VPN.",
  "priority": "High",
  "category": "Network",
  "reportedBy": "Alex",
  "assignedTo": "Network Team"
}
```

Statuses: `New`, `InProgress`, `OnHold`, `Resolved`, `Closed`. Priority: `Critical`, `High`, `Medium`, `Low`. Category: `Application`, `Hardware`, `Network`, `Security`, `Access`, `Other`. Update bodies use the same editable fields plus `status` and `version`. Notes accept `author` and `text`. Timestamps use UTC; the UI displays local time. Resolved and closed incidents are excluded from active counts.

### Validation and responses

Send request bodies as JSON with `Content-Type: application/json`. Incident route IDs are GUIDs, not display references such as `INC-00002`. Enum values are sent as strings; numeric enum values are rejected.

| Field | Validation |
|---|---|
| `title` | Required; 3-160 characters |
| `description` | Required; 5-10,000 characters |
| `priority`, `category` | Required; one of the values listed above |
| `reportedBy` | Required; up to 100 characters |
| `assignedTo` | Optional; up to 100 characters |
| `status` | Required for updates; one of the values listed above |
| `version` | Positive integer required for updates and deletes |
| Note `author` | Required; up to 100 characters |
| Note `text` | Required; up to 4,000 characters |

Text fields are trimmed before validation. Creating an incident sets its status to `New`. A `PUT` sends all editable fields, not a partial patch. Adding a note returns the updated incident and increments its version; it does not require a version in the request.

Successful reads, updates, and note additions return **200 OK**. Creation returns **201 Created** with the incident and a `Location` header; deletion returns **204 No Content**. Invalid requests return **400 Bad Request**, missing incidents return **404 Not Found**, and stale updates or deletes return **409 Conflict**. After a conflict, reload the incident and reconcile changes before retrying with its current version. Persistent storage failures return **500 Internal Server Error**.

## Build and test

Run these commands from the project root after installing the prerequisites and frontend dependencies. A **build** checks and prepares the code to run; **tests** automatically check expected behavior.

Build the backend first; the API tests run the resulting compiled application:

```powershell
dotnet build .\IncidentManagement.sln
```

If the build succeeds, run the API and frontend tests:

```powershell
node --test .\tests\api.test.mjs
node --test .\tests\incidentCsv.test.mjs .\tests\incidentModel.test.mjs .\tests\incidentService.test.mjs .\tests\theme.test.mjs
```

Build the frontend into `client\dist`:

```powershell
npm --prefix .\client run build
```

The integration suite starts its own API on an ephemeral localhost port with an isolated temporary file under `tests\.tmp`. It verifies CRUD, validation, concurrent writes, stale versions, notes, restart persistence, monotonic numbers, and corruption handling. It stops its API and removes its test data afterward, without modifying the workspace's actual incidents.

The frontend suites run without starting the API: CSV tests cover column order, UTC timestamps, empty optional values, row ordering, escaping, spreadsheet-formula protection, and empty exports; model tests check UI defaults, labels, and constants; service tests use mocked `fetch` to check the API client; theme tests check the light/dark palettes and color contrast.

## Serve the built UI from .NET (optional)

Use this local alternative if you want one backend process to serve both the API and the built frontend, rather than running the Vite development server. Stop the development servers first and run these commands from the project root after installing frontend dependencies:

```powershell
npm --prefix .\client run build
New-Item -ItemType Directory -Force .\IncidentManagement.Api\wwwroot
Copy-Item .\client\dist\* .\IncidentManagement.Api\wwwroot -Recurse -Force
dotnet run --project .\IncidentManagement.Api --launch-profile http
```

Then open **http://localhost:5051**. Rebuild and recopy the assets after frontend changes. For development, use the Vite server instead.
