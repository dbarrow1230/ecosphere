# Ecosphere audit status

This is an ongoing audit, not certification that every application workflow has passed live testing. No production build was run.

## Poetry Garden startup — fixed and verified

Four of eight existing author documents lack a slug. Startup attempted to create a unique slug index covering those legacy documents and failed. AuthorModel now declares a partial unique index for nonempty string slugs. Existing author documents were preserved. The original Eco Sphere launcher successfully activated Poetry Garden: frontend 5191, backend 6017. Live poem and poetry-form APIs responded successfully (697 poems and 56 forms). Read-only Mongo checks confirmed eight authors remain and no duplicate indexed slug groups.

Mongo paths and startup scripts were not changed. Login and authentication flow were not changed. The workspace now displays backend error details supplied by the existing launcher.

## Completed wiring fixes

- Seven allergen workflows share a complete create/edit form wired to existing models, controllers and routes. Description is saved and displayed; schema-specific severity values are preserved. Food Preservation retains its separate schema and form.
- Fixed dashboard and translation-form navigation destinations.
- Added explicit development preview pages for previously missing navigation destinations and planner template previews. These previews do not pretend to persist data.
- Five report pages now expose failed API loads and provide retry instead of silently displaying successful zero totals. Corrected week/month boundary calculations.
- Migrated 25 callback-style Mongoose pre hooks to the installed Mongoose 9 contract while preserving validation and normalization behavior.
- Corrected the donor-contact controller to use DonorContactModel rather than DonationModel.
- Declared and installed the missing mentorship-tracking mammoth document-import dependency; lifecycle scripts and builds were disabled during installation.

## Verification

- All 59 changed JavaScript/JSX source files parse successfully.
- 97 isolated model-hook checks pass across 25 models.
- 82 isolated allergen and donor-controller checks pass using actual schemas/controllers with in-memory storage. No test documents were written to Mongo.
- git diff --check passes.
- Active-source import/export inspection found no unresolved local references in the inspected graph. Inactive copied files were not rewritten based on scanner findings alone.
- Existing lint findings remain in changed files, including effect-state warnings/errors in preexisting loaders and auth synchronization. Newly introduced redundant catch wrappers were removed. A clean full lint run is not claimed.

## Remaining audit work

Most applications have not been exercised through authenticated live create/edit/reload workflows. Development previews still need real workflows where desired. Suspected missing API implementations remain in report/dashboard, backup, memory, reminder/blog and fire-protection dashboard areas; each requires verification against route factories before making a change. Some isolated backend initialization probes timed out and are not considered passing or evidence of an application defect. Continue per application with reachable pages and actual frontend-to-controller-to-model contracts, then live save/reload checks when authorized and feasible.
