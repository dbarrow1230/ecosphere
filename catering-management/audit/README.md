# Application wiring audit

Date: October 15, 2026 (America/New_York).

Status: Source wiring audit, live API reads, Vite module checks, and focused controller/schema checks completed. Full interactive browser workflows and real Mongo save/reload verification remain unverified. This is a microfrontend intended for a Windows Server 2022 deployment.

## Changes made

| Area | Finding | Fix |
| --- | --- | --- |
| Reference navigation | Existing CateringQuantityReference;.jsx had no import, route, or menu item. Wine Pairing also lacked a menu link. | Added Reference menu with Catering Quantities and Wine Pairing. Quantity page is at /reference/catering-quantities. Preserved the original page and filename. |
| Account navigation | Token-only sessions rendered user.username even when user was null. | Optional access with Account fallback; authentication decisions unchanged. |
| Operations navigation | Contracts did not activate its parent dropdown. | Included /contracts in active paths. |
| Permission APIs | Permission modules, business departments, and legacy permissions had implemented routers but no mounts. Requests could fall into /api/users/:id. | Mounted /api/users/permission-modules, /api/users/departments, and /api/users/permissions before the generic user router. |
| Password recovery | Forgot page expected resetUrl, controller returned resetToken. Reset page called GET/POST /api/users/reset-password/:token, which did not exist. | Constructed a same-origin frontend reset link from the existing token response; added token validation and parameterized reset routes. Retained POST /api/users/reset-password with token in its body. Existing hashing, expiry, password hashing hook, and token invalidation retained. |
| Reports | Date selector had no effect; week started at current time of day; last month excluded most of its final day. | Connected selector to summary table, corrected boundaries, and used calendar-date conversion for events. Added loading/error feedback. |
| Event dates | UTC-midnight event dates could display or load as the preceding date in Eastern time. | Reused calendarDate in Events and Orders. |
| Operations load failures | Clients, Events, Orders, Inventory, and Menu Manager could display a failed JSON request as an empty collection. | Check HTTP status before accepting list data and use existing alert handling. |
| Catering document retrieval | Catering order saves returned to the operational Orders list, which reads another collection. | Added /catering-orders list, new/view/edit routes, an Operations menu link, and matching form return/edit links. Existing /orders aliases and both collections were retained. |
| Recipe population | Live recipe, costing, and vendor-price GETs failed because Equipment/Ingredient schemas were not registered. | Imported the existing models from their controllers. No schema or database path changes. Added business-connection reference-registration assertions. |

## Evidence

- Inventoried 456 local JavaScript/JSX/CSS source files; all local JS/JSX parsed successfully. CSS is inventoried, not semantically validated.
- 73 frontend route declarations, including the catch-all, after the reference and catering list additions.
- No missing imports in the reachable local frontend/backend graph. Package export correctness and the external shared dependency graph are not proven by this check.
- Imported 68 mounted Express routers and verified their route handlers are functions without starting the backend or opening Mongo connections.
- Enumerated 296 endpoint paths. No unmatched literal API URL shapes in reachable local frontend files. This checks URL shapes, not every method, interpolated API base, request payload, or deployed gateway rewrite.
- Checked every statically declared dedicated operations form field against its Mongoose schema, including selects and checkboxes.
- Validated catering order and contract schema fixtures, including nested order lines.
- Exercised catering order document create/list/update/get with schema-validating persistence doubles, including preservation of menu lines and totals after an update.
- Exercised Client, Event, Inventory, and Menu create/update controllers using schema-validating persistence doubles. No real database writes; these do not prove actual Mongo connectivity, population, indexes, or reload behavior.
- Exercised reminder creation, partial updates, schedule recalculation, missing deletion, and invalid scheduling with mocked persistence.
- Exercised reset-token hashing, expiry query, invalid-token handling, both reset URL formats, and token cleanup with mocked persistence. Password hashing itself was inspected in the existing User save hook, not exercised against Mongo.
- Verified calendar-date conversion and the permission router mount order.
- Verified every schema reference in Recipe, RecipeCosting, and VendorIngredientPrice resolves to a model registered on the business connection.
- ESLint remains failing: 142 errors and 21 warnings across 90 files (original scan: 143 errors and 21 warnings). The new Catering Orders page has no lint findings. Findings include React state/effect/immutability issues and Node globals being checked with browser-only configuration. Detailed diagnostics are in eslint.json; lint cleanliness is not claimed.

## Live environment observations

After the user identified the main root, inspected E:/react-projects/ecosphere/app-runtime-config.json and the shell runtime implementation. The shell frontend uses 5174; catering uses frontend 5179 and backend 6005 on 127.0.0.1. The shell explicitly overrides the child frontend API/socket proxy and backend PORT. The child .env's localhost:3001 value does not control the shell-launched API proxy. Initial probes of 3001 reached the shell backend, so their catering 404s were not application failures.

Corrected read-only checks against 6005: 59 of 69 root GET probes returned 200. Unsupported /api/app and /api/app-modules root URLs and missing-parameter responses from effective-permissions and reminders are expected. Three permission mounts returned “Invalid user id” from the currently running, pre-edit backend. Three master endpoints returned 500 with explicit unregistered Equipment/Ingredient errors; source fixes were added and registration was verified offline. These backend fixes need a catering backend reload before live confirmation.

The shell frontend at 5174 and catering frontend at 5179 both responded. Vite returned JavaScript successfully for /src/App.jsx, /src/pages/admin/CateringOrders.jsx, and the exact /src/pages/CateringQuantityReference;.jsx import URL. Both new page URLs returned the SPA document. This confirms dev serving/transformation, not successful interactive rendering or every runtime export.

No frontend dev server was started, no process restarted, and no port configuration changed. live.json records the corrected backend status/count summaries without database records. The live audit script now resolves the backend from the parent runtime configuration.

## Remaining findings and decisions needed

1. **Deployment and full workflows:** Confirm the backend fixes after its normal reload and verify Mongo-backed create/edit/reload/delete workflows interactively. Shell runtime port/proxy ownership is established from source. No Windows Server/IIS configuration was supplied or changed. Current results cannot support an “everything works” certification.
2. **Dormant modules:** 19 missing local imports remain in files unreachable from the app entry points. These include absent beverage/return models, missing receiving and condition-scale controllers, missing AdminCatalogWorkspace.css, and stale model-barrel paths. There are 15 unmounted backend router files and 81 unreachable frontend JSX files, including study/mentoring/shopping forms and duplicates. wiring.json lists every path. They were preserved; inventing schemas or exposing unrelated features could alter existing data contracts.
3. **Authentication/authorization coverage:** The frontend ProtectedRoute checks stored user/token presence; it does not verify token validity or admin permissions. Many backend CRUD routers have no auth/permission middleware. Navigation also permits admin menu visibility based on a token. The shared host may supply additional controls; that boundary was not established. Authentication and permission enforcement were not broadly changed.
4. **Legacy permissions:** PermissionMatrix uses a legacy admin/user/staff string-role schema, while business role management uses ObjectId roles in the business database. PermissionMatrix is currently unreachable. The new mount restores its existing endpoint contract without migrating role data or merging permission systems.
5. **Two order systems:** /orders uses Order in orders; the new /catering-orders workflow uses CateringOrder in catering_orders. The standalone /catering-order page and retained /orders/new and /orders/:id aliases also use catering_orders. Catering document saves now return to their matching list. Dashboard and Reports still read operational orders. Whether catering documents should also count toward revenue needs a business decision; no automatic conversion, double-counting, or collection rewrite was introduced.
6. **Public menu presentation:** Menus.jsx retains its existing static example packages alongside the shared CulinaryWorkspace. Admin menu saves do not replace those static example cards. Whether these are intended marketing samples or should become a live public catalogue needs a product decision.
7. **Dashboard scope:** The controller passes business_id and locationRef but the service ignores them and queries all local Inventory/Menu/Event/Order records. Calendar-date Mongo queries also use local-time boundaries against UTC-midnight event dates. Confirm intended business scoping before changing query behavior. Dashboard filters currently filter category chart data, while summary cards remain the original month query.
8. **Login storage:** The active login form selects local versus session storage using Remember Me, but its parent callback writes both. The shared auth bridge also manages session synchronization. The behavior was traced but preserved pending verification with the microfrontend host.
9. **Scaffolding:** Reports still has a Top Category placeholder and transient Notes field. Inventory expiration flags have no actual expiry-date field in the current local schema; the dashboard's “expiringItems” payload represents upcoming events. These existing placeholders were preserved instead of inventing data semantics.
10. **Shared integration and Windows Server:** @shared and the culinary router live in the main root's shared directory, outside this workspace's write scope. The shell forwards auth with postMessage; the child bridge accepts only localhost/127.0.0.1 origins on port 5174. Runtime URLs also use 127.0.0.1. Those assumptions need review for remote Windows Server users; browser loopback points at the user's own machine. Existing business-scoped culinary guards and payload stripping were preserved. Shared/root source and Windows Server assets were read where relevant, not edited or comprehensively tested.

## Repeatable checks (no build)

```powershell
node scripts/audit-wiring.mjs
node scripts/audit-endpoints.mjs
node scripts/audit-checks.mjs
node scripts/audit-live.mjs
```

The live script uses GET requests against the catering backend port from the parent runtime configuration (6005), with localhost:3001 only as a standalone fallback. No build command, Mongo path change, Mongo startup script change, Windows service operation, data migration, real save/delete, or deployment was performed.
