# Public websites

Owners and administrators can open the directory at [Public websites](http://127.0.0.1:5174/public-websites). It includes business thumbnails, purpose descriptions, search, and alphabet filters. Management navigation and activation are restricted to those roles; the independent customer websites remain public.

| App | Public preview | Business-specific pages |
| --- | --- | --- |
| Barrow Coffee Delights | http://127.0.0.1:5215/ | Café menu, Gatherings |
| Barrow Publications | http://127.0.0.1:5216/ | Publishing, For authors |
| Catering Management / Fresh Roots Catering | http://127.0.0.1:5217/ | Catering, Event planning |
| Crazy Cravings Alchemy Delight Doughnuts | http://127.0.0.1:5218/ | Doughnuts, Celebrations |
| Everything in a Jar | http://127.0.0.1:5219/ | Our pantry, Seasonal batches |
| Fresh Roots Flavor Kitchen | http://127.0.0.1:5220/ | Our food, Our approach |
| From The Ground Up | http://127.0.0.1:5221/ | Programs, Taking part |
| Green Table Grocers | http://127.0.0.1:5222/ | Groceries, Less food waste |
| ITM Fire Protection | http://127.0.0.1:5223/ | Services, Equipment |
| Nature's Apothecary | http://127.0.0.1:5224/ | Products, Ingredients |
| Pro Edge Knife System | http://127.0.0.1:5225/ | Knife systems, Choosing your set |
| The Zestful Gourmet | http://127.0.0.1:5226/ | Journal, Conversations |

Each site also has Home, About, Questions, Contact, a not-found page, responsive navigation, and a footer. Accounting's existing public site remains at port 5214.

## Files and saved business settings

Each app owns its `src/webpage/` entry point, `pages/`, and `siteContent.js`. Shared React/React Bootstrap/Lucide components and token-based CSS live in `shared/public/`. Public pages do not import the internal application or its protected routes.

Names, logos, contact details, fonts, colors, and active rotating taglines come from the business assigned to the app key. The selected tagline is shown first; multiple active taglines rotate every six seconds. There is no alternate color palette or invented tagline. Browser defaults apply until a theme is assigned. Saved settings refresh when the website regains focus.

Crazy Cravings had no assigned business record during verification. Assign it through the existing app-key/business settings to supply its saved branding.

## Local startup

Restart the EcoSphere backend once after these source changes so it loads the public website ports and the new activation endpoint. The public website links then start the selected website and its app backend on demand. A separately running preview is opened directly.

Alternatively, from any app directory run `npm run dev:public`. Its backend must also be running for saved business settings to load. Public ports are registered in `app-runtime-config.json` under `publicApplications`; internal app ports are separate.

## Catalogs, articles, orders, and donations

The public experiences have separate home compositions: café ordering, doughnut boxes, pantry shelves, rescued groceries, an apothecary storefront, knife collection comparisons, fire equipment/service, community participation, editorial publishing, event catering, a seasonal kitchen, and a personal food blog. Their content was checked against the existing business pages, models, and routes.

Seven shops query their own databases through `/api/public-site/products`. Public responses select customer-facing fields; costs, private notes, customer equipment, and unpublished records are excluded. Pro Edge's `/options` supplies its custom builder. Fresh Roots Flavor Kitchen uses the existing `/api/menus/public` endpoint. The Zestful Gourmet reads published posts through `/api/public-site/posts`; its About page retains the original writer's story. Barrow Publications' protected book-management proxy is not exposed as a public bookstore.

On October 29, 2026, live queries returned 11 Nature's Apothecary products and four Pro Edge collections. Coffee, Crazy Cravings, Everything in a Jar, Green Table Grocers, and ITM returned no eligible catalog rows; Zestful returned no published articles. These are query results at verification time, not permanent catalog counts. No example inventory or articles were inserted to fill those pages. Product images appear when saved on the product; missing images do not get fabricated placeholders.

Basket requests use server-side catalog prices and stock validation and save to `public_website_orders` with pending status. The seven retail admin apps have an owner/admin Website orders inbox. ITM's service form uses its existing request endpoint. Requests do not reserve inventory or collect payment.

From The Ground Up has a prominent `/donate` page using its existing donor and donation records. Pledges remain pending and are excluded from completed-donation totals. A real HTTPS hosted giving link can be configured with `PUBLIC_DONATION_URL`; without it, the page clearly records a pledge only. Monthly pledges do not start recurring charges. Donor management routes require owner/admin authorization.

## Contact and availability

Contact pages display saved business contact details. If an email address is available, the form prepares a draft in the visitor's email app; the visitor reviews and sends it. The website does not send messages, process payments, confirm bookings, or reserve stock. No email form is presented if no email address is published.

Saved catalog data supplies products, prices, and availability. Missing catalog entries, articles, opening hours, and payment settings are not invented.

## Deployment and checks

The independent production build command is `npm run build:public`; output is `dist-public/`. No production builds were run during this work.

For hosting, use SPA fallback to `index.html` for frontend routes. Proxy `/api` and uploaded asset directories to the corresponding app backend, or set `VITE_PUBLIC_API_URL` to its HTTPS origin and configure backend CORS. Upload proxies use directory prefixes with trailing slashes, keeping pages such as `/products` separate from product image directories.

Verification includes syntax/import checks across 514 reachable source files, unique public ports, saved-theme checks, and five automated checks covering management roles, saved branding, canonical order pricing, stock/quantity validation, quote products, and private-field filtering. Live catalog endpoints returned HTTP 200; anonymous order-inbox, donor-management, and public-activation requests returned 401. Browser checks covered the distinct home pages, real Apothecary basket pricing, database-backed knife-builder options, and the donation pledge form. No real order or donation was submitted during verification. No production build was run.
