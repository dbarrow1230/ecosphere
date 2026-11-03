# Gardening Journal application review — October 12, 2026

## Scope and evidence

Reviewed the local frontend import graph, all 60 registered routes, navigation destinations, form implementations, growing-record models/controllers, dashboard aggregation and 107 registered API mounts. Initial scan: 211 local JavaScript/JSX modules, including 48 unreachable pages/forms. After consolidation and archival: 151 local modules, all reachable from the application entry point.

This is a source and build review. It does not establish correctness of live database contents, runtime permissions, or browser behavior. Shared business/admin pages imported from the sibling application remain shared; their source was not rewritten. Backend endpoints were inventoried, not deleted or migrated. No stored records were removed.

## Changes made

| Finding | Result |
| --- | --- |
| All Growing Runs loaded only plantings, omitted hydro runs, and defaulted to current-month starts. | Repurposed as Growing Run Register; combines both sources and defaults to the current year. Other years, months, days and All Dates remain selectable. One hydro system record counts as one run, not one per device or pod. |
| Repeated run summaries and an unsupported Daily Watering count. | Removed the duplicate introduction/count block. One summary reflects search, garden, status and date filters. Active counts exclude inactive and ended records. |
| Two places to start the same planting, with inconsistent garden-section handling. | New runs start in their garden workspace. The register handles cross-garden discovery and outcome updates. Hydro runs link to their existing device/pod workspace. |
| Garden run cards had no outcome update link and showed every status in green. | Added links to the selected run in the register and distinct ended/failure badges. |
| Garden Inventory and Supplies submitted the same schema to the same endpoint. | One Supplies form; legacy /admin/inventory redirects to /supplies. |
| Admin repeated Equipment, Hydro Systems, Diseases, Pests, Tasks and Journal from other menus. | Removed duplicate operational entries. Users/access and owner configuration remain under Admin. Fixed Hydro Systems menu highlighting. |
| Multiple URLs duplicated the same admin view. | /admin/dashboard redirects to /admin; /businesses redirects to /admin/businesses. |
| Journal Board overlapped the operational Dashboard and used fake fallback progress and hard-coded years. | Repurposed its presentation as Seasonal Review; current/data years and zero progress when records are absent. It remains the historical reports/photos/calendar view. |
| General Issues were disconnected from the dashboard health queue. | Include active, unresolved Issues records in dashboard health items and counts, alongside pest/disease logs. |
| Unreachable commerce, menu, order, purchase, receipt, wine-pairing, legacy reminders, duplicate user forms, and duplicate task forms remained under src. | Moved 48 unreachable pages/forms into a recoverable ZIP outside src. |
| Unused dashboard widgets/helpers, templates and the superseded Inventory module remained. | Archived 12 more unused modules. Current static scan reports zero unreachable local source modules. |

## Distinct functions retained

- Gardens own locations/sections and creation of runs; the register finds and updates runs across gardens.
- Seed/Plant Catalogs describe varieties and reference care; My Seed Collection tracks owned seed stock.
- Equipment is the device library; Hydro Systems manages actual runs, devices, pods and readings.
- Journal records activities and follow-up dates; Observations records measured conditions; Tasks manages scheduled work and reminders.
- Pest/Disease pages are reference catalogs; Issues records real health problems and now feeds the dashboard.
- Harvest records measured yields; Fertilizer records applications; Supplies tracks purchases and stock.
- Dashboard focuses on current attention and work; Seasonal Review summarizes historical progress, photos and timing.
- Shared business/owner/access settings and authentication routes remain available.

## Recovery and repeatable checks

- legacy-source-2026-10-12.zip: original paths/content of 48 archived pages/forms.
- unused-source-2026-10-12.zip: original paths/content of 12 remaining unused modules.
- reachability-2026-10-12.json: initial unreachable-module inventory.
- application-current.json: current route/API/import inventory, shared imports and scan limitations.
- npm run audit:application reruns the inventory.
- npm run test:growing-runs checks older and hydro runs, ended/inactive status counts, filter summaries and record keys.

## Validation and remaining limitations

Three growing-run tests passed. Changed feature modules passed targeted ESLint. Production build passed during this cleanup; final validation is recorded in the chat. Full source/backend lint found unrelated outstanding errors and warnings; details are saved in lint-2026-10-12.json. App.jsx has existing authentication-effect lint findings; these were not hidden or disabled as part of this change. Vite also reports its large-bundle warning.

Archived files can be restored using their original relative paths from the ZIPs. Reachability is based on static imports and registered routes; it is not a declaration that a business feature should never be reintroduced.

## Complete route inventory

| Route | Page or redirect |
| --- | --- |
| / | Home |
| /contact | ContactUs |
| /faq | FAQ |
| /privacy | Privacy |
| /terms | TermsOfService |
| /about | About |
| /dashboard | Dashboard |
| /journalboard | GardeningJournalBoard |
| /hydroponics | HydroSystemsPage |
| /equipment | EquipmentPage |
| /journal | JournalPage |
| /plantings | PlantingsPage |
| /gardens | GardensPage |
| /gardens/:id | GardenWorkspacePage |
| /supplies | SuppliesPage |
| /observations | ObservationsPage |
| /fertilizer-applications | FertilizerApplicationsPage |
| /issues | IssuesPage |
| /harvest | HarvestPage |
| /pests | PestsPage |
| /tasks | TasksPage |
| /seeds/form | SeedForm |
| /hardiness-zones | USDAZonesReference |
| /hydroponic-companion-planting | HydroponicCompanionPlantingPage |
| /diseases | DiseasesPage |
| /seeds | SeedPage |
| /seed-collections | SeedCollectionsPage |
| /plants | PlantPage |
| /vendors/equipment | EquipmentVendor |
| /vendors/seeds | SeedVendor |
| /vendors/supplies | SupplyVendor |
| /users | Users |
| /login | Login |
| /forgot-password | ForgotPasswordPage |
| /reset-password/:token | ResetPasswordPage |
| /profile | UserProfilePage |
| /businesses | Redirect to /admin/businesses |
| /admin | AdminDashboard |
| /admin/dashboard | Redirect to /admin |
| /admin/businesses | Businesses |
| /admin/business-types | BusinessTypes |
| /admin/app-keys | AppKeys |
| /admin/tax-rates | TaxRatesPage |
| /admin/footers | Footers |
| /admin/seasons | Seasons |
| /admin/holidays | Holidays |
| /admin/occasions | Occasions |
| /admin/taglines | Taglines |
| /admin/vendors | Vendors |
| /admin/business-roles-permissions | BusinessRolesPermissionsPage |
| /admin/inventory | Redirect to /supplies |
| /400 | Error400 |
| /401 | Error401 |
| /403 | Error403 |
| /404 | Error404 |
| /500 | Error500 |
| /502 | Error502 |
| /503 | Error503 |
| /504 | Error504 |
| * | Error404 |
