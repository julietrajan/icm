# Automatic Severity Classification Design

## Feature

Automatically classify new incidents into one of four severity levels using
the incident description and its business impact:

| Severity | Label |
| --- | --- |
| P1 | Critical |
| P2 | High |
| P3 | Medium |
| P4 | Low |

This design addresses issue #11. The repository currently has a manually
selected `priority` (`Critical`, `High`, `Medium`, `Low`); severity is a
separate classification and must not silently change the meaning or existing
behavior of priority.

## Functional Requirements

- On incident creation, the server assigns a severity from the description
  and business-impact information.
- The only severity values returned and persisted for classified incidents
  are `P1`, `P2`, `P3`, and `P4`, represented as JSON strings.
- The client displays the severity and its label. It does not choose or submit
  the authoritative severity.
- Reclassify an incident when its description or business-impact information
  changes. Changes to unrelated fields must not change its classification.
- Keep the existing priority field, its options, and its behavior unchanged.
- Continue to read existing JSON incident records that do not have a severity.
  Such records remain unclassified until updated; they must not be assigned an
  invented historical severity during deserialization.
- Preserve existing create, edit, list, detail, note, delete, storage, and
  concurrency behavior.

## Proposed Design

### Classification and API

- Add an `IncidentSeverity` enum with string JSON values `P1` through `P4`,
  and a nullable `Severity` property on `Incident`. Nullable storage permits
  existing JSON records to load without a migration; every newly created
  incident receives a non-null severity from the classifier.
- Add a `BusinessImpact` text field to incident data and request models. Trim
  it and cap it at 2,000 characters. Add an impact field to the create and
  edit forms and include it in the create/update request and incident
  response. The API may accept an omitted or empty impact for compatibility
  with existing clients; the UI should request it for newly entered
  incidents.
- Add a deterministic, side-effect-free classifier service and inject it into
  `JsonIncidentService`. It considers the description and business impact;
  it does not call an external model or send incident text outside the
  application.
- Apply classification in `CreateAsync`. In `UpdateAsync`, recompute it only
  when the description or business impact changes; leave severity unchanged
  for changes to status, priority, assignee, or reporter. Do not accept
  client-supplied severity as an override.
- Keep existing `Priority` request validation and persistence unchanged.
  Since severity is not part of the current optimistic-concurrency workflow,
  classification on update must continue to increment the incident version
  exactly once, as it does today.
- Expose the nullable `severity` and `businessImpact` fields in the existing
  incident JSON responses; no new route is needed. A create response remains
  `201 Created` and includes the assigned severity.
- Display a classified severity using both its code and label (for example,
  `P1 — Critical`) in the incident list and detail view. For legacy records
  with no severity, display `Unclassified`; do not present a default as if it
  were a classification.

### Recommended initial classification rubric

The issue does not define the boundaries between levels. Use this deterministic
rubric as the initial implementation assumption, considering both provided
texts and assigning the highest applicable severity (P1 before P2, then P3,
then P4):

- **P1 — Critical:** a critical business service or organization-wide
  operation is unavailable; there is significant data loss/corruption; or
  there is an active security incident with significant exposure.
- **P2 — High:** a major business function or customer-facing service is
  materially degraded, multiple teams or a major customer segment are
  affected, and no reasonable workaround is available.
- **P3 — Medium:** a limited group or function is affected, or a reasonable
  workaround exists, with material but contained disruption.
- **P4 — Low:** impact is localized and minor, with negligible business
  disruption; this includes cosmetic issues and routine service requests.

Implement the rubric with explicit, documented, deterministic rules (not a
third-party or generative classifier). If the impact is omitted or the
available text does not establish a higher impact, classify as P3. The
classifier must be case-insensitive and treat blank text as absent. The
classifier must not treat untrusted incident text as executable instructions
or perform actions based on it.

### Assumptions and unresolved product decisions

Issue #11 does not specify a classification algorithm, definitions for P1–P4,
whether severity replaces priority, or how legacy incidents should be handled.
This design recommends keeping priority separate, using the rubric above,
allowing legacy records to remain unclassified, and classifying only new or
subsequently edited incidents. Confirm these choices before implementation if
the product owner intends different severity definitions, historical
backfill, user overrides, or automatic changes to priority. The rubric is a
starting policy, not a claim that free text can establish impact reliably in
every case.

## Components Affected

- `IncidentManagement.Api/Models/Incident.cs`: severity enum and nullable
  severity plus business-impact data.
- `IncidentManagement.Api/Models/Requests.cs`: business-impact request field
  and validation; do not make severity client-writable.
- `IncidentManagement.Api/Services/`: classifier abstraction/implementation
  and dependency registration; invoke it during create and relevant updates
  in `JsonIncidentService`.
- `IncidentManagement.Api/Program.cs`: register the classifier if it is
  dependency-injected.
- `client/src/models/incident.js`: severity options/labels and empty-form
  defaults.
- `client/src/components/IncidentForm.jsx`: collect business impact and
  include it in submissions.
- `client/src/components/IncidentDetail.jsx` and `client/src/App.jsx`: show
  severity in the detail and incident list; keep current priority display,
  filtering, and sorting behavior.
- `client/src/styles.css`: severity presentation, reusing existing badge and
  priority visual patterns where appropriate.
- A new .NET test project and `IncidentManagement.sln` registration: the
  repository currently has no automated test project.
- `README.md`: document severity assignment, the business-impact field, and
  the API request/response change.

Do not change the JSON store schema version solely for these additive fields.
Verify that absent severity and business-impact properties deserialize
successfully from existing `Data/incidents.json` records.

## Validation Rules

- Validate and trim business-impact text on the server; enforce the 2,000
  character maximum. Empty or omitted impact is allowed for compatibility and
  follows the P3 fallback unless the description clearly meets a higher
  rubric level.
- Severity is generated on the server and is restricted by its enum to the
  four JSON string values `P1`, `P2`, `P3`, and `P4`. Do not add severity to
  create/update request models; a client-provided field must not override the
  classifier.
- Classification must be deterministic for the same normalized inputs and
  must not change priority, status, timestamps, version, or notes except for
  the existing create/update behavior.
- Treat incident description and business impact as untrusted plain text.
  Do not execute, evaluate, or transmit either value to an external service.

## Acceptance Criteria

- Creating an incident returns and persists one of `P1`, `P2`, `P3`, or `P4`
  based on its description and business impact.
- The create and edit UI collect business impact, and list/detail views show
  the severity code and human-readable label.
- Editing description or business impact reclassifies the incident; editing
  unrelated fields preserves the classification.
- Priority remains independently editable and retains all current behavior.
- Existing records without severity load and remain usable; they display as
  `Unclassified` until their classification inputs are updated.
- Existing API routes and incident workflows continue to work, with no change
  to the `priority` enum or semantics.
- Unit tests cover the classification logic as requested in issue #11.

## Testing Requirements

- Unit-test each rubric level, including cases where description and business
  impact jointly determine the result and where a higher level takes
  precedence.
- Test case-insensitive matching, whitespace normalization, missing/blank
  impact fallback, and deterministic results.
- Test service behavior: create assigns and persists severity; updates to
  description/impact reclassify; updates to unrelated fields preserve
  severity; client input cannot override the result.
- Test model/API validation for the impact length limit and string severity
  serialization; verify a client-provided severity cannot override the
  server-computed value.
- Test deserialization and subsequent reads of existing JSON data with no
  `severity` or `businessImpact` property.
- Run `dotnet test IncidentManagement.sln` and `npm run build` from `client`.
- Manually verify create, edit, list, detail, priority behavior, and legacy
  record display in the UI.
