# Existing herbs_spices database

Verified from the live database on 2026-11-02. Its original collections are `herbs`, `spices`, `vendors`, `equipment`, `kitchen_equipment`, `equipment_vendors`, `category`, and `types`.

The existing unique indexes, in addition to `_id`, are:

| Collection | Unique field |
| --- | --- |
| vendors | email |
| equipment | equipment_id |
| equipment_vendors | vendor_name |
| category | name |
| types | name |

The original eight collections have zero documents and no collection validators. MongoDB does not contain the lost Mongoose source, and field types and other original fields cannot be recovered from those empty collections. Their models therefore preserve arbitrary fields and the verified index definitions without imposing guessed field types, defaults, or automatic index changes.

The new `blends`, `orders`, and `inventory_ledger` collections belong to the recreated application; they are not recovered historical schemas. The shared business, user, and location models are the actual files copied from the existing Eco Sphere sub-application scaffold.
