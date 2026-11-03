# Nature's Apothecary: public website

This folder is the public website, separate from the internal application.

Run from this app directory: `npm run dev:public`. Public URL: http://127.0.0.1:5224/. Backend: port 6015.

Pages: Home, About, Products, Ingredients, Questions, and Contact. Edit siteContent.js and the entry points in pages/. Shared navigation, footer, layouts, and business settings are in shared/public/ at the workspace root.

Branding, logo, active rotating taglines, contact details, fonts, and colors come from the business assigned to the app key. No alternate palette or tagline is supplied. Before assignment, the browser's neutral defaults and the existing app name and images are used.

The contact page uses published business phone/email details. Its form prepares an email draft in the visitor's email app; it does not send email or claim an order or booking. If no email is published, no send form is offered.

For deployment, `npm run build:public` produces dist-public/ (no production build was run during creation). Configure the host to serve index.html for frontend routes, and reverse-proxy /api plus public asset directories to this app's backend. Alternatively set VITE_PUBLIC_API_URL to its HTTPS origin and allow the website origin in backend CORS.

Review the business copy and current availability before launch. No prices, hours, addresses, testimonials, or credentials have been fabricated.
