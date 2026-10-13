# Connected Recipe Management workflows

| Workflow | Connection |
| --- | --- |
| Vendor → products | Selected vendor shows its existing offers, scoped to Recipe Management. Category uses Vendor Categories, separately from recipe ingredient classifications. |
| Product → order | Product rows have Order; the vendor reference panel has New Order and Orders & Receiving. |
| Recipe → costing → ordering | Cost Recipe opens the selected recipe's costing. Order Ingredients prepares vendor pack quantities from its saved costing, rounded up to whole packs. |
| Menu → recipes → purchasing | Menu Planning assigns business recipes to existing menus and compares purchasing requirements with current stock. Create Order prepares a draft for the selected vendor. Menu records use the business database where the existing Menu Manager stores them. |
| Draft → processing | Drafts can be edited, submitted, approved, and marked sent. Email Order opens the user's mail composer. It does not send mail automatically. |
| Sent → receiving | Record accepted and rejected quantities, invoice number, lot, and expiry. Partial receipts keep outstanding quantities on the same order. Status changes cannot bypass receiving. |
| Receiving → stock | Each receipt commits atomically inside its order. Accepted quantities and stock are calculated from posted receipts, so retries cannot add stock twice and rejected quantities do not enter stock. This works on standalone MongoDB. |
| First order → location setup | Add Location and Add Type reuse the existing forms and select newly saved records. |
| Stock → menu purchasing | Received ingredient quantities use the same stock collection and base units as purchasing comparison. |

New ingredient orders keep their lines and posted receipt ledger together in the existing `purchase_orders` collection. Existing `purchase_order_lines`, `goods_receipts`, `goods_receipt_lines`, and `inventory` records remain supported. Stock combines existing balances with posted receipt contributions. Disconnected beverage-receiving and garden-inventory templates are not mounted as recipe workflows.

## Vendor reference and forms

- Narrow vendor list; compact reference details and operations.
- Email links open the user's mail client; vendor portals and phone numbers are links.
- Fractional ratings display as stars.
- Native select arrows remain visible, and shared selects pass accessibility attributes through.
- New vendor forms default to Recipe Management and have Cancel/Close controls. Editing an existing vendor preserves its business assignment.
- The vendor ingredient form uses a combined imperial/metric unit picker with manual entry, a centered vendor banner, and vendor-product categories.
- Product rows have hover, keyboard-focus, and selected states.

## Ingredient cleanup

Backed-up cleanup corrected 490 names without changing ingredient IDs, recipe quantities, or historical prices. Ninety-four section-label records were removed from the active ingredient catalog; labels in 18 recipes now store text and have no measurement, vendor, or cost fields. Labels are excluded from costing, purchasing, allergen inputs, and nutrition matching.

Nine vendor categories were derived from existing vendor category values, and 28 existing products were linked to the appropriate vendor category. The former behavior that copied recipe categories into Vendor Categories on access was removed.

There are 124 identified measurement-only names, such as `(1 cup)`, whose actual ingredient names cannot be inferred. They remain unchanged, with IDs listed in the cleanup report. Ingredient Catalog has a Needs name correction filter. Backups and reports are in `.local-backups`; no cleanup records were deleted.

## Verification

Focused checks cover status transitions, pack rounding/conversion, partial and rejected receiving, duplicate submission protection, atomic posting failure, label exclusion, form reuse, cancellation, units, vendor categories, and star/email rendering. An isolated backend returned successful read-only responses for vendor categories, ingredients, ordering options, orders, receipts, ingredient stock, and menu planning. The native database check used a uniquely named temporary database, confirmed posting failure leaves stock unchanged, and removed the test database afterward. No real orders, receipts, or stock entries were created. No full build was run.
