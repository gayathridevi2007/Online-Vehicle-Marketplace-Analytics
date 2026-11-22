# Online Vehicle Marketplace Analytics

A final-year project to explore vehicle-marketplace data using data warehousing,
OLAP, interactive 3D visualizations, and data mining. Resale-value prediction is
out of scope until it is explicitly requested.

## Current status

Stage 16 is complete. The confirmed PostgreSQL database `vehicle_analytics`
contains the approved Star Schema and 17,437 accepted ETL records. The 17,985
pending rows were excluded. The Flask analytics APIs and React dashboard use
this live Star Schema data; the Snowflake schema has not been initialized.
The customer portal uses a separate `customer_portal.customer_account` table;
customer authentication and Premium status do not alter the warehouse or Admin
authentication. One existing customer account is retained and was not changed
during resale-marketplace setup.

## Customer accounts and Premium demo

Customer registration and sign-in require PostgreSQL and a private
`SECRET_KEY` in `backend/.env`. Generate a local key with:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Keep the generated value private and out of source control. For local
development, `FRONTEND_ORIGIN` should match the frontend URL
(`http://localhost:5173`). The separate `customer_portal` schema is created by
`database/schema/customer_portal.sql`.

Customer passwords are stored as salted scrypt hashes. Cropped square profile
images are stored in the customer account table. The customer catalogue
endpoint requires an authenticated account with an active Premium term; the
existing Admin Portal routes and analytics APIs remain separate.

Premium plans are demo values only: ₹199/month or ₹999/year. Checkout supports
simulated UPI only; it does not contact a payment provider, charge or transfer
money, or persist the entered UPI ID/phone number. Premium status is saved to
the customer account and expires after its plan term.

## Customer resale marketplace

The customer resale flow uses the separate `marketplace` schema. Its additive
tables are present in `vehicle_analytics`; they are separate from the Star
warehouse and currently contain no customer roles, moderators, listings, or
photos. No listing or moderator test data was left in PostgreSQL.

Signed-in customers can browse approved active resale listings as buyers and
submit seller listings from the home page or their profile. One account may
hold both roles. Every new or edited listing enters `PENDING_VERIFICATION`;
only a separately provisioned moderator can approve it for signed-in buyers.
Seller photos are validated and re-encoded before being stored with the listing
in PostgreSQL. Asking prices retain their seller-entered amount and three-letter
currency code; no currency conversion is performed. These resale listings are
not warehouse records or confirmed sales.

To provision a marketplace moderator on the configured database, run from
`backend` and enter a unique email and password when prompted:

```powershell
.\.venv\Scripts\python.exe .\manage_marketplace_moderators.py create
```

Moderators sign in at `/marketplace-review`. This is a separate moderation
console and does not add routes or permissions to the existing Admin Dashboard.
The customer marketplace routes are `/sell-car`, `/my-listings`, and `/`.

## Run locally

Frontend, in one terminal:

```powershell
cd frontend
npm run dev
```

Backend, in another terminal:

```powershell
cd backend
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
# Set DATABASE_URL in .env to your PostgreSQL connection string.
.\.venv\Scripts\Activate.ps1
python run.py
```

The backend health check is available at
`http://127.0.0.1:5000/api/health`. Set `DATABASE_URL` in the local,
git-ignored `backend/.env`; never commit credentials. The frontend defaults to
`http://localhost:5000/api` and can be changed through
`frontend/.env.example`. The health endpoint does not require a database.

For a **new, empty, explicitly confirmed database only**, initialize and load
the Star Schema from the `backend` directory:

```powershell
.\.venv\Scripts\python.exe .\init_database.py --schema star --confirm-database vehicle_analytics
.\.venv\Scripts\python.exe .\etl\etl_pipeline.py --load --confirm-database vehicle_analytics --confirm-schema star
```

These guarded commands refuse an unexpected database/schema. Do not initialize
the already populated `vehicle_analytics.star` schema again.

## Workspace layout

```text
frontend/
backend/
  data/
    raw/
    processed/
  etl/
  routes/
  models/
  services/
  config/
database/
  schema/
  queries/
  seeds/
docs/
```

See [docs/PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md) for project constraints,
[docs/DEVELOPMENT_PROGRESS.md](docs/DEVELOPMENT_PROGRESS.md) for the current
stage, and [docs/DATABASE_DESIGN.md](docs/DATABASE_DESIGN.md) for the proposed
warehouse design and source-data caveats.

## Inspect source datasets

From the workspace root, run:

```powershell
.\backend\.venv\Scripts\python.exe .\backend\etl\inspect_datasets.py
```

The script reads the original CSVs without changing them and generates
`backend/etl/dataset_inspection_report.md` and
`backend/etl/etl_strategy.md`. It requires the backend virtual environment's
Pandas dependency.

## Data handling notes

- Preserve the original CSV files and their source-row provenance.
- The live warehouse contains only the 17,437 accepted records; 17,985
  unreconstructed or otherwise pending rows remain excluded.
- The CSVs do not provide transaction dates. Do not infer sale dates from
  vehicle year or vehicle age.
- Only `combined_cars2.csv` includes a city field, and some values are blank.
- Price measures remain source-specific and unconverted; their currency/units
  are unverified.
- Marketplace listings are not confirmed sales. The OLAP cube is a visual
  preview and graph-based mining currently shows schema relationships, not
  live value-level patterns. No resale-value prediction is implemented.
- Clearly identify any future demonstration data; do not present it as
  source-backed analysis.

## Technology

The frontend uses React, Vite, JavaScript, Tailwind CSS, Three.js with React
Three Fiber and Drei, Recharts, React Router DOM, and Lucide React. The backend
uses Flask, Flask-CORS, Flask-SQLAlchemy, psycopg2-binary, Pandas, and
python-dotenv. PostgreSQL is configured through environment variables.
