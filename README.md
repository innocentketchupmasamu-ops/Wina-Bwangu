# Wina Bwangu

Wina Bwangu is a FastAPI + PostgreSQL fintech transaction management prototype for the assignment case study.

## Stack

- Frontend: HTML5, CSS3, JavaScript
- Backend: Python, FastAPI, Pydantic, SQLAlchemy
- Database: PostgreSQL
- Testing: Pytest

## Database setup

Create the PostgreSQL database:

```sql
CREATE DATABASE wina_bwangu;
```

Run these files in pgAdmin Query Tool, in order:

1. `database/schema.sql`
2. `database/seed_reference_data.sql`
3. `database/seed_transactions.sql`

The supplied transaction seed contains the 308 Appendix 1 records.

## Backend setup

Use Python 3.12.

From the `backend` directory:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

Copy `backend/.env.example` to `backend/.env` and put in the PostgreSQL password for the local machine.

Then run:

```powershell
uvicorn app.main:app --reload
```

Open:

```
http://127.0.0.1:8000/
```

The FastAPI server serves the frontend, so a separate web server is not required.

API documentation:

```
http://127.0.0.1:8000/docs
```

## Login

Default demo credentials:

- Username: `admin`
- Password: `wina123`

For a real deployment, change `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `backend/.env`.

## Main functions

- Login page
- Responsive dashboard
- Live service usage and remaining monthly limits
- Booth revenue
- Service frequency
- Revenue vs capital chart
- Tax obligation performance
- Transaction entry
- Booth-specific service validation
- Monthly service-limit validation
- Automatic WB transaction IDs
- Revenue and tax calculations
- Transaction history with filtering and pagination

## Tests

From `backend`:

```powershell
pytest
```

The application deliberately does not drop or recreate the database when the API starts. Existing PostgreSQL data is preserved.
