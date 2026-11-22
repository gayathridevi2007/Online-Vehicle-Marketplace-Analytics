# Project Context

## Project

**Online Vehicle Marketplace Analytics and Resale Value Prediction Using Data
Mining**

The application is intended to provide an educational, professional analytics
experience over vehicle data, including warehouse concepts, OLAP operations,
interactive 3D schema visualizations, graph-based pattern mining, and a
marketplace analytics dashboard.

Resale-value prediction and machine-learning implementation are not part of
the current work. They must not be added unless explicitly requested.

## Intended technology

- Frontend: React, Vite, JavaScript, Tailwind CSS, Three.js, React Three Fiber,
  Drei, and Recharts.
- Backend: Python Flask with REST APIs.
- Data: PostgreSQL and Pandas-based ETL.

## Available source data

The original files are stored in `backend/data/raw/`:

- `combined_cars.csv`
- `combined_cars2.csv`
- `combined_cars3.csv`

Their fields are not uniform. The second and third files have generic column
labels on the first row and field names embedded in the next row. ETL must
account for this format, preserve the source filename and source-row identity,
and validate data before loading it.

## Project constraints

- Keep supplied source files unchanged and distinguish source data from any
  demonstration data.
- Do not infer transaction dates or fill in locations that are not present.
- Confirm price semantics and units before normalization; preserve original
  values and source meaning.
- Base analytical modules on consistent warehouse data and connect the
  frontend to Flask APIs.
- Use actual interactive 3D objects and real data-driven interactions rather
  than static images or placeholder controls.
- Develop and test the project in stages. Do not install dependencies or begin
  application development during workspace initialization.
