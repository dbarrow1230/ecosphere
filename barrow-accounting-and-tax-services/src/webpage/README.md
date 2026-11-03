# Barrow public website

This folder contains the independently deployable public website. The internal application continues to use `src/main.jsx`.

From the Barrow Accounting & Tax Services directory:

```powershell
npm run dev:public
npm run build:public
npm run preview:public
```

Development serves at http://127.0.0.1:5214. The production build is written to `dist-public/` and contains only the public site, not the internal workspace.

Pages: `/`, `/about`, `/services`, `/faq`, and `/contact`. Configure the web host to serve `index.html` for frontend routes so direct links and refreshes work.

The contact form posts to `/api/bats/public/inquiries`. In development, requests proxy to the accounting backend on port 6039. For production, reverse-proxy `/api` to that backend, or set `VITE_PUBLIC_API_URL` to its HTTPS origin before building. Cross-origin hosting also requires the public site's origin in the backend's `CORS_ORIGIN`. The backend and MongoDB must be running to accept inquiries. Inquiries are saved for review; this endpoint does not send email notifications.

Review service descriptions before launch. Add verified business contact details, credentials, and any required business policies when available. No phone number, street address, credentials, testimonials, or response-time claims have been invented.

Shared navigation and footer live in `components/`, public page content in `pages/`, service descriptions in `content.js`, and scoped responsive styles in `public.css`.

The public entry also imports the app's existing `src/styles/theme.css`. `BusinessBrandProvider` applies the theme from the business assigned to `barrow-accounting-tax-services`; that app key is linked to the existing BATS business record. Saved business values override the common stylesheet tokens. Update that business record to change the theme; do not add a separate public-site palette.
