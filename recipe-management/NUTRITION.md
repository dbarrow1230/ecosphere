# Automatic USDA nutrition

Set USDA_API_KEY only in backend/.env and start/restart with `npm run server`. Never expose it through VITE_ variables.

Saving a recipe or importing GPT/Word drafts queues an automatic USDA calculation. Opening an older recipe queues it automatically if it has no nutrition status. The page checks progress and displays the stored results when ready; there is no matching or Apply step.

The backend worker resolves ingredient names, mass conversions, and unqualified USDA portion weights. It calculates nutrition per serving, saves the calculated values and source/matches/date, and keeps the original suggestion separately. It does not guess ambiguous food matches, count sizes, or density. Unresolved ingredients are listed, and prior values remain explicitly unverified. Missing individual nutrients remain blank after a successful calculation. These are estimates without cooking-loss adjustments.

Jobs are durable in recipe nutritionSync metadata. Work is sequential and USDA calls are paced at four-second intervals. Provider failures retry after an hour. Interrupted processing can be reclaimed after 30 minutes. A conditional database update prevents an older calculation overwriting a newer recipe edit. Restarting the backend is required to load this worker.

Tests: `node --test backend/services/nutrition.test.js backend/services/automaticNutrition.test.js`
Provider: https://fdc.nal.usda.gov/api-guide/
