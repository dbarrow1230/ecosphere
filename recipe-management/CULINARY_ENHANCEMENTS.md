# Culinary enhancements

Implemented directly in Recipe Management, Recipe Costing, Menus, Catering Management, and `shared/culinary`. The root frontend and unrelated applications were not edited. No dependencies or environment changes are required.

## Using the features

- Recipe Management: use the existing Ingredients tab to select an ingredient, a supplying vendor, and its product. The comparison includes every active offering for that ingredient and recipe business. Prices normalize measured whole packs to grams, milliliters, or each; incompatible dimensions require review. Ingredient, vendor, and business changes clear incompatible selections. Quantity changes recalculate selected-product costs.
- Recipe Management and Recipe Costing: open **Culinary costs, purchasing and allergen review** on the recipe/costing screen. Select a business where applicable. **Cost changes & price history** shows current versus saved ingredient costs, recipe totals, food-cost percentages, and historical pack and normalized price changes. Estimates do not update saved costings. Use the existing costing editor to accept changes.
- Menus: the culinary panel is available on the existing Menus and Menu Manager screens. Assign existing business recipes, servings per guest, and existing menu dishes. Direct recipe assignments supply the quantity when a dish references the same recipe; they are not counted twice. Unlinked dishes require review and block incomplete purchasing calculations.
- Catering Management: open the culinary panel on Menus or an Event form. Assign business menus and customer allergens to an existing event, compare purchasing, choose vendor products manually, and export consolidated CSV lists. Existing purchase-order and receiving workflows remain available and are not rewritten by the comparison. CSV lists are purchasing proposals; they do not submit purchase orders.
- Vendor delivery terms are stored on the existing vendor per business. Existing monetary minimums are honored. Confirm legacy quantity minimums and order multiples in whole packs before relying on a comparison. Availability is entered as whole available packs on the existing product forms; blank means unconfirmed.
- Existing inventory must be explicitly linked to a business and ingredient before it can be subtracted. Compatible units are converted, and committed stock is excluded. Inventory is never matched by an ambiguous name.
- **Allergen declarations & review** edits ingredient-wide and business-specific supplier-product declarations. The statuses are confirmed presence, possible cross-contact, verified absence, and unknown. Evidence, verifier, verification date, optional expiry, and historical declarations are retained. Existing manual recipe allergens and icons remain intact.
- Review a recipe against current declarations before recording verification. Missing supplier selections, missing or expired evidence, and unknown declarations prevent verification. Menus aggregate recipe assessments and flag unlinked dishes. Catering flags structured customer allergy conflicts and keeps free-text allergy notes for manual review. Explicit event snapshots preserve the assessment and its review-required status at that time.

## Data relationships and additions

Culinary recipes, ingredients, vendor offerings, costings, vendors, and allergen definitions use each app's existing `businessInfoConnection`. Menus, menu dishes, catering events, and catering inventory use the owning app's existing local database. The two menu apps have separate existing menu databases; no records are silently copied between them. Menus uses `menu_items`; Catering uses `menuitems`.

No new collections are introduced. Additive fields include:

- `vendor_ingredient_prices`: expanded `priceHistory` snapshots, `availablePacks`, `allergenInformation`, and `allergenHistory`.
- `ingredients`: `allergenInformation` and `allergenHistory`.
- `recipes`: selected vendor/product and cost snapshot fields on ingredient lines, `allergenReview`, and `allergenReviewHistory`.
- `recipe_costings`: ingredient price snapshots and append-only `costHistory`, including financial totals, pricing, business, recipe, and yield.
- Existing local `menus` / menu dishes: business and recipe assignments with servings per guest.
- Existing local `events`: business/menu assignments, structured customer allergens, and historical allergen snapshots. Quoted totals are preserved.
- Existing local `inventory`: explicit business and ingredient links.
- Existing `vendors`: `purchasingTermsByBusiness` for confirmed delivery costs and ordering constraints.

Price and costing updates use revision guards to avoid losing history during concurrent writes. Historical snapshots are protected from client overwrites. Recipe, costing, and product deletion paths archive those records so historical references are retained. Legacy costing selections are matched by ingredient and selected product, rather than array position. Recipe edits preserve existing labor, overhead, and pricing fields.

## Shared helpers and API

`shared/culinary/pricing.js` provides compatible measurement conversion, normalized offerings, selection clearing, and cost calculations. `vendorHistory.js` preserves price snapshots, validates selected business/product/ingredient relationships, and computes cost previews. `costingLifecycle.js` adds validated costing revisions to the existing Mongoose models, including Catering's verified shared costing API. `purchasing.js` consolidates ingredients, accounts for inventory and ordering constraints, compares vendor combinations, and produces CSV. `allergens.js` performs conservative assessments; `router.js` provides business-scoped `/api/culinary` endpoints through the owning app backends. The three adjacent JSX components extend existing Bootstrap interfaces.

Allergen review fingerprints include ingredient and product declarations, product identity, and recipe manual allergens. Changed inputs or expired verification invalidate previous reviews on reassessment. Absence of recorded allergens is never treated as evidence of safety.

## Migration and existing data

No destructive migration or mandatory bulk backfill is required. New fields are optional or default to unknown/unlinked. Existing recipes and financial records are not automatically repriced. Historical prices predating stored snapshots cannot be reconstructed. Older history entries without pack measurements display unknown normalized comparisons.

Populate missing pack measurements, inventory links, menu/event assignments, delivery terms, and verified allergen declarations through the new controls. Global ingredients remain shared; business-owned ingredient records and offerings are scoped to their business. Unmapped or unverified legacy records remain flagged until reviewed.

## Validation

- `npm run test:culinary`: 35 automated tests covering measurement conversion, business scoping, price/cost history, Mongoose save/update middleware, recipe creation/editing handlers, scaling controls, nutrition input policy and mocked USDA processing, purchasing constraints, menu/event links, and allergen review invalidation and snapshots.
- Production builds run for all four modified applications.
- 1,056 backend/shared JavaScript files passed syntax checks.
- `node tests/culinary-live-smoke.mjs`: temporary backend instances perform read-only health, cost-review, price-history, and allergen checks using the configured databases, then shut down. No live business records are changed by the test requests. The smoke check found 889 active recipes and 28 offerings in the tested business.

Interactive browser walkthroughs and a live USDA network call were not performed. Nutrition updates now run only from the explicit USDA update button. Recipe selection, saves, imports, and backend startup do not queue background nutrition work. Mocked USDA tests cover the manual request and failure paths. Existing Recipe Management CSS syntax warnings and large-bundle notices are outside this feature scope.

## Practical limits

The purchasing search examines up to 50,000 product combinations and clearly marks an incomplete search; it does not claim a global optimum when capped. Unknown vendor availability/delivery data remains flagged. Unresolved legacy quantity minimums or ordering multiples block a complete recommendation until confirmed. Cross-dimension conversion, such as flour volume to mass, requires explicit compatible measurements and is not guessed. Purchases, event quotations, and receiving records are never automatically updated from a current-price comparison.


