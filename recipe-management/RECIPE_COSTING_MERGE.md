# Recipe Costing merged into Recipe Management

Recipe Management owns the combined user-facing workflow. Its vendor and vendor ingredient forms remain authoritative. Existing database collections and record IDs are unchanged; this merge does not migrate or delete records.

| Area | Combined implementation |
| --- | --- |
| Recipes | Existing recipe detail/editor, nutrition, HACCP, scaling, and imports retained. Cost Recipe opens `/recipe-costings?recipe=ID` in the same application, in a new tab. |
| Costing | Costing editor, saved costings, vendor comparison, unit conversion, pricing targets, actual profit, cost history, and archive action at `/recipe-costings`. |
| Formulas | Existing costing formula reference at `/costing-formula`. |
| Ingredients | Existing vendor ingredient workflow at `/ingredients`; shared catalog, search, pricing filter, pagination, and ingredient editing at `/ingredient-records`. Ingredient grouping respects business boundaries. |
| Vendor prices | Both catalog and costing open the same `IngredientForm.jsx` used by Recipe Management. The surrounding costing modal selects a vendor and opens Recipe Management's existing `VendorForm.jsx` to create one. |
| Ingredient context | Business, category, legacy ingredient name, and costing flag supported alongside Recipe Management's units, notes, and allergen records. Partial edits preserve existing context. Linked ingredient deletion is refused. |
| Menus | Recipe Management's existing functional MenuManager retained; Recipe Costing's placeholder is not copied. |
| Navigation | Recipe Costing and Costing Formulas added. Existing categories, cuisines, meal types, menus, contacts, and recipes reused. Admin menus/forms are not merged. |
| Dashboard | Components stay under `src/components/dashboard`. Existing cost charts, stats, filters, and recipe panels retained; costing coverage and recent costings added through `CostingOverviewPanel.jsx`; quick actions include costing, formulas, and the ingredient catalog. |

## Dashboard comparison

The source dashboards have identical cost charts, stats, filters, section, error, insights, visual board, chart utilities, and legacy card components. Those implementations are reused, not duplicated.

- `LowStockPanel` already represented recipes to review: merged into the existing `RecipeReviewPanel`.
- `ExpiringItemsPanel` already represented prep items: merged into `PrepPlanningPanel`.
- `RecentItemsPanel` already represented recent recipes: merged into `RecentRecipesPanel`.
- `ShoppingListPanel` already represented missing recipe details: merged into `MissingRecipeDataPanel`.
- Recipe Management's more accessible Quick Actions drawer is retained and extended.

## Compatibility

The Ecosphere Recipe Costing launcher redirects to Recipe Management with its requested application path. The duplicate launcher card is hidden. Old user-facing Recipe Costing modules re-export the combined implementations, so those features no longer have two independently maintained versions. The old application's backend/admin files remain available and are not removed.

Costing and worksheet tabs now share Recipe Management's origin and tab session. The temporary cross-application authentication handoff is no longer needed.

## Validation

Focused checks cover vendor creation/selection, authoritative form reuse, vendor-price API response handling, converted ingredient costs, selling-price overrides and losses, business-scoped dashboard coverage, preserved ingredient context, linked-record deletion protection, and same-origin tab links. Changed JSX modules compile. Read-only checks against the restarted Recipe Management backend confirm costings, ingredients, vendors, categories, and units respond successfully. No full application build was run.
