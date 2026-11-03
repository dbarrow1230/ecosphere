# Root Wise public website

The public site lives in this directory and runs independently of the internal consulting workspace. Run `npm run dev:public` from `root-wise-consulting` for port 5227. Its existing backend uses port 6036.

Root Wise uses its own `RootWiseShell.jsx` and page layouts, not the shared public website shell. The desktop navigation is a left rail, with a photographic homepage, an interactive menu/kitchen/opening consulting brief, an expertise ledger, an engagement timeline, and a consulting contact page. Mobile uses an expandable navigation header. The app's existing theme stylesheet supplies base typography; saved business values override it. No independent color palette is defined in `rootWise.css`.

Public pages: Home, About, Services, Our approach, Questions, and Contact. The homepage is specific to culinary consulting; names, logos, theme values, taglines, and contact details come from the assigned Root Wise business record.

The Services page reads active service listings from `/api/public-site/services`. That endpoint selects only public names, categories, descriptions, scopes, and deliverables. It does not return internal notes, staff identifiers, rates, client projects, proposals, or assessments. The initial live query returned zero active service listings; descriptive consulting areas remain available without manufacturing database records.

The owner/admin Public websites directory and the internal Root Wise navigation provide access. Contact uses the shared email-draft flow with saved published contact details. No email is sent automatically.

No production build was run. Hosting requires SPA fallback and an `/api` proxy to the Root Wise backend (or `VITE_PUBLIC_API_URL`).
