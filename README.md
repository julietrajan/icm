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
- About page at `/about` with the "GitHub Copilot Demo" title and current local date.
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

Open a terminal and check that the required tools are available. These commands work in PowerShell, Bash, and zsh:

```powershell
dotnet --version
node --version
npm --version
```

The commands should print version numbers, including `10.x` for the .NET SDK and a compatible Node.js version. If a command is not recognized, install the tool and reopen your terminal.

## Run locally

The commands below are shown for **Windows PowerShell** and **Bash/zsh**. Start each terminal in the project root: the folder containing `IncidentManagement.sln`, `IncidentManagement.Api`, and `client`. Unless a step says otherwise, run commands from that folder on every platform.

### 1. Open the project folder

Clone the repository using Git, or download and extract its ZIP from GitHub. Open the resulting folder in your editor.

Open a terminal in the project root. In VS Code, use **Terminal > New Terminal**.

### 2. Start the backend (terminal 1)

```powershell
dotnet run --project .\IncidentManagement.Api --launch-profile http
```

```bash
dotnet run --project ./IncidentManagement.Api --launch-profile http
```

The first run restores .NET dependencies and builds the API, which may take a little longer. Wait for output showing that the service is listening on **http://localhost:5051**.

**Leave this terminal running.** It will not return to the command prompt while the backend is active.

### 3. Start the frontend (terminal 2)

Open a **second terminal in the project root**, keeping the first one running:

```powershell
npm --prefix .\client install
npm --prefix .\client run dev
```

```bash
npm --prefix ./client install
npm --prefix ./client run dev
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

Select **About** in the sidebar or open `/about` directly to see **GitHub Copilot Demo** and the current date in your browser's locale and time zone. The date updates once a minute while the page is open.

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

In Bash/zsh, use:

```bash
curl --fail http://localhost:5051/api/health
```

The response contains `status: healthy`. This checks only that the backend process is running; it does **not** check that the incident data file can be read or is ready. To check storage, request the data (for example, open `http://localhost:5051/api/incidents` while the API is running) and check for a successful response.

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
  about.test.mjs     About title, local date, and midnight rollover tests
  incidentModel.test.mjs Active-incident overdue behavior tests
```

## Export incidents

CSV is a text format that spreadsheet applications can open.

Select **Export CSV** beside **Refresh** to download the currently loaded incidents matching the selected view, search, and status/priority filters. Rows follow the displayed sort order. Export is disabled while loading, during a mutation, or when no incidents match; it does not refresh or change records.

Downloads are named `incidents-YYYY-MM-DD.csv` using the current UTC date. Columns are Reference, Title, Status, Priority, Category, Reporter, Assignee, Created At, Updated At, and Resolved At. All exported timestamps use ISO 8601 UTC; unset assignees and resolution timestamps are blank. Descriptions and notes are not included.

Files use UTF-8 with a BOM, quoted comma-separated fields, and CRLF record separators. Formula-like values, including leading whitespace/control variants, receive an apostrophe prefix to reduce spreadsheet formula execution when opened directly. Some viewers display this prefix; re-saving or transforming the file can change these protections.

## Data storage

Data is saved to `IncidentManagement.Api\Data\incidents.json`, relative to the API content root (`IncidentManagement.Api`), not the shell's current directory. This is true on Windows, Linux, and macOS, regardless of the terminal's working directory. `Storage__FilePath` can be an absolute path or a path relative to that same content root; prefer an absolute path for overrides. The file includes a schema version, the next incident number, incidents, and notes.

### Back up and restore safely

The API is the **sole writer** for a store. Stop it with **Ctrl+C** before copying, validating, restoring, or manually inspecting its file; never copy a changing store and assume the result is consistent. Keep backups in a separate, access-controlled location outside the repository and outside public or synced folders; on Windows, use a folder whose access-control list restricts access to authorized users. Backups contain incident content: do not commit them, upload them publicly, or leave them in a shared location. Process health (`/api/health`) is not storage readiness; check `/api/incidents` for a successful data read after starting or restoring.

From the project root, the default store is:

```text
IncidentManagement.Api/Data/incidents.json
```

For an override, use the actual value of `Storage__FilePath` instead. Make a timestamped backup only after stopping the API. Example commands follow; replace the example backup directory with a protected location you control.

PowerShell:

```powershell
$Store = (Resolve-Path .\IncidentManagement.Api\Data\incidents.json).Path
$BackupDir = "$HOME\IncidentDesk-backups"
New-Item -ItemType Directory -Force $BackupDir | Out-Null
$Backup = Join-Path $BackupDir ("incidents-" + (Get-Date -Format "yyyyMMdd-HHmmss") + ".json")
Copy-Item -LiteralPath $Store -Destination $Backup -NoClobber
$Data = Get-Content -LiteralPath $Backup -Raw | ConvertFrom-Json
if ($Data.schemaVersion -ne 1 -or $Data.nextIncidentNumber -lt 1 -or $null -eq $Data.incidents) { throw "Backup schema is invalid" }
foreach ($Incident in $Data.incidents) {
    if ([string]::IsNullOrWhiteSpace($Incident.id) -or [string]::IsNullOrWhiteSpace($Incident.number) -or $Incident.version -lt 1 -or $null -eq $Incident.notes) { throw "Backup incident data is incomplete" }
}
```

Bash/zsh:

```bash
store=./IncidentManagement.Api/Data/incidents.json
backup_dir="$HOME/IncidentDesk-backups"
mkdir -p "$backup_dir"
chmod 700 "$backup_dir"
backup="$backup_dir/incidents-$(date -u +%Y%m%dT%H%M%SZ)-$$.json"
cp -p "$store" "$backup"
chmod 600 "$backup"
node -e 'const s=JSON.parse(require("node:fs").readFileSync(process.argv[1],"utf8")); if(s.schemaVersion!==1 || !Number.isInteger(s.nextIncidentNumber) || s.nextIncidentNumber<1 || !Array.isArray(s.incidents) || s.incidents.some(i=>typeof i.id!=="string" || typeof i.number!=="string" || !Number.isInteger(i.version) || !Array.isArray(i.notes))) throw Error("Backup schema is invalid"); console.log(`Valid schema; ${s.incidents.length} incident(s), next number ${s.nextIncidentNumber}`)' "$backup"
```

The validation commands parse the backup and check its top-level schema and incident identity/version/note fields. If validation fails, do not use that copy as a recovery source. Keep multiple dated backups when possible.

If the store is corrupt or unreadable:

1. Stop the API and confirm no other API process is using this store.
2. Preserve the unreadable file unchanged in the protected backup location under a distinct name (for example, `incidents-corrupt-<timestamp>.json`). Do not delete it or overwrite it with an empty file.
3. Validate a known-good backup as above. If you have no valid backup, keep the API stopped and retain the original for investigation; do not let the app create a new empty store over it.
4. Copy the chosen backup to a temporary file beside the store, validate that copy, then replace the store. Only then restart the API. After restart, check `/api/incidents` for a successful read; `/api/health` alone is not sufficient.

PowerShell restore (set `$Backup` to the validated backup and `$Store` to the actual default or override path):

```powershell
$Corrupt = Join-Path (Split-Path -Parent $Backup) ("incidents-corrupt-" + (Get-Date -Format 'yyyyMMdd-HHmmss') + "-" + [guid]::NewGuid().ToString('N') + ".json")
Copy-Item -LiteralPath $Store -Destination $Corrupt -NoClobber
$RestoreTemp = "$Store.restore-$([guid]::NewGuid().ToString('N'))"
Copy-Item -LiteralPath $Backup -Destination $RestoreTemp
$Restored = Get-Content -LiteralPath $RestoreTemp -Raw | ConvertFrom-Json
if ($Restored.schemaVersion -ne 1 -or $Restored.nextIncidentNumber -lt 1 -or $null -eq $Restored.incidents) { throw "Backup schema is invalid; original store is unchanged" }
foreach ($Incident in $Restored.incidents) {
    if ([string]::IsNullOrWhiteSpace($Incident.id) -or [string]::IsNullOrWhiteSpace($Incident.number) -or $Incident.version -lt 1 -or $null -eq $Incident.notes) { throw "Backup incident data is incomplete; original store is unchanged" }
}
Move-Item -LiteralPath $RestoreTemp -Destination $Store -Force
```

Bash/zsh restore (set `store` and `backup` to the actual paths):

```bash
backup_dir="$(dirname "$backup")"
corrupt="$backup_dir/incidents-corrupt-$(date -u +%Y%m%dT%H%M%SZ)-$$.json"
cp -p "$store" "$corrupt"
restore_temp="$store.restore.$$"
cp -p "$backup" "$restore_temp"
node -e 'const s=JSON.parse(require("node:fs").readFileSync(process.argv[1],"utf8")); if(s.schemaVersion!==1 || !Number.isInteger(s.nextIncidentNumber) || s.nextIncidentNumber<1 || !Array.isArray(s.incidents)) throw Error("Backup schema is invalid")' "$restore_temp" &&
  mv -f "$restore_temp" "$store"
```

If validation fails, do not move the temporary file over the store. Keep both the original and the temporary/backup copies. The replacement commands are intended for local filesystems; retain the original until the restored store has been checked.

#### Verify the procedure with a disposable fixture

You can exercise the copy/validate/restore steps without touching real incidents. These examples create a temporary store with a fixed incident ID, note, version, and next-number value, back it up, simulate corruption, restore it, and compare the restored JSON exactly with the backup. They use only a temporary directory, never `IncidentManagement.Api/Data/incidents.json`.

Bash/zsh:

```bash
fixture_dir="$(mktemp -d)"
trap 'rm -rf "$fixture_dir"' EXIT
node --input-type=module - "$fixture_dir" <<'NODE'
import assert from 'node:assert/strict';
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const dir = process.argv[2];
const store = join(dir, 'fixture.json');
const backup = join(dir, 'fixture-backup.json');
const fixture = {
  schemaVersion: 1,
  nextIncidentNumber: 42,
  incidents: [{
    id: '11111111-1111-4111-8111-111111111111',
    number: 'INC-00041',
    version: 7,
    notes: [{ id: '22222222-2222-4222-8222-222222222222', author: 'Fixture', text: 'Keep this note', createdAt: '2026-01-01T00:00:00Z' }],
  }],
};
await writeFile(store, JSON.stringify(fixture, null, 2));
await copyFile(store, backup);
await writeFile(store, '{corrupt');
await copyFile(backup, store);
assert.deepEqual(JSON.parse(await readFile(store, 'utf8')), fixture);
assert.deepEqual(JSON.parse(await readFile(store, 'utf8')), JSON.parse(await readFile(backup, 'utf8')));
console.log('Fixture backup/restore passed: ID, note, version, and next number preserved.');
NODE
```

PowerShell:

```powershell
$FixtureDir = Join-Path ([System.IO.Path]::GetTempPath()) ("incidentdesk-fixture-" + [guid]::NewGuid())
New-Item -ItemType Directory $FixtureDir | Out-Null
try {
    @'
{"schemaVersion":1,"nextIncidentNumber":42,"incidents":[{"id":"11111111-1111-4111-8111-111111111111","number":"INC-00041","version":7,"notes":[{"id":"22222222-2222-4222-8222-222222222222","author":"Fixture","text":"Keep this note","createdAt":"2026-01-01T00:00:00Z"}]}]}
'@ | Set-Content -NoNewline -Path (Join-Path $FixtureDir "fixture.json")
    $Store = Join-Path $FixtureDir "fixture.json"
    $Backup = Join-Path $FixtureDir "fixture-backup.json"
    Copy-Item $Store $Backup
    Set-Content -NoNewline -Path $Store -Value "{corrupt"
    Copy-Item -Force $Backup $Store
    $Restored = Get-Content -Raw $Store | ConvertFrom-Json
    if ($Restored.schemaVersion -ne 1 -or $Restored.nextIncidentNumber -ne 42 -or $Restored.incidents[0].id -ne "11111111-1111-4111-8111-111111111111" -or $Restored.incidents[0].number -ne "INC-00041" -or $Restored.incidents[0].version -ne 7 -or $Restored.incidents[0].notes[0].id -ne "22222222-2222-4222-8222-222222222222" -or $Restored.incidents[0].notes[0].text -ne "Keep this note") { throw "Fixture restore did not preserve the expected data" }
    Write-Output "Fixture backup/restore passed: ID, note, version, and next number preserved."
}
finally {
    Remove-Item -Recurse -Force $FixtureDir
}
```

The fixture intentionally tests the file-copy recovery workflow, not API process recovery. It does not read or write the workspace store.

### Use a separate data file (optional)

Stop the backend first. In its terminal, set a different storage path and restart it from the project root. Replace the example path with a writable location on your computer, preferably outside a synced folder:

```powershell
$env:Storage__FilePath = "C:\path\to\incidents.json"
dotnet run --project .\IncidentManagement.Api --launch-profile http
```

```bash
mkdir -p "$HOME/incidentdesk-data"
export Storage__FilePath="$HOME/incidentdesk-data/incidents.json"
dotnet run --project ./IncidentManagement.Api --launch-profile http
```

Choose a new, writable path to start with no incidents, or an existing compatible file to load its records. The override applies to processes started from that terminal. After stopping the API, remove it before restarting with the default workspace store:

```powershell
Remove-Item Env:\Storage__FilePath
```

```bash
unset Storage__FilePath
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

Build the backend:

```powershell
dotnet build .\IncidentManagement.sln
```

```bash
dotnet build ./IncidentManagement.sln
```

Run the Node.js tests present in `tests/`:

```powershell
node --test .\tests\about.test.mjs .\tests\incidentModel.test.mjs
```

```bash
node --test ./tests/about.test.mjs ./tests/incidentModel.test.mjs
```

Build the frontend into `client\dist`:

```powershell
npm --prefix .\client run build
```

```bash
npm --prefix ./client run build
```

The tracked Node.js tests cover the About page and incident-model behavior. They do not start an API or access the workspace store.

## Serve the built UI from .NET (optional)

Use this local alternative if you want one backend process to serve both the API and the built frontend, rather than running the Vite development server. Stop the development servers first and run these commands from the project root after installing frontend dependencies:

```powershell
npm --prefix .\client run build
New-Item -ItemType Directory -Force .\IncidentManagement.Api\wwwroot
Copy-Item .\client\dist\* .\IncidentManagement.Api\wwwroot -Recurse -Force
dotnet run --project .\IncidentManagement.Api --launch-profile http
```

```bash
npm --prefix ./client run build
mkdir -p ./IncidentManagement.Api/wwwroot
cp -R ./client/dist/. ./IncidentManagement.Api/wwwroot/
dotnet run --project ./IncidentManagement.Api --launch-profile http
```

Then open **http://localhost:5051**. Rebuild and recopy the assets after frontend changes. For development, use the Vite server instead.
