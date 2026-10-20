# Home Tracker application audit — October 18, 2026

The application is not fully verified end to end. This audit found and fixed concrete wiring defects, scanned the entire local JavaScript/JSX source tree, traced the active frontend and server imports, inspected frontend/backend contracts, and performed read-only checks against the running home backend. No project build, service restart, database mutation, Mongo path change, or startup-script change was performed. Authentication implementation was preserved.

## Verification and evidence

- `node audit/audit-wiring.cjs`: 289 local JS/JSX files parsed; zero syntax errors, zero missing imports in the active frontend/server dependency trees, and zero unmatched static internal links. There are 46 missing imports in inactive/legacy files. This is a source dependency and literal-link scan, not proof that every render or dynamic link works.
- `node --test audit/data-flow.test.mjs`: five passing tests. Model queries are mocked; tests verify dashboard record mapping, retained update fields/reference IDs, empty-state response shape, attention-list membership, status filtering, and full item payload normalization. They do not prove persistence against MongoDB.
- `home-api-audit.json`: read-only GET response status/shape checks against port 6033. Core inventory, categories, home locations, tasks, business/reference, roles and assignment reads return HTTP 200.
- `live-data-counts.json`: running backend reads return 0 items, 19 categories, 12 home locations, and 0 tasks. No samples were inserted. The running dashboard has no `stats` property, matching the old stub still loaded in that process.
- `live-api-audit.json` records the initial checks against the misconfigured frontend target at port 3001; it is not the home backend. `backend-port-probes.json` records discovery of the home API.
- The process listening on 6033 was verified as `node E:\react-projects\ecosphere\home-tracker\backend\server.js`.
- Git status/diff was unavailable: Git returned `fatal: cannot change to 'E:/react-projects/ecosphere'`. No Git metadata was repaired or changed.

## Fixes made

| Area | Defect | Change |
| --- | --- | --- |
| Dev frontend API target | `.env` pointed at port 3001, whose home endpoints return 404; the actual home server runs on 6033 | Set only frontend `VITE_BACKEND_URL` to `http://localhost:6033`. Backend configuration/startup remains unchanged. |
| Dashboard API | Service always returned zero totals and empty arrays | Query HomeItem, HomeCategory, HomeLocation and Task; return existing summary fields plus the `stats`, attention lists, recent records and category costs consumed by the page. Keep category/location IDs alongside display labels so min/par saves retain references. |
| Dashboard mutations | Stock-level saves/deletes left totals, attention panels and chart data stale | Reload the dashboard response after successful mutations. Task read failures are surfaced; completed tasks are excluded from To Do. |
| Inventory locations | Form read `/api/locations` (business reference Location), while management saves `/api/home-locations` (HomeLocation) | Use `/api/home-locations` for the selector, matching the item model's reference. |
| Inventory reads | HTTP errors silently appeared as empty lists | Check response status for item and reference reads and show failures. |
| Inventory view state | Saving a record could leave it in a view it no longer matched; deleted items remained in shopping suggestions | Reload the current item view after saves; remove deleted records from suggestion state. |
| Add-item shortcut | React can reuse inventory component state between `/items` and `/items/add`, leaving Add closed | React to `startAdding` changes and initialize the form. |
| Shopping list | Server returned only explicitly marked items, while UI/dashboard also consider needed and zero-quantity items | Match all three conditions server-side. |
| Attention filters | Low-stock/expiry query silently overwrote explicit status filters; expiration today could disappear at midnight | Retain explicit status and use a UTC date boundary matching HTML date-only storage. |
| Category/location management | Failed reads silently looked empty | Validate HTTP status before replacing records. |
| Admin navigation | `/admin` rendered PermissionMatrix, and AdminDashboard received no current user | Wire `/admin` and `/admin/dashboard` to AdminDashboard with `user`. Existing permission page remains at `/permissions`. |
| Role/department management | Existing controllers/routes were never mounted | Mount `/api/users/permission-modules` and `/api/users/departments` before generic user-ID routes. Only route imports/mounts changed in server.js. |
| User management permission read | Effective-permissions endpoint requires both user and business, but frontend supplied only user | Supply the stored active business ID; show a clear error if none is selected. Permission resolution rules remain unchanged. |
| User role form | Submitted strings `admin`, `user`, `staff` to a controller/model requiring ObjectIds; populated edit values were objects | Load persisted role options, submit IDs, normalize populated IDs, and allow the existing nullable direct-role model. |
| Avatar upload | Form requested `/api/upload/avatar` but configured directory is `avatars` | Use `/api/upload/avatars`, matching static display and backend directory configuration. |
| Tasks | Load/save/edit/delete failures were console-only; reopening non-hourly times rounded them down | Surface errors and retain existing minute values as select options. |

Category cost charts sum the stored `cost` field using purchaseDate/createdAt for the date filter. They are not purchase-history accounting. Fridge/freezer food is included with pantry food; household remains separate. The source's generic Cost label does not establish a per-unit price, so costs are not multiplied by quantity.

## Active workflow coverage

| Workflow | Source trace and result | Live verification limit |
| --- | --- | --- |
| Inventory: all/pantry/fridge/freezer/household/expiry/low-stock/shopping | App routes → shared HomeInventoryPage → homeItem routes/controller → HomeItem → populated HomeCategory/HomeLocation; form fields name, brand, barcode, storageType, category, location, quantity, minimumQuantity, parLevel, unit, cost, purchaseDate, expirationDate, status, shoppingList and notes are represented in normalization/model/edit/display | GET works; no real create/update/delete performed |
| Categories and locations | Management form → respective home endpoint/controller/model; fields name/type/description/isActive agree | GET works; reference deletion integrity remains below |
| Dashboard | Route → dashboard controller/service → home models; response now matches page inputs | Running process still serves pre-change service; changed implementation tested with mocked queries |
| Tasks | Form → task routes/controller → Task; dueDate, status, priority, remindAt, message and description persist in schema | GET works; reminder delivery is not connected |
| Businesses, business types and app keys | Mounted CRUD endpoints, forms and models inspected; business theme/reference dependencies traced | Reference GETs work; saves and uploads not exercised |
| Footers, seasons, holidays, occasions, taglines and vendors | Routed pages/forms → mounted controllers → businessInfoConnection models; response shapes and form payloads inspected | Reference GETs work; optional-code indexes remain a concern below |
| Geographic/reference and receipt data | Route mounts/import chains and consuming business/user forms traced | GETs work; empty receipt arrays are valid. `/api/app-modules` has no root GET by design; defined endpoint is `/api/app-modules/app-key/:appKeyId`. |
| Users, profiles, role assignments and permissions | User/details models use default connection; roles/permissions/business/geographic data use businessInfoConnection. Explicit model population is used in user/detail controllers. User role and avatar fixes above | PermissionMatrix and some scope/auth issues remain below |
| Login/forgot/reset password | Login form/storage/navigation, auth controller, JWT generation, password model hooks, and reset page endpoints inspected | No real credential submission, reset token generation, account mutation or auth code changes |
| Public pages/navigation | Home, About, Contact, FAQ, Privacy, Terms and error routes; shared header/icons and static links inspected | No browser visual/interaction audit performed |
| Extra admin workflows | Equipment/hydroponics/diseases/pests/journal already route to shared WorkflowPreview | Existing previews clearly label samples as temporary and not saved; preserved |

## Remaining defects and risks

These remain open; the application should not be described as fully working.

1. **Password reset is broken across frontend/backend contracts.** ForgotPasswordPage expects `resetUrl`, but controller returns `resetToken`. ResetPasswordPage calls GET and POST `/api/users/reset-password/:token`; the server defines only POST `/api/users/reset-password` and expects token in the body. Preserve login/auth until validated using a dedicated test account and agreed reset behavior. The existing forgot handler also returns the raw token directly rather than delivering mail; no delivery behavior was invented.
2. **Legacy PermissionMatrix has no usable backend here.** `/permissions` requests `/api/users/permissions`, but its router is unmounted and imports a missing permissionController; the corresponding permission model is also missing. Current business-scoped role permissions and user overrides are separate implementations. Do not alias the old API to one of those models: matrix payloads omit business and their semantics differ. The existing Roles & Permissions page is the functioning source path after its missing mounts are loaded. Its user-override capabilities are not equivalent to the legacy matrix.
3. **Task reminders do not reach the scheduler.** Task saves store `remindAt`/`message` on Task and return `reminders:[]`. Cron only queries Reminder records requiring a user, channels and sendAt. There is no Task→Reminder bridge; the taskReminder router imports a missing controller. Delivery also needs recipient/channel design and verification before enabling external messages.
4. **API authorization/business scoping is incomplete.** Many mounted CRUD routes do not use protect/permission middleware; UI menu checks do not enforce access. Home reads have optional business filtering, while frontend home requests do not send business. Single-record update/delete lookups are not business-constrained. A local user can therefore see different scope rules between UI and API. No broad auth/scoping changes were made.
5. **Role visibility and effective permissions can disagree.** Navigation/AdminDashboard use direct role IDs/names and hardcoded IDs; effective permissions uses active role assignments plus overrides. Login returns the direct role ID and does not load assignments or a populated role. Preserve current login behavior until both paths are exercised with representative accounts.
6. **Reference deletion can orphan items.** HomeCategory/HomeLocation deletion does not check dependent HomeItems. Population then returns null and labels fall back to Uncategorized/Unassigned. Decide whether to block deletion, reassign dependents, or retain archival references before changing existing records.
7. **Optional code indexes need review against existing data.** Several reference schemas combine `code: ""` defaults with unique sparse code indexes. Empty strings participate in a sparse index, potentially rejecting multiple uncoded records. Index changes/migrations were not performed.
8. **Multi-step user saves can partially succeed.** UserForm creates user, details and links them in separate requests; failure after the first write leaves an account even though the UI reports failure. Retrying can hit duplicate username/email. No transaction behavior was added without database validation.
9. **Inactive modules are incomplete.** `static-audit.json` lists all 46 missing imports, including inventory/waste/purchasing model/service barrels, absent legacy permission/task-reminder controllers, ReminderForm, TaxRateForm, USDA assets and Orders CSS. Clients/events/orders/menu/reports/old inventory pages reference APIs not mounted in this app. None are currently imported by App's active dependency tree; preserved rather than guessed or deleted.
10. **Existing preview routes are not persistence implementations.** Equipment/hydroponics/diseases/pests/journal remain temporary scaffolds. This is clearly disclosed in those pages.
11. **General runtime reliability needs live interactions.** Some retained reference pages lack consistent HTTP-status/error handling, request cancellation and loading-state coordination. Task/record edits can race background filter requests. Inventory update normalization assumes full PUT payloads; partial external PUTs can reset omitted fields. Task completedAt is recalculated whenever a Done/Completed task is saved. These need targeted workflow checks rather than a broad rewrite.

## Applying and completing verification

The dev proxy environment change requires Vite to reload its configuration (restart the frontend dev process if it does not). The running backend must load updated source for the dashboard and new route mounts; this audit deliberately did not restart it because server startup/shutdown invokes Mongo script handling. Use the existing dev launcher and Mongo script workflow; Mongo data remains at the user's `E:\data\db` location and was not touched.

After the existing backend is reloaded, verify `/api/dashboard` includes stats and populated display lists, and the permission-module/department endpoints no longer fall through to `/api/users/:id`. With disposable records, test add/edit/reload/delete across categories, locations and each inventory view, including clearing optional fields, changing view membership and updating dashboard min/par. Test user creation/edit/avatar with an actual role ID and selected business. Verify login/reset/permissions separately with dedicated accounts. No live write or browser-flow pass has been claimed.
