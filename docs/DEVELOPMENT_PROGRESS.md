# Development Progress

## Stage 2: Project workspace initialization

**Status: Complete**

- Inspected the existing workspace before creating files.
- Created the requested backend and database subdirectories.
- Confirmed all three original CSV files are present in `backend/data/raw/`.
- Added the project README, context, progress, and database-design documents.
- Added the requested `.gitignore` entries.
- Preserved all existing files. No dependencies were installed and no frontend,
  backend, or database implementation was started.

## Stage 3: Frontend and backend environment setup

**Status: Complete**

- Initialized a JavaScript React/Vite frontend with Tailwind CSS and the
  requested visualization, routing, charting, and icon packages.
- Created the requested frontend source folders.
- Created a Python virtual environment and installed the requested Flask,
  PostgreSQL driver/ORM, Pandas, and dotenv packages.
- Added a Flask application factory and `GET /api/health`.
- Kept PostgreSQL configuration optional and environment-based; no credentials
  are committed.
- No database tables, ETL, CSV processing, or vehicle data were added.
- `npm run lint` and `npm run build` passed.
- The Vite dev server returned HTTP 200; Flask `GET /api/health` returned
  `{"status":"ok"}` with HTTP 200.
- Python dependency check passed; temporary verification servers were stopped.

## Stage 4: CSV data inspection and ETL preparation

**Status: Complete**

- Added `backend/etl/inspect_datasets.py`, a reusable Pandas-based inspection
  script. It handles the embedded field-name rows in the second and third
  files, reports per-column dtypes/missing values/statistics/categories,
  duplicate counts, possible anomalies, and source-group schema coverage.
- Generated `backend/etl/dataset_inspection_report.md` and
  `backend/etl/etl_strategy.md`.
- Confirmed that price units/currency are not declared and that no dataset
  provides a transaction date or definitive transaction status.
- Flagged differing source-group column layouts and repeated header-like rows
  for review before any future ETL.
- Did not modify the source CSVs, create database tables, load data, or perform
  ETL transformations.
- Python syntax compilation passed and both reports were regenerated and checked.
- SHA-256 hashes confirmed all three original CSVs remained unchanged.

## Stage 5: Data warehouse design

**Status: Complete**

- Documented the fact grain, source-to-warehouse mapping, Star and Snowflake
  schemas, constraints, and ER diagrams in `docs/DATABASE_DESIGN.md`.
- Unreconstructable source groups remain pending; no DDL or data load was done.

## Stage 6: PostgreSQL implementation

**Status: SQL implementation complete; live database verification pending**

- Added separate Star/Snowflake DDL and a guarded initializer that requires an
  explicit schema and matching `--confirm-database` value.
- Updated `.env.example`; existing `backend/config/settings.py` already reads
  `DATABASE_URL`. `backend/settings.py` does not exist.
- PostgreSQL 17.12 tools are installed. A local TCP listener is reachable on
  port 5432, but no `DATABASE_URL`, `backend/.env`, database name, or
  credentials are configured. The PostgreSQL service's `pg_ctl status` reports
  no server for its configured data directory, so no database connection or
  live DDL was attempted.
- Python compilation, initializer guard checks, and static DDL structure
  checks passed. No tables or data were created.

## Stage 7: ETL pipeline development

**Status: Complete; Star-schema load not executed**

- Added `backend/etl/etl_pipeline.py`. Dry-run is the default; database loading
  requires `--load`, an exact `--confirm-database` value, and
  `--confirm-schema star`. The loader verifies the connected database and
  existing Star tables and never initializes or writes to Snowflake.
- Generated `backend/data/processed/accepted_vehicle_marketplace.csv`,
  `backend/data/processed/rejected_pending_records.csv`, and
  `backend/etl/validation_report.md`.
- Dry-run reconciled 35,422 input rows: 17,437 accepted, 0 rejected, and
  17,985 pending. Only `car data.csv`, `Dataset.csv`, and
  `cardekho_dataset.csv` groups were accepted. Unreconstructed groups and all
  shifted `UsedCars_` rows (including eight repeated headers) remain pending.
- Missing source values remain NULL; source identity/ordinal and original
  price values are preserved without conversion. Potential payload duplicates
  were reported, not removed.
- All 17,738 accepted source-price comparisons matched their original CSV
  values. SHA-256 checks confirmed all three original files were unchanged.
- Python compilation and dry-run validation passed. No PostgreSQL inserts were
  attempted; live loading remains pending database configuration and explicit
  target confirmation.

## Stage 8: Flask REST API development

**Status: Complete; database-backed responses pending PostgreSQL configuration**

- Reused the health route and added Star-only vehicle summary, brand, fuel,
  source-specific price-analysis, and paginated records endpoints.
- Analytics use bound parameters and return explicit 503 errors when
  `DATABASE_URL` or the PostgreSQL Star schema is unavailable. Health remains
  available without a database. Price columns are reported separately without
  unit or currency assumptions.
- Added `frontend/src/services/api.js` and `frontend/.env.example` with
  `VITE_API_BASE_URL`; no dashboard or visualization pages were added.
- Four Flask tests passed for health, unavailable-database behavior, and
  invalid/unknown record filters. HTTP smoke test returned 200 for health and
  503 for summary without database configuration.
- Frontend lint and production build passed. No database writes or table
  changes were made.

## Stage 9: Main website layout and navigation

**Status: Complete**

- Replaced the starter landing page with a reusable responsive application
  shell: collapsible sidebar, header, breadcrumbs, page container, shared
  section headings, navigation cards, and loading/error/empty states.
- Added the project overview, workflow, module cards, and stage-based status.
  No vehicle metrics or simulated analytics are displayed.
- Registered all nine navigation routes; unimplemented module routes clearly
  show their development status. Sidebar links, active indicators, desktop
  collapse, and mobile drawer navigation were browser-tested.
- Responsive checks at 320, 360, 390, 768, 1024, and 1440 pixels showed no
  horizontal overflow. Frontend lint and production build passed.
- No 3D modules, API changes, database changes, or dependencies were added.

## Stage 10: Interactive 3D OLAP cube

**Status: Complete; live database OLAP pending**

- Added a dedicated `/olap-cube` page and a separate React Three Fiber scene
  with divided, selectable 3D cube sections and OrbitControls for rotation,
  zoom, and pan.
- Implemented visual Roll-up, Drill-down, Slice, Dice, and Pivot controls with
  dimension labels, configurable structural segments, and operation explanations.
- Clearly labeled the cube as a visualization preview: cells are abstract
  structural segments, and no operation queries or aggregates vehicle records.
- Reset restores the default dimensions, cube view, and camera position.
- Frontend lint/build and browser checks for cube rendering, operations,
  section selection, camera controls, reset, and responsive layout passed.
- No dependencies, APIs, schemas, or other modules were changed.

## Stage 11: Interactive 3D Star Schema visualization

**Status: Complete; live database records are not connected**

- Added `/star-schema` using the approved Star DDL: one fact table, eight
  dimensions, and eight direct foreign-key relationships.
- Added an interactive 3D scene with table selection, relationship highlighting,
  key/column inspection, compact/all-column views, OrbitControls, and reset.
- Included an educational explanation and a clear schema-only/no-live-data
  notice; no SQL or vehicle data was changed.
- Verified visualization metadata against all 9 SQL tables and 8 foreign keys.
  Browser checks passed for selection, detail toggling, rotation, zoom, reset,
  and responsive widths from 320 to 1440 pixels without horizontal overflow.
- `npm run lint` and `npm run build` passed. Build reports a non-blocking large
  OrbitControls chunk warning; the browser logs a non-blocking Three.js
  `THREE.Clock` deprecation warning.

## Stage 12: Interactive 3D Snowflake Schema visualization

**Status: Complete; live database records are not connected**

- Added `/snowflake-schema` using the shared 3D scene, inspector, and dark theme.
  The visualization covers all 9 DDL tables, 50 columns, and 10 relationship
  paths (11 FK constraints, including the composite source/model constraints).
- Added directional relationship arrows, selectable tables and FK paths,
  connected-key inspection, compact/all-column views, and reset controls.
- Explained the source-scoped brand/model normalization and trade-offs; kept
  unsupported geographic hierarchies and live vehicle data out of the preview.
- Compared metadata against `snowflake_schema.sql`: table/column order,
  types, nullability, identity/PK markers, and all 11 foreign-key constraints
  matched. Browser checks passed for selection, relationship highlighting,
  rotation, zoom, reset, and responsive widths from 320 to 1440 pixels; labels
  did not overlap and no horizontal overflow occurred.
- Star Schema route smoke check passed after extracting the shared scene.
- `npm run lint` and `npm run build` passed. Build reports a non-blocking large
  OrbitControls chunk warning; the browser logs a non-blocking Three.js
  `THREE.Clock` deprecation warning. The SQL files were not modified.

## Stage 13: Star vs Snowflake comparison

**Status: Complete; structural comparison only**

- Added `/comparison` with Star, Snowflake, and side-by-side comparison views,
  reusing the shared 3D scene and existing schema metadata.
- Added shared-table focus controls that highlight the corresponding table and
  connected relationships in both diagrams.
- Added a six-criterion comparison table and use-case notes. Join/storage text
  describes schema structure only; no performance measurements are claimed.
- Browser checks passed for navigation, all view modes, relationship focus,
  3D rendering, camera rotation/zoom/reset, and responsive widths from 320 to
  1440 pixels. No horizontal overflow occurred.
- `npm run lint` and `npm run build` passed. Build reports the existing
  non-blocking large OrbitControls chunk warning. No SQL, API, dataset, or
  schema metadata was modified.

## Stage 14: Graph-based pattern mining

**Status: Complete; schema relationship preview only**

- Added `/pattern-mining` with an interactive 3D graph built from the approved
  Star Schema metadata: one source-record fact node, eight dimension nodes, and
  their eight actual foreign-key relationships.
- Added node selection/details, connected-edge highlighting, OrbitControls for
  rotation/zoom/pan, reset, and an explanation distinguishing schema links from
  observed value-level patterns.
- The API was unavailable during verification and has no graph/co-occurrence
  endpoint; the page clearly avoids presenting invented values or mined results.
- Browser checks confirmed route rendering, all nine node controls, Brand
  inspection, reset behavior, camera gestures, and no horizontal overflow at
  320, 390, 768, and 1280 pixel viewport widths.
- `npm run lint` and `npm run build` passed. Build retains the existing
  non-blocking large OrbitControls chunk warning; the browser reports the
  existing non-blocking Three.js `THREE.Clock` deprecation warning. No SQL,
  API, dataset, or ETL files were modified.

## Stage 15: Vehicle marketplace analytics dashboard

**Status: Complete; live data connection completed in Stage 16**

- Replaced the dashboard placeholder with warehouse KPIs, source-scoped brand
  and fuel charts, and separate minimum/average/maximum visualizations for each
  source-specific price measure. No unverified price units or currencies are
  combined.
- Reused the existing API service and Flask endpoints. Added a source selector
  for API-returned chart rows and a paginated record explorer using supported
  source, brand, fuel, and vehicle-year filters.
- Added loading, empty, endpoint-error, partial-data, and live-unavailable
  states. A local Flask check returned HTTP 200 for health and HTTP 503 with
  `database_not_configured` for every data endpoint; the dashboard displayed
  those API errors and no substitute statistics.
- Browser verification with temporary, non-persistent API fixtures confirmed
  chart rendering/tooltips, source filtering, price-measure separation,
  filter validation and query parameters, pagination requests, and responsive
  layout without page-level horizontal overflow at 390 px. Fixtures were
  removed and the final page was rechecked against the unavailable database.
- `npm run lint` and `npm run build` passed. Build reports the existing
  non-blocking large OrbitControls chunk warning. No backend, schema, CSV, or
  ETL files were modified.

## Stage 16: Final database integration and testing

**Status: Complete**

- Confirmed the target `vehicle_analytics` database before initializing only
  the Star Schema. Loaded 17,437 accepted rows; all 17,985 pending rows stayed
  excluded. The Snowflake schema remains uninitialized.
- Audited fact-row lineage, mapped values, NULL counts, and all 17,738
  non-null source-price values against accepted staging: no mismatches.
  Validated all 8 foreign keys with no orphan references.
- Updated Flask-SQLAlchemy to select the project's installed `psycopg2`
  driver for plain `postgresql://` URLs; the private `.env` was not changed.
  All 4 backend tests passed.
- Verified health, summary, brands, fuel types, source-specific price analysis,
  and paginated records APIs against PostgreSQL. The dashboard displayed live
  warehouse counts, source-separated prices, and filtered/paginated records.
- Browser checks passed at 390px and 320px with no page-level horizontal
  overflow. `npm run lint` and `npm run build` passed; the existing large-chunk
  warning is non-blocking.
- Remaining limitations: price units/currencies are unknown; listings are not
  confirmed sales; OLAP operations are visual-only and graph mining is a
  schema-relationship preview. Resale-value prediction is not implemented.

## Phase 1: Customer Marketplace portal

**Status: Complete**

- Added a customer landing page at `/` with a premium automotive dark theme,
  responsive hero, search area, featured-listings empty state, and reserved
  space for a future interactive 3D vehicle.
- No sample vehicles, prices, predictions, or catalogue searches are shown.
  Search remains clearly disabled until a verified customer catalogue exists.
- Added the top-right Admin Portal link to the existing `/vehicle-analytics`
  dashboard. Existing admin module URLs remain unchanged; the former admin
  overview remains available at `/admin`.
- Verified customer and admin entry points, existing direct admin routes,
  mobile/desktop layout, ESLint, and production build.

## Phase 2: Customer vehicle marketplace catalogue

**Status: Complete**

- Added read-only `GET /api/vehicles/customer-catalogue`, which selects 18
  records from the 17,437 accepted Star Schema rows and returns actual brand
  and year filter options. No pending records or writes are involved.
- Connected the customer homepage to that API. Cards preserve the source price
  field/value without inferring currency or units; the detail dialog shows all
  26 exposed record fields and renders missing values as “Not available”.
- Brand and manufacturing-year filters were verified against PostgreSQL
  (including Audi: 290 matching records and year 2021: 21 matching records).
  The live endpoint returned 18 cards and 17,437 total accepted records.
- Browser checks confirmed 18 cards, filter behavior, exact card-to-dialog
  selection, all detail fields, Escape-to-close, the Admin Portal target,
  `/admin`, `/vehicle-analytics`, and all existing module routes. The 390px
  mobile layout had no horizontal overflow.
- The source CSVs and warehouse contain no image field, and the four mapped
  local image files are absent. The UI therefore shows “Image not available”
  rather than unrelated or fabricated vehicle images; image attribution and
  licence remain unverified.
- Five backend tests passed. `npm run lint` passed and `npm run build` passed;
  the build retains the existing non-blocking large-chunk warning. No database,
  ETL, source CSV, or existing admin page/API behavior was changed.

## Phase 3: Customer accounts and Premium discovery

**Status: Complete**

- Added registration and login with full name, phone, email, password, and a
  1:1 profile-image cropper supporting preview, zoom, drag positioning, and
  reset. Cropped 512×512 images and scrypt password hashes are persisted in
  the separate `customer_portal.customer_account` table.
- Added profile name/avatar and Free/Premium status to customer navigation.
  Guests and Free accounts see the marketplace shell but cannot browse records
  or open vehicle details; the existing catalogue API requires an authenticated
  account with active Premium status. Admin Portal routes and analytics APIs
  remain separate.
- Added ₹199 monthly and ₹999 yearly demo plans with UPI input, confirmation,
  processing, and success states. No payment provider is contacted, no real
  money is moved, and the UPI handle is not persisted.
- Created the account table in `vehicle_analytics`. Browser testing completed
  registration, crop preview/zoom/reposition/reset, Premium upgrade, catalogue
  unlock (18 accepted records), vehicle details, refresh persistence,
  logout/login persistence, and direct Admin Dashboard access. The temporary
  test account was deleted; a pre-existing customer account was retained.
- All 9 backend tests passed; Python compilation and Pylance syntax checks
  passed. `npm run lint` and `npm run build` passed; the build retains the
  existing non-blocking large-chunk warning. Browser layout checks at mobile
  width found no horizontal overflow.
- Payment is simulation-only. No real payment integration, customer account
  editing, or resale-value prediction was added.

## Phase 4: Customer resale marketplace

**Status: Implemented; marketplace schema applied, no live listings seeded**

- Added the customer resale workflow alongside the existing customer and
  Admin Dashboard routes: buyer browsing on `/`, seller submission/editing on
  `/sell-car`, seller management on `/my-listings`, and a separate moderator
  console on `/marketplace-review`.
- A single customer account can hold BUYER and SELLER roles. Signed-in buyers
  can search/filter approved listings, open details, view listing photos, and
  contact the seller. New and edited submissions are hidden in
  `PENDING_APPROVAL` until seller verification and moderator approval.
  Withdrawal hides a listing; editing an approved listing returns it to
  approval review.
- Added multiple-photo upload with type/size limits and server-side image
  verification/re-encoding. Photos are associated with their listing in
  PostgreSQL. Seller-entered price and currency are preserved without
  conversion; price filters require a currency. Rejected, pending, withdrawn,
  and simulated-purchase listings are not exposed in buyer results.
- Applied only `database/schema/resale_marketplace.sql` to the verified
  `vehicle_analytics` database after confirming the marketplace objects were
  absent and the existing customer and Star tables were present. The migration
  created four marketplace tables and four foreign keys. All four tables have
  zero rows; the existing customer account and 17,437 Star fact records remain.
  No moderator, listing, or photo data was added to the live database.
- The marketplace APIs and workflow tests cover upload validation, pending
  submission, moderator approval, authenticated buyer filtering/details and
  contact, shared roles, and withdrawal. All 12 backend tests passed.
- Browser route checks passed for seller submission, My Listings, and the
  separate moderation sign-in. Responsive checks at 320, 390, 768, and 1440px
  had no horizontal overflow. The home Sell Your Car CTAs are present and the
  Admin Portal still targets `/vehicle-analytics`.
- `npm run lint` passed. `npm run build` passed with the existing non-blocking
  large OrbitControls chunk warning.
- Remaining setup: provision a moderator with
  `backend/manage_marketplace_moderators.py`; then new customer submissions
  can be reviewed and approved. Live marketplace records remain empty until
  customers submit listings.

## Phase 5: Seller verification and simulated transactions

**Status: Complete; live marketplace tables migrated; no listings or transactions seeded**

- Reused the existing customer registration, login, and session authentication.
  Customer accounts can retain both BUYER and SELLER roles; seller submissions
  are restricted to their owning account, and moderator authentication remains
  a separate session and sign-in page.
- Seller submissions now require at least two actual car photos and one or
  more ownership documents. Images are verified and re-encoded; PDF/image
  documents have per-file/count/total size limits, are stored privately, and
  can only be downloaded by an authenticated moderator. Documents are review
  evidence, not automatic proof of ownership.
- New and edited listings begin as `PENDING_APPROVAL`. Moderators must
  explicitly review the ownership documents and verify the seller before the
  approval endpoint will activate a listing. Only `APPROVED_ACTIVE` listings
  are returned to signed-in buyers; buyer details expose the seller's contact
  information. Public calls cannot approve or reject listings.
- Vehicle purchase is explicitly labelled as simulated, does not contact a
  payment provider or transfer money, and records the transaction ID, listing,
  buyer, seller, amount/currency, timestamp, and `SIMULATED_SUCCESS` status.
  The Admin Moderation page lists these records and refreshes the notification
  feed periodically. A simulated purchase removes the listing from buyer
  results but is recorded as `SIMULATED_PURCHASE`, not as a confirmed real
  sale. Listing submission itself is free.
- Added marketplace-only ownership-document and simulated-transaction tables
  and updated the listing status/verification constraints. Applied the
  migration to `vehicle_analytics` after checking the target and empty
  marketplace records. Verification confirmed all 17,437 Star fact rows and
  the existing customer-account row remained unchanged; marketplace listings
  and simulated transactions remain empty. No Star/Snowflake schema, OLAP,
  ETL, or warehouse records were modified.
- Fourteen backend tests passed, including customer registration/login
  compatibility, roles, upload type/size checks, private document access,
  seller ownership permissions, moderator-only review, approved listings,
  simulated purchases, and Admin Moderation transaction notifications.
  Python compilation, live-schema ORM inspection/authentication smoke checks,
  `npm run lint`, and `npm run build` passed. The build reports the existing
  non-blocking large-chunk warning.
- Remaining setup/limitations: provision an authorized moderator before
  production review; a human must inspect seller evidence, and this workflow
  does not certify legal ownership. Payments are simulations only; there is
  no listing fee, payment provider, or real-time external notification system.

## Stage 1: Two-portal entry and navigation

**Status: Complete**

- Added two distinct, responsive homepage portal cards for Customer Marketplace
  and Admin & Analytics. The cards link to existing customer routes and all
  existing admin modules; no vehicle listing or warehouse placeholder data was
  added. Reused the existing Lucide vehicle/shield icons and the existing dark
  navy, blue, and cyan styles.
- Streamlined customer navigation for browsing, vehicle data, selling,
  listings, purchase history, customer sign-in/registration, and admin sign-in.
  Buyer and seller access continues to use the same customer account system.
- Reused the existing separately authenticated marketplace moderator session
  for staff sign-in, seller/listing moderation, transaction monitoring, and
  admin route gating. Added a shared auth provider and dedicated `/admin-login`
  entry. Existing admin URLs remain intact; unauthenticated access to
  `/admin`, moderation, and all analytics modules routes to staff sign-in.
  Admin and customer headers provide sign-out/navigation paths.
- Added a customer-only `/my-purchases` view backed by a read-only endpoint for
  the existing simulated transaction records. It clearly distinguishes
  simulated activity from real payments or confirmed sales.
- Existing OLAP operations, schema/graph logic, ETL transformations, warehouse
  database structure and records, and analytics calculations were not changed.
  No SQL files or migrations were changed or run.
- Browser smoke checks confirmed both homepage portals and their links, all
  admin routes redirecting unauthenticated users to `/admin-login`, customer
  sign-in/registration/seller/listings/purchase routes remain available, and
  the 390px mobile homepage has two portal cards with no horizontal overflow.
  Fourteen backend tests passed; `npm run lint` and `npm run build` passed. The
  build retains the existing non-blocking large-chunk warning.
- Staff accounts must still be provisioned through the existing moderator
  provisioning script. Admin route gating is frontend navigation protection;
  existing analytics API authorization/calculations were intentionally left
  unchanged in this UI/navigation stage.

## Stage 2 & Stage 3: Data Collection & ETL and Warehouse Architecture UI

**Status: Complete**

- Fixed `backend/config/settings.py` environment loading by resolving `backend/.env`
  relative to the backend directory, enabling reliable execution from both the repository
  root and subdirectories without modifying credentials or environment values.
- Replaced the placeholder "Interface under development" on `/etl` with a dedicated
  `EtlPage.jsx`. The page displays the dry-run reconciliation metrics (35,422 input
  rows, 17,437 accepted rows, 17,985 pending rows, 0 rejected parse failures, 146,176
  preserved NULL values), five execution pipeline stages, source container breakdown
  with SHA-256 integrity hashes, anomaly reasons, and data governance guardrails.
- Replaced the placeholder on `/warehouse` with a dedicated `WarehouseArchitecturePage.jsx`.
  The page details the PostgreSQL warehouse specification: fact grain ("one accepted
  source vehicle record from one source dataset"), unique natural constraints, lineage
  attributes, unconverted source-specific measures, the 8 surrogate-keyed dimension
  tables with business keys, and direct navigation links to 3D Star Schema, 3D
  Snowflake Schema, Comparison, and Analytics.
- Both pages probe live database status on mount via `api.vehicleSummary()`, displaying
  a connected badge when PostgreSQL is reachable and a clear offline/sandboxed status
  when unreachable. No placeholder or fabricated data is substituted.
- Preserved existing OLAP cube, Star and Snowflake SQL DDL, tables, constraints,
  and records. No migrations, ETL reloads, or DB mutations were run.
- Fourteen backend unit tests passed. Frontend oxlint passed with 0 errors and 0
  warnings. Vite production build passed cleanly. Browser verification confirmed
  homepage portal cards, admin routing, and authentication flows.

## Final Consolidated Fix: Full Portal Separation, Catalogue Discovery, and Dynamic PDF Analytics

**Status: Complete & Verified**

- **Authentication & Two-Portal Separation**:
  - Investigated the root cause of customer credentials failing on the Admin login page:
    Customer accounts are isolated in `customer_portal.customer_account` while staff access
    is authenticated against `resale_marketplace.moderator_account`.
  - Added CLI options (`--password`, `list`) to `backend/manage_marketplace_moderators.py`.
  - Provisioned the project's authorized moderator account (`admin@vma.local` / `AdminStaff@2026!`).
  - Added guidance on `/admin-login` explaining that customer credentials do not grant staff access.
- **Verified Vehicle Catalogue & Star Schema Integration**:
  - Connected the Customer Marketplace catalogue directly to the live Star Schema records API
    (`star.fact_vehicle_marketplace`) so all 17,437 warehouse records can be browsed without being locked.
  - Added `/api/vehicles/filter-options` providing dynamic choices for brands, models, years, fuel types,
    transmissions, and geographic locations (cities and states).
  - Implemented dynamic frontend filter controls for Brand, Model, Manufacturing Year, Fuel Type,
    Transmission, Location (City/State), and Min/Max raw price filters.
  - Added responsive pagination controls (18 records per page) and real vehicle photograph display
    using verified mappings (`/vehicles/Maruthi Suzuki Swift.png`, `Nexa Baleno.png`, `Hyundau Creta.png`,
    `Hyundai i20.png`) and sleek SVG automotive badge fallbacks.
- **Automotive UI & Studio Presentation**:
  - Replaced the studio placeholder with a lightweight, high-tech automotive sports coupe SVG illustration
    featuring aerodynamic contours, cyan/blue neon lighting, and zero external dependency risk.
  - Retained the dark navy, blue, cyan, and purple theme with improved spacing, alignment, and badges.
  - Maintained complete separation between the Star Schema warehouse catalogue and customer resale listings.
- **Dynamic Analytics & PDF Report Generation**:
  - Added dynamic multi-criteria filters to the Vehicle Analytics Dashboard (`VehicleAnalyticsPage.jsx`):
    State/Region (with automatic mapping e.g. "Tamil Nadu" -> Chennai), Brand, Model, Fuel Type, Transmission,
    and Year Range. Verified that selecting Tamil Nadu and Audi correctly returns the 28 matching records.
  - Implemented client-side PDF report generator using `jsPDF` and `jspdf-autotable`. The generated report
    contains the title, active filters, KPI summary, top brand/fuel distributions, sample vehicle data table,
    page numbering, and generation timestamp.
- **Preservation & Test Verification**:
  - All 14 backend unit tests passed (`test_api.py`, `test_customer_auth.py`, `test_marketplace.py`).
  - Frontend `oxlint` passed with 0 errors and 0 warnings across 48 files.
  - Frontend production build passed cleanly in 2.23s.
  - Original 17,437 warehouse records, customer records, database DDL, and 3D OLAP cube remain intact.

## Customer and Admin Authentication Verification & Cross-Origin Repair

**Status: Complete & Browser-Verified**

- **Root Cause Resolution for Admin Login Rejection**:
  - Customer marketplace accounts reside in `customer_portal.customer_account` while Admin & Analytics
    staff accounts are securely stored in `resale_marketplace.moderator_account`. Customer accounts
    attempting to sign in on `/admin-login` are intentionally rejected with `invalid_credentials`
    to enforce strict separation between consumer and administrative privileges.
  - Resolved origin check limitation: `_origin_error()` in both `backend/routes/marketplace.py` and
    `backend/routes/customer_auth.py` previously rejected requests when Vite ran on alternative ports
    (e.g., 5174 or loopback `127.0.0.1`). Updated `_origin_error()` to accept all authorized frontend
    origins (`Config.FRONTEND_ORIGIN`, `http://localhost:5173`, `http://localhost:5174`,
    `http://127.0.0.1:5173`, `http://127.0.0.1:5174`), matching Flask-CORS policy.
- **Idempotent Moderator Provisioning Utility**:
  - Upgraded `backend/manage_marketplace_moderators.py` to handle existing moderator accounts safely
    by updating the `password_hash` (scrypt) and ensuring `is_active = True`, preventing duplicate
    account crashes while allowing project administrators to securely re-provision or update credentials.
  - Authorized moderators: `admin@vma.local` and `supriya12@gmail.com`.
- **Comprehensive Browser & API Verification**:
  - Customer registration (`POST /api/customer/auth/register`) verified with HTTP 201.
  - Customer login (`POST /api/customer/auth/login`) verified with HTTP 200, unlocking customer resale listings and buyer workspace.
  - Non-moderator customer credentials tested on `/admin-login` and confirmed to be rejected with 401 `invalid_credentials`.
  - Moderator login (`POST /api/marketplace/moderation/login`) verified with HTTP 200, redirecting to `/admin`.
  - Protected admin routes guarded by `AdminPortalGuard` verified against unauthorized access.
  - 14 backend unit tests passed; frontend lint (`oxlint`) passed with 0 errors; Vite production build passed.

