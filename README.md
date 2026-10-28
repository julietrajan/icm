# Incident Management

A small incident-management demo consisting of an ASP.NET Core API and a React
web client. The API stores incidents in a local JSON file.

> **Security notice:** This is an unauthenticated demo, not a production-ready
> service. Anyone who can reach the API can read, create, change, and delete
> incidents. Do not expose it to the public internet or use it for sensitive
> operational or personal data.

## Project layout

- `IncidentManagement.Api/` — ASP.NET Core API, models, JSON storage, and the
  checked-in sample incident data.
- `client/` — React UI built and served in development with Vite.
- `IncidentManagement.sln` — .NET solution.
- `.vscode/tasks.json` — optional editor tasks; the paths there are
  Windows-specific. Use the commands below for cross-platform development.

## Prerequisites

- .NET 10 SDK (the API targets `net10.0`).
- Node.js 20.19+ or 22.12+ and npm 9+. These are the Node versions required by
  Vite 7; npm 10 is recommended.

Check the installed tools with `dotnet --version`, `node --version`, and
`npm --version`.

## Run locally

From the repository root, restore and run the API in one terminal:

```sh
dotnet restore IncidentManagement.sln
dotnet run --project IncidentManagement.Api --launch-profile http
```

The HTTP launch profile listens at `http://localhost:5051`. In another
terminal, install the UI dependencies and start the development server:

```sh
cd client
npm ci
npm run dev
```

Open <http://localhost:5173>. Vite binds to `127.0.0.1:5173` and proxies
requests under `/api` to `http://localhost:5051`. Keep the API running while
using the UI. The API also has an HTTPS launch profile on port 7177 for local
development; its development certificate may need to be trusted on your
machine.

To build the API and client:

```sh
dotnet build IncidentManagement.sln
cd client
npm ci
npm run build
```

The client bundle is written to `client/dist/`. The API serves static files
only when files are placed in `IncidentManagement.Api/wwwroot/`; building the
client does not automatically deploy it there.

Run the available .NET test command from the repository root:

```sh
dotnet test IncidentManagement.sln
```

There are currently no automated test projects in the solution and no `test`
script in `client/package.json`.

## API

All API request and response bodies use JSON with camel-cased property names.
Enum values are strings, not numbers. The API routes are:

| Method | Route | Behavior |
| --- | --- | --- |
| `GET` | `/api/incidents` | List incidents, most recently updated first. |
| `GET` | `/api/incidents/{id}` | Get an incident by its GUID. |
| `POST` | `/api/incidents` | Create an incident; returns `201 Created` and the new incident. |
| `PUT` | `/api/incidents/{id}` | Replace incident fields and status, subject to the version check. |
| `POST` | `/api/incidents/{id}/notes` | Add a note to an incident. |
| `DELETE` | `/api/incidents/{id}?version={version}` | Delete an incident if its version matches. |
| `GET` | `/health` | Health response: `200 OK` with `{"status":"healthy"}`. |
| `GET` | `/api/health` | Same health response under the API path. |

Incident create and update bodies contain `title`, `description`, `priority`,
`category`, `reportedBy`, and `assignedTo`. An update also requires `status`
and `version`. Titles must be 3–160 characters, descriptions 5–10,000,
`reportedBy` and `assignedTo` at most 100 characters, and values are trimmed.
`assignedTo` may be empty. Priority is `Critical`, `High`, `Medium`, or `Low`;
category is `Application`, `Hardware`, `Network`, `Security`, `Access`, or
`Other`. Status is `New`, `InProgress`, `OnHold`, `Resolved`, or `Closed`.
New incidents start with status `New` and version `1`.

Notes require an `author` (up to 100 characters) and `text` (up to 4,000
characters); both are trimmed. ASP.NET Core's automatic API validation returns
`400 Bad Request` for invalid request bodies. A missing incident returns
`404 Not Found`; a successful delete returns `204 No Content`. Deleting with a
missing or non-positive version returns `400 Bad Request`.

Updates and deletes use optimistic concurrency: the supplied `version` must
match the current incident version. A mismatch returns `409 Conflict` with a
message asking the client to refresh. Updating an incident or adding a note
increments its version, so clients should use the most recently returned
version for their next update or delete. The health routes report that the
process is responding; they do not check storage availability or provide
readiness guarantees.

## JSON storage and data handling

By default, the API reads and writes
`IncidentManagement.Api/Data/incidents.json`, relative to the API's content
root. This is also the checked-in sample data file, so API writes change the
working copy. To keep local changes out of that file, set the
`Storage__FilePath` environment variable before starting the API. Relative
paths are resolved from the API content root; parent directories are created
when the API saves data. For example:

```sh
# macOS/Linux, from the repository root
export Storage__FilePath="$HOME/.local/share/icm/incidents.json"
dotnet run --project IncidentManagement.Api --launch-profile http
```

```powershell
# Windows PowerShell, from the repository root
$env:Storage__FilePath = "$env:LOCALAPPDATA\ICM\incidents.json"
dotnet run --project IncidentManagement.Api --launch-profile http
```

The file contains the whole store, including incident notes. The API validates
the store schema version when loading it and fails on invalid or unsupported
data; keep backups of any file you care about. For a consistent backup or
restore, stop the API first. Copy the configured JSON file to a separate,
access-controlled location. To restore, keep a separate copy of the current
file, then replace the configured file with a valid backup before restarting
the API. Do not edit or replace the file while the API is running.

This storage implementation is intended only for local demos and light,
single-process use. It reads and rewrites the complete JSON file for
modifications, has no cross-process coordination, and does not provide the
concurrency, transactions, access controls, or operational guarantees of a
database. Do not run multiple API instances against the same file.

## Security and deployment limitations

The application has no authentication or authorization, and no production
deployment hardening. The API's create, update, note, and delete routes are
unauthenticated; health routes are also public. The development UI's localhost
binding and Vite proxy are for local use, not security boundaries. The
development HTTPS profile is not a production TLS configuration.

Before any non-local deployment, add and verify appropriate authentication,
authorization, TLS termination, input/data protections, backups, monitoring,
and production-grade persistent storage. Do not expose this demo directly to
untrusted networks or place sensitive incident information in it.
