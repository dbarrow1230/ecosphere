# Hydroponic history implementation

Status: source implementation and focused verification completed November 3, 2026. Live browser interaction and the native print/PDF dialog have not been exercised because the application services were not listening; no services were started or restarted. No project build was run.

## Existing functionality assessed and reused

The existing `HydroSystem` model already represents a planting run and its devices and pods in `hydro_systems`. Its existing controller and routes handle run/device metadata and pod layouts. The hydro page already supports dragging seeds onto pod positions. `JournalEntry` already supports notes, observations, follow-up readings, run/device references, and position references. The dashboard already uses React Bootstrap tables, Recharts, and saved data. The installed `react-to-print` package supplies printing.

The original implementation did not retain independent pod planting identities, seed quantities, germination results/deadlines, movement history, retry links, or past device readings. Removing a pod cleared its assignment; deleting a run permanently deleted the run. Position-only journal associations could not distinguish successive attempts at one position.

## Requirements and resulting behavior

| Requirement | Implementation |
|---|---|
| Drag-and-drop planting | The existing seed tray and pod layout remain. Dropping a seed into an empty position requests the seed quantity and planting date before saving an attempt. |
| Drag-and-drop repositioning | A planted pod is draggable. Dropping it into an empty position moves the same planting ID, including across devices in the same run. Occupied or out-of-layout destinations are rejected by the backend. Previous device, position, new position and movement time are retained. |
| Germination deadlines | Planting date plus the attempt's recorded maximum germination days determines its deadline. Overdue is calculated, never stored as a confirmed failure. The UI refreshes this calculation every minute. |
| Confirmed results | Mark Germinated records a success time. No Germination appears for overdue, unresolved active attempts and requires confirmation. The server enforces eligibility. A repeated failure confirmation retains the original timestamp. |
| Failed pod removal | Failed attempts retain their seed, quantity, dates, notes and history, but leave the active layout. Their positions become available for new attempts. |
| Seed quantities | New attempts require positive integer quantities. Existing unrecorded quantities remain null. Moving or failing an attempt does not alter its original quantity. |
| Notes and observations | Existing journal functionality is reused. A stable `hydroPod` reference identifies the planting attempt independently of its position. Existing associations cannot be reassigned; notes remain editable after movement. Legacy ambiguous position-only links stay explicitly run-level rather than being guessed. |
| Retry list | Confirmed failures without a subsequent linked attempt appear in the retry list, with the original run, planting, dates, quantity and access to its summary. Dragging one into a different run creates a new attempt with an independently entered quantity. |
| Retry chains | The new attempt stores `retryOf` and `retryRun`. The original failed record remains unchanged. Reverse links and retry availability are calculated from retained attempt links across all runs. Further failures can form further retry attempts. |
| Run completion | Complete Run replaces permanent deletion in the existing endpoint/UI. Completion retains devices, plantings, notes, readings and retry links; completed runs reject planting and metadata mutations. Historical notes use the existing journal operations. |
| Environmental history | Dated device readings are retained when readings change. Existing journal follow-up measurements also appear in reports. Missing dates and measurements remain unrecorded. Device reading inputs preserve time precision. |
| Historical compatibility | Legacy pod identities are reproducible across reads and saved through normal edits. Hydration does not assign invented quantities, outcomes or event times, and does not write records on reads. New attempts snapshot the planted item name and maximum germination period. |
| Dashboard reports | The existing dashboard and hydro page expose all ten requested reports: run summary, germination, seed quantities, conditions, cycles, pairings, positioning, failures, retries, and notes/observations. |
| Filters | Reports support multiple runs, run-start dates, seed identity, germination result, recorded pH and recorded temperature bounds. Reports identify underlying run and planting IDs. |
| Research integrity | Success percentages use confirmed pod outcomes, not numbers of seeds. Missing values remain unrecorded. Pairings identify co-recorded items without claiming a causal effect. Recorded values, calculated comparisons and observations are labelled separately. |
| Printing/PDF | The actual report component is passed to the existing `react-to-print` utility. Print / Save as PDF opens the browser print flow. A dedicated print-only stylesheet scopes landscape pages and wrapping to these reports; it adds no palette or screen-layout overrides. |

## Standalone MongoDB consistency

The configured MongoDB server supports normal reads and writes. Cross-document transactions are not required by this implementation.

Each retry is committed as one target-run document containing the planting and its source link. An internal `retryClaims` index projection is derived from retained pod links during model validation. The unique partial index `unique_hydro_retry_source` rejects attempts to retry the same failed planting in competing runs. Validation rejects duplicate retry sources within one run. The index was installed and verified on the existing `hydro_systems` collection; no planting records were inserted, changed or deleted by this setup step.

Ordinary pod operations use Mongoose optimistic concurrency. Conflicting saves return HTTP 409. A rejected movement or retry does not change persisted history. The retry controller verifies the unique index before saving, so index installation failure prevents the retry rather than permitting an inconsistent write. There is no separate retry collection or external coordination service.

## Files changed for these requirements

- Models: `backend/models/hydroponics/hydroSystemModel.js`, `backend/models/journal/journalEntryModel.js`.
- Controllers: `backend/controllers/hydroponics/hydroSystemController.js`, `backend/controllers/journal/journalEntryController.js`.
- Routes: `backend/routes/hydroponics/hydroSystemRoutes.js`.
- State/history and report preparation: `backend/services/hydroHistory.js`, `backend/services/hydroReports.js`, `src/utils/hydroHistory.js`, `src/utils/hydroReportTables.js`.
- Frontend: `src/pages/hydroponics/HydroSystemsPage.jsx`, `src/pages/journal/JournalPage.jsx`, `src/pages/dashboard.jsx`, `src/components/dashboard/HydroHistoryReports.jsx`.
- Print presentation: `src/components/dashboard/hydroHistoryReports.css`.
- Tests: `tests/hydroHistory.test.mjs`, `tests/hydroHistoryController.test.mjs`, `tests/hydroJournalLinks.test.mjs`, `tests/hydroReportTables.test.mjs`, `tests/hydroReportPrint.test.mjs`, and the test-only `tests/jsx-loader.mjs`.

## Verification and practical limits

Final result: 58 tests passed, zero failures. Targeted ESLint checks passed for the modified models, controllers, route, services, utilities and frontend components.

Tests cover positive seed quantities; exact deadline boundaries; overdue versus confirmed failure; invalid transitions; failed attempt retention; position reuse; occupied/out-of-bounds movement; movement history; retry chains; independent quantities; original-run immutability; duplicate retries within and across runs; failed-save retention; stale versions; concurrent Mongoose saves; stable legacy identities; journal links after movement; recorded environmental history; all ten report datasets; and server rendering of the actual printable React component.

The focused JSX test loader transforms test imports in memory only. It creates no application bundle, production files, server or build output.

The backend and frontend changes require the user's normal service startup before live use. Live drag-and-drop, browser rendering, physical printing and saving an actual PDF remain unverified in this stopped-service session. The printable report component and its data were tested without starting services.

Existing missing historical measurements and outcomes cannot be recovered by new code and remain labelled unrecorded. No historical failures or retry relationships were inferred from the seed catalogue or unrelated plant records.
