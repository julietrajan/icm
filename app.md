# IncidentDesk application flow

IncidentDesk is a local incident-management application built with React 19,
Vite 7, and ASP.NET Core on .NET 10. The diagrams below describe the implemented
flow, including browser-only features, API validation, and JSON-file persistence.

**Color key:** blue = browser/UI, purple = API, amber = decisions/validation,
green = successful results/storage, red = errors, teal = browser-only features.

## 1. Application architecture

```mermaid
flowchart LR
    User(["User"])

    subgraph Browser["Browser: React application"]
        Boot["index.html<br/>Initial theme and main.jsx"]
        App["App.jsx<br/>Navigation, state, loading and mutations"]
        UI["Dashboard and incident table<br/>Forms, details and confirmation dialogs"]
        Local["About date and theme toggle<br/>Search, filters, sort and overdue indicators"]
        CSV["incidentCsv.js<br/>Download matching, sorted rows"]
        Client["incidentService.js<br/>fetch /api/incidents"]
        Boot --> App
        App <--> UI
        App --> Local
        App --> CSV
        App <--> Client
    end

    subgraph Hosting["HTTP hosting"]
        Vite["Development: Vite at 127.0.0.1:5173<br/>Proxy /api to localhost:5051"]
        Static["Optional built UI in wwwroot<br/>ASP.NET static files and index.html fallback"]
    end

    subgraph Backend["ASP.NET Core API"]
        Program["Program.cs<br/>Controllers, JSON string enums and exception handler"]
        Controller["IncidentsController<br/>CRUD and note endpoints"]
        Validation["Request models<br/>Trimmed text, required fields, enums and versions"]
        Service["Singleton IIncidentService<br/>JsonIncidentService"]
        Health["GET /api/health<br/>Process health only"]
        Program --> Controller
        Controller --> Validation --> Service
        Program --> Health
    end

    Store[("Data/incidents.json<br/>Schema version, next number, incidents and notes")]
    User --> Boot
    User --> UI
    Vite -.->|"serves frontend"| Boot
    Static -.->|"serves frontend"| Boot
    Client <-->|"development API requests/responses"| Vite
    Vite <--> Program
    Client <-->|"same-origin API when hosted by .NET"| Program
    Service <-->|"reread each operation; persist mutations"| Store

    classDef ui fill:#dbeafe,stroke:#2563eb,color:#172554,stroke-width:2px;
    classDef api fill:#ede9fe,stroke:#7c3aed,color:#3b0764,stroke-width:2px;
    classDef decision fill:#fef3c7,stroke:#d97706,color:#78350f,stroke-width:2px;
    classDef success fill:#dcfce7,stroke:#16a34a,color:#14532d,stroke-width:2px;
    classDef local fill:#ccfbf1,stroke:#0d9488,color:#134e4a,stroke-width:2px;
    class User,Boot,App,UI,Vite,Static ui;
    class Client,Program,Controller,Service api;
    class Validation decision;
    class Store,Health success;
    class Local,CSV local;
```

The storage path defaults to `Data/incidents.json` relative to the API content
root; `Storage__FilePath` can override it. There is no database, authentication,
or authorization. Use one API process per file: the semaphore does not coordinate
multiple processes. The health endpoint does not read or validate the store.

## 2. Navigation and user actions

```mermaid
flowchart TD
    Start(["Open application"]) --> Route{"Path is /about or /about/?"}
    Route -->|"yes"| About["About component<br/>GitHub Copilot Demo and local date"]
    Route -->|"no"| Load["Load incidents<br/>GET /api/incidents"]
    About -->|"navigate to incident views"| Load
    Load --> Loaded{"Request successful?"}
    Loaded -->|"no"| LoadError["Show error and Retry"]
    LoadError --> Load
    Loaded -->|"yes"| State["Store incidents in React state<br/>Reconcile selected incident on refresh"]
    State --> Dashboard["Counts: total, active, active critical,<br/>resolved and closed"]
    State --> Filter["Select all / active / resolved<br/>Search, status and priority filters, sort"]
    Filter --> Table["Display matching incidents<br/>Active incidents overdue after 24 hours"]

    Table -->|"Refresh"| Load
    Table -->|"Export CSV"| Export["Download filtered rows in displayed order<br/>No API request; excludes descriptions and notes"]
    Dashboard -->|"New incident"| Create["IncidentForm<br/>Required fields and browser validation"]
    Table -->|"open row"| Detail["IncidentDetail modal<br/>Uses selected incident from loaded state"]
    Detail -->|"Edit"| Edit["IncidentForm<br/>Editable fields, status and current version"]
    Detail -->|"Add note"| Note["Author and note text<br/>No request version required"]
    Detail -->|"Delete"| Confirm{"Confirm permanent deletion?"}
    Confirm -->|"cancel"| Detail
    Confirm -->|"confirm"| Delete["DELETE with current version"]
    Create -->|"POST incident"| Mutate["Run API mutation<br/>Busy state prevents duplicate UI actions"]
    Edit -->|"PUT incident"| Mutate
    Note -->|"POST note"| Mutate
    Delete --> Mutate
    Mutate --> Result{"Request successful?"}
    Result -->|"create / edit / note"| Updated["Replace or insert returned incident in state<br/>Select it, show detail and success notice"]
    Updated --> Detail
    Updated --> State
    Result -->|"delete"| Removed["Remove incident from state<br/>Close dialog and show success notice"]
    Removed --> State
    Result -->|"no"| Error["Keep dialog open and show error<br/>Includes validation and stale-version conflicts"]
    Error -->|"selected incident: Reload incident"| Reload["GET /api/incidents/id<br/>Replace selected record and show detail"]
    Reload -->|"success"| Detail
    Reload -->|"failure"| Error
    Error -->|"correct input or reconcile, then resubmit"| Mutate

    Start -.-> Theme["Initial theme from URL or system preference<br/>Header toggles light/dark without persistence"]
    Start -.-> Clock["One-minute browser timer<br/>Updates About date and overdue indicators only"]
    Clock -.-> About
    Clock -.-> Table

    classDef ui fill:#dbeafe,stroke:#2563eb,color:#172554,stroke-width:2px;
    classDef api fill:#ede9fe,stroke:#7c3aed,color:#3b0764,stroke-width:2px;
    classDef decision fill:#fef3c7,stroke:#d97706,color:#78350f,stroke-width:2px;
    classDef success fill:#dcfce7,stroke:#16a34a,color:#14532d,stroke-width:2px;
    classDef error fill:#fee2e2,stroke:#dc2626,color:#7f1d1d,stroke-width:2px;
    classDef local fill:#ccfbf1,stroke:#0d9488,color:#134e4a,stroke-width:2px;
    class Start,State,Dashboard,Table,Create,Detail,Edit,Note ui;
    class Load,Delete,Mutate,Reload api;
    class Route,Loaded,Confirm,Result decision;
    class Updated,Removed success;
    class LoadError,Error error;
    class About,Filter,Export,Theme,Clock local;
```

The dashboard uses all loaded incidents, not just filtered rows. Active means
`New`, `InProgress`, or `OnHold`; `Resolved` and `Closed` are inactive. List
loading occurs on entering an incident page and on explicit refresh, not on the
one-minute timer. CSV export is disabled while loading, during a mutation, or
when no rows match; it uses quoted UTF-8 CSV with a BOM and formula protection.

## 3. API, concurrency, and persistence

```mermaid
flowchart TD
    Request(["Incident API request"]) --> Valid{"Binding and validation pass?<br/>PUT/DELETE require positive version"}
    Valid -->|"no"| Bad["400 Bad Request"]
    Valid -->|"yes"| Gate["Acquire singleton service semaphore"]
    Gate --> Exists{"Storage file exists?"}
    Exists -->|"no"| Empty["Create empty in-memory store"]
    Exists -->|"yes"| Read["Read and deserialize JSON<br/>Check schema version, next number and incident list"]
    Read -->|"corrupt, incompatible or inaccessible"| Failure["Exception handler and server logs<br/>500 Internal Server Error"]
    Read -->|"valid"| Operation{"Requested operation"}
    Empty --> Operation

    Operation -->|"GET list or detail"| Lookup["List by latest update or find ID"]
    Lookup --> Found{"Record found?<br/>List always succeeds"}
    Found -->|"yes"| OK["200 OK"]
    Found -->|"no"| Missing["404 Not Found"]
    Operation -->|"POST incident"| Create["Allocate GUID and monotonic INC number<br/>Status New, version 1, UTC timestamps"]
    Operation -->|"PUT / POST note / DELETE"| Find{"Incident ID exists?"}
    Find -->|"no"| Missing
    Find -->|"yes"| Version{"PUT/DELETE version matches?<br/>Notes skip version check"}
    Version -->|"no"| Conflict["409 Conflict<br/>No changes saved"]
    Version -->|"yes / note"| Change["PUT: replace editable fields and increment version<br/>Note: append timestamped note and increment version<br/>DELETE: remove incident and notes"]
    Create --> Serialize["Serialize store to unique temporary file<br/>Flush stream and flush to disk"]
    Change --> Serialize
    Serialize --> Replace["Move temporary file over target<br/>Atomic replacement"]
    Serialize -->|"I/O failure"| Failure
    Replace --> Lock{"Transient Windows access/lock error?"}
    Lock -->|"yes, up to four retries"| Retry["Log warning and delay<br/>50, 100, 200, then 400 ms"]
    Retry --> Replace
    Lock -->|"persistent or other failure"| Failure
    Lock -->|"no error"| Saved[("Updated incidents.json")]
    Saved --> Response["POST: 201 Created and Location<br/>PUT/note: 200 with updated incident<br/>DELETE: 204 No Content"]

    OK --> Finish["Release semaphore in finally<br/>Clean up temporary file if created"]
    Missing --> Finish
    Conflict --> Finish
    Failure --> Finish
    Response --> Finish
    Bad --> Client["API client returns JSON or null for 204<br/>Non-success responses become UI errors"]
    Finish --> Client

    classDef ui fill:#dbeafe,stroke:#2563eb,color:#172554,stroke-width:2px;
    classDef api fill:#ede9fe,stroke:#7c3aed,color:#3b0764,stroke-width:2px;
    classDef decision fill:#fef3c7,stroke:#d97706,color:#78350f,stroke-width:2px;
    classDef success fill:#dcfce7,stroke:#16a34a,color:#14532d,stroke-width:2px;
    classDef error fill:#fee2e2,stroke:#dc2626,color:#7f1d1d,stroke-width:2px;
    class Request,Client ui;
    class Gate,Read,Lookup,Create,Change,Serialize,Replace,Finish api;
    class Valid,Exists,Operation,Found,Find,Version,Lock,Retry decision;
    class Empty,OK,Saved,Response success;
    class Bad,Missing,Conflict,Failure error;
```

Edits may choose any supported status; there is no enforced sequential status
workflow. Saving as `Resolved` or `Closed` preserves an existing `resolvedAt`
or sets it to the current UTC time. Saving an active status clears `resolvedAt`.
Adding notes updates `updatedAt` and `version`, but does not change status.
Stale edits/deletes fail rather than overwrite newer data.

## Source map

| Flow | Implementation |
| --- | --- |
| Boot, theme, and development proxy | `client/index.html`, `client/src/main.jsx`, `client/vite.config.js` |
| Navigation, dashboard, filtering, refresh, and mutations | `client/src/App.jsx` |
| Forms, details, dialogs, and About | `client/src/components/` |
| Status definitions and overdue calculation | `client/src/models/incident.js` |
| HTTP requests and CSV download | `client/src/services/incidentService.js`, `client/src/services/incidentCsv.js` |
| API setup, optional frontend hosting, and health | `IncidentManagement.Api/Program.cs` |
| Routes and HTTP responses | `IncidentManagement.Api/Controllers/IncidentsController.cs` |
| Request validation and storage entities | `IncidentManagement.Api/Models/Requests.cs`, `IncidentManagement.Api/Models/Incident.cs` |
| CRUD, versions, file locking, and atomic writes | `IncidentManagement.Api/Services/JsonIncidentService.cs` |
