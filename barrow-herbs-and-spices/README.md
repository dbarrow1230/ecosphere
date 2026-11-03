# Herbs & Spices

Recreated spice-blend business application for the existing `herbs_spices` MongoDB database. The original eight collections were present but empty when inspected. No historical recipes, products, sales or branding were recovered or invented.

## Open

- Eco Sphere: Applications → Herbs & Spices; Public Websites → Herbs & Spices.
- Application: `http://127.0.0.1:5196`.
- Storefront: `http://127.0.0.1:5228`.
- API: `http://127.0.0.1:6022/api/health`.

Eco Sphere must restart once after the runtime configuration changes. It can then launch both frontends and the backend. On a new checkout, copy `backend/.env.example` to `backend/.env` for the launcher. For standalone development, run `npm run server`, `npm run dev`, and `npm run dev:public` here in separate terminals. Dependencies are resolved from the parent workspace. No new credentials are needed: the backend loads the existing shared configuration and uses a separate connection explicitly targeting `herbs_spices`. Authentication uses Eco Sphere users and its signing key. Management requires the existing owner/administrator permissions.

## Workflow

1. Add herbs and spices with cost per kilogram and supplier details. Receive stock in grams with a reason/reference.
2. Create blends with ingredient percentages totaling 100%, pack weight, packaging cost, price, uses, allergen and storage information. Costs and gross margins exclude labor, overhead, tax and fulfillment.
3. Record production with whole pack quantities and lot references. Ingredient consumption and finished-pack additions happen in one atomic inventory-ledger update. Repeated operation IDs do not change stock twice.
4. Publish selected blends. Only public product fields and ingredient names leave the public API; percentages, costing and private notes stay in management.
5. Customers browse, add available blends to a persistent basket, and send order requests. Prices are checked against saved products on the server. **No online payment is taken.** Tax, shipping, fulfillment and payment are confirmed separately.
6. Confirm a pending order to reserve finished stock, mark it fulfilled, or cancel it. Cancelling a confirmed order returns reserved stock. Production history keeps the formula and cost used at the time.

The public pages have a local composition and stylesheet; shared code is limited to nonvisual business/theme, authentication and configuration helpers. Set up an `herbs-spices` App Key and business assignment in Eco Sphere to use saved logo, contact details, colors, fonts and taglines. Until assigned, the site uses the user-provided name and neutral presentation, with no fabricated business contacts.

Existing collections: `herbs`, `spices`, `vendors`, `equipment`, `kitchen_equipment`, `equipment_vendors`, `category`, `types`. Added collections: `blends`, `orders`, `inventory_ledger`. Records are archived rather than deleted. Inventory is held in one ledger document for atomic updates on the existing standalone MongoDB server; MongoDB's 16 MB document limit means a larger operation will eventually require ledger partitioning/archiving. An interrupted order transition displays a retry action; ledger IDs make those retries safe.

## Checks

`npm test`, `npm run build`, `npm run build:public`. Integration verification should exercise ingredient receipt → recipe → production → public request → confirmation → cancellation, check unauthorized management access and public data filtering, and remove only explicitly tagged temporary test records afterward.

`node backend/scripts/verifyStructure.mjs` compares the required database, middleware, app-key, user, reference, and location files with the actual existing sub-app files. It also verifies the complete `index.html`, standard `main.jsx`, administration pages, and relative imports. The permission middleware retains the existing implementation with its CommonJS export adapted to this app's ES module package. User and user-details schemas retain their established fields and use the shared account connection.

The default Mongoose connection points to `herbs_spices`. Shared accounts remain in `echosphere`, and `backend/db/businessInfoConnection.js` uses `business_info`. The health endpoint reports all three database names without exposing credentials. Form controls are written directly using React Bootstrap; the application does not depend on `Field.jsx`.

## Existing scaffold

`backend/db/businessInfoConnection.js` and all four middleware files are the actual existing scaffold files. Shared app, user, location, and reference code is kept under the corresponding `controllers/`, `models/`, and `routes/` subdirectories. The shared frontend admin, user, form, and authentication files are present under the same `src/pages/` hierarchy. App-specific data services remain in `backend/services`; business-specific models and pages are grouped by domain.

Both HTML entry points declare `app-key="herbs-spices"`. The management entry point retains the existing icon, manifest, font, viewport, and theme metadata. Vite uses the existing shared alias, environment-based proxy/upload setup, and dependency configuration. Business identity resolves through the existing app-key assignment mechanism; no business ID or branding has been fabricated.

See `backend/models/SCHEMA-NOTES.md` for the original database collection/index evidence. Empty collections without validators cannot supply the lost original Mongoose field definitions. Their adapters preserve unknown fields and the verified unique indexes rather than imposing the originally guessed schema.
