# Barrow Accounting & Tax Services

This starter follows the supplied EcoSphere sub-application references. No `frontend` directory is introduced.

- `index.html` retains all icon, manifest, font, and metadata references, with only the application title and `app-key` changed. **Confirm the app-key matches the key registered in the EcoSphere app registry.**
- `package.json` retains the full dependency and script inventory from the supplied reference, adding only `express-rate-limit` and changing the package name.
- `vite.config.js` uses the original project configuration unchanged.
- Backend separates controllers, routes, models, and middleware.
- `src/webpage` holds public-facing pages. Other `src` directories hold internal application pages.

## Local installation

Run from `E:\react-projects\ecosphere\Barrow Accounting & Tax Services`:

```powershell
yarn install
yarn dev
```

In another terminal, run `yarn server`. Copy `.env.example` to `.env` and `backend/.env.example` to `backend/.env`; supply only real project-specific configuration. Do not copy secrets from a different application.

The internal authentication boundary is intentionally not enabled without an explicit authenticated identity and permission contract from EcoSphere. Backend middleware currently denies unauthorized access. Public inquiries are the only functioning database-backed module. Other screens are scaffolds, not completed accounting workflows.
