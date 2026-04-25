# Recruiter-AI Backend

Production-ready FastAPI + PostgreSQL backend for the Recruiter-AI platform.
Powers the React dashboard with candidates, assessments, interviews, final
decisions, AI agent outputs, HR feedback, and analytics endpoints.

---

## Tech stack

- Python 3.11+
- FastAPI · SQLAlchemy 2 · Pydantic v2
- PostgreSQL 14+
- pandas (CSV import)
- Uvicorn

---

## Project layout

```
backend/
├── app/
│   ├── main.py              # FastAPI app + CORS + auto table creation
│   ├── database.py          # Engine + session factory + get_db dependency
│   ├── config.py            # .env loader
│   ├── models.py            # SQLAlchemy ORM models (6 tables)
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── utils.py             # Safe coercion helpers
│   ├── seed_csv.py          # Standalone CSV → DB importer
│   ├── routes/
│   │   ├── candidates.py
│   │   ├── assessments.py
│   │   ├── interviews.py
│   │   ├── decisions.py
│   │   ├── agent.py
│   │   ├── feedback.py
│   │   └── analytics.py
│   └── services/
│       ├── csv_loader.py
│       └── analytics_service.py
├── csv/                     # Sample CSV files (drop your own here)
├── requirements.txt
├── .env
└── README.md
```

---

## Setup — step by step

### 1. Install PostgreSQL and create the database

**macOS (Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu / Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download the installer from https://www.postgresql.org/download/windows/

### 2. Create the database and user

Open `psql`:
```bash
psql -U postgres
```

Then run:
```sql
CREATE DATABASE recruiter_ai;
ALTER USER postgres WITH PASSWORD 'password';
\q
```

> If you used a different password, update `DATABASE_URL` in `.env`.

### 3. Clone or download this folder, then create a virtualenv

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # macOS/Linux
# .venv\Scripts\activate           # Windows PowerShell
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure environment

Edit `.env` if your Postgres credentials differ:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/recruiter_ai
ENV=development
CSV_DIR=./csv
```

### 6. Seed the database from CSV

The `csv/` folder ships with sample data covering all 6 tables.
Replace those files with your own real data when ready.

```bash
python -m app.seed_csv
```

You'll see something like:
```
======================================================================
 Recruiter-AI — CSV Seed Script
 Database : localhost:5432/recruiter_ai
 CSV dir  : /…/backend/csv
======================================================================
→ Ensuring database tables exist...
✅ Tables ready

→ Importing CSV files...
✅ candidates.csv: inserted 20 rows
✅ assessments.csv: inserted 20 rows
✅ interview_schedules.csv: inserted 20 rows
✅ final_decisions.csv: inserted 16 rows
✅ agent_outputs.csv: inserted 16 rows
✅ hr_feedback.csv: inserted 16 rows
```

The seeder is **idempotent** — running it twice will not duplicate candidates
(skips by `email` UNIQUE constraint).

### 7. Start the API server

```bash
uvicorn app.main:app --reload
```

You should see:
```
INFO  🚀 Starting Recruiter-AI Backend v1.0.0 (env=development)
INFO  🗄️  Database: localhost:5432/recruiter_ai
INFO  ✅ Tables ensured
INFO  Uvicorn running on http://127.0.0.1:8000
```

### 8. Open the interactive docs

- Swagger UI → <http://127.0.0.1:8000/docs>
- ReDoc      → <http://127.0.0.1:8000/redoc>
- Health     → <http://127.0.0.1:8000/health>

---

## Testing every endpoint

### A) Use Swagger UI (easiest)

Go to <http://127.0.0.1:8000/docs>, click any endpoint, hit **Try it out**, then **Execute**.
Every route is browseable, with example payloads pre-filled.

### B) Use curl

```bash
# Health
curl http://localhost:8000/health

# All candidates
curl http://localhost:8000/api/candidates

# Single candidate
curl http://localhost:8000/api/candidates/1

# Search candidates
curl "http://localhost:8000/api/candidates?q=priya"
curl "http://localhost:8000/api/candidates?department=AI"

# Create candidate
curl -X POST http://localhost:8000/api/candidates \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test.user@example.com",
    "phone": "+1-555-0000",
    "role_applied": "Software Engineer",
    "department": "Engineering",
    "experience_years": 4
  }'

# Update candidate
curl -X PUT http://localhost:8000/api/candidates/1 \
  -H "Content-Type: application/json" \
  -d '{"experience_years": 7}'

# Delete candidate
curl -X DELETE http://localhost:8000/api/candidates/1

# Assessments
curl http://localhost:8000/api/assessments
curl http://localhost:8000/api/assessments/2

# Interviews — all + by status
curl http://localhost:8000/api/interviews
curl http://localhost:8000/api/interviews/scheduled
curl http://localhost:8000/api/interviews/completed
curl http://localhost:8000/api/interviews/in-progress

# Final decisions — all + by decision
curl http://localhost:8000/api/final-decisions
curl http://localhost:8000/api/final-decisions/selected
curl http://localhost:8000/api/final-decisions/rejected
curl http://localhost:8000/api/final-decisions/hold
curl "http://localhost:8000/api/final-decisions?human_only=true"

# Agent outputs
curl http://localhost:8000/api/agent-output
curl http://localhost:8000/api/agent-output/1

# HR feedback
curl http://localhost:8000/api/hr-feedback

curl -X POST http://localhost:8000/api/hr-feedback \
  -H "Content-Type: application/json" \
  -d '{
    "candidate_id": 1,
    "hr_name": "Sandra Liu",
    "rating": 5,
    "decision_alignment": true,
    "useful_output": true,
    "bias_flagged": false,
    "feedback_comment": "Great recommendation"
  }'

# ─── Analytics (the dashboard endpoints) ───
curl http://localhost:8000/api/dashboard/summary
curl http://localhost:8000/api/charts/decision-pie
curl http://localhost:8000/api/charts/interview-status
curl http://localhost:8000/api/charts/department-bar
curl http://localhost:8000/api/charts/mcq-distribution
curl http://localhost:8000/api/charts/weekly-trend
```

### C) From your React frontend

CORS is pre-configured for `http://localhost:3000` and `http://localhost:5173`.

```js
// Vite
const API = "http://localhost:8000";
fetch(`${API}/api/dashboard/summary`).then(r => r.json()).then(console.log);
```

---

## Endpoint reference

| Method | Path                                 | Purpose                          |
| ------ | ------------------------------------ | -------------------------------- |
| GET    | `/`                                  | Service info                     |
| GET    | `/health`                            | Liveness + DB ping               |
| GET    | `/api/candidates`                    | List (with `q`, `department`, `role`, `skip`, `limit`) |
| GET    | `/api/candidates/{id}`               | Get one                          |
| POST   | `/api/candidates`                    | Create                           |
| PUT    | `/api/candidates/{id}`               | Update                           |
| DELETE | `/api/candidates/{id}`               | Delete                           |
| GET    | `/api/assessments`                   | List                             |
| GET    | `/api/assessments/{candidate_id}`    | Per-candidate assessments        |
| GET    | `/api/interviews`                    | All interviews                   |
| GET    | `/api/interviews/scheduled`          | Scheduled only                   |
| GET    | `/api/interviews/completed`          | Completed only                   |
| GET    | `/api/interviews/in-progress`        | In-progress only                 |
| GET    | `/api/final-decisions`               | All (with `?human_only=true`)    |
| GET    | `/api/final-decisions/selected`      | Selected only                    |
| GET    | `/api/final-decisions/rejected`      | Rejected only                    |
| GET    | `/api/final-decisions/hold`          | Hold only                        |
| GET    | `/api/agent-output`                  | All                              |
| GET    | `/api/agent-output/{candidate_id}`   | Per-candidate AI outputs         |
| GET    | `/api/hr-feedback`                   | List                             |
| POST   | `/api/hr-feedback`                   | Submit feedback                  |
| GET    | `/api/dashboard/summary`             | KPI card numbers                 |
| GET    | `/api/charts/decision-pie`           | Selected/Rejected/Hold counts    |
| GET    | `/api/charts/interview-status`       | Status counts                    |
| GET    | `/api/charts/department-bar`         | Candidate count per department   |
| GET    | `/api/charts/mcq-distribution`       | MCQ score buckets                |
| GET    | `/api/charts/weekly-trend`           | Weekly candidate creation trend  |

---

## Replacing sample data with your own

The CSV loader resolves foreign keys automatically — for any non-candidate
table, supply either a numeric `candidate_id` column **or** an `email` column
that matches a candidate already in `candidates.csv`. The sample files use
`email` for clarity.

Required columns per file (extras are ignored):

- **candidates.csv** — `full_name`, `email`, `phone`, `role_applied`, `department`, `experience_years`, `created_at`
- **assessments.csv** — `email` (or `candidate_id`), `total_questions`, `attempted_questions`, `correct_answers`, `wrong_answers`, `unanswered`, `mcq_score_percent`, `time_taken_seconds`, `resume_match_percent`, `jd_skill_match_percent`, `submitted_at`
- **interview_schedules.csv** — `email`, `interviewer_name`, `interview_mode`, `scheduled_date`, `scheduled_time`, `status` (Scheduled / In Progress / Completed / Cancelled), `meeting_link`, `notes`, `created_at`
- **final_decisions.csv** — `email`, `recruiter_name`, `final_decision` (Selected / Rejected / Hold), `human_final_decision` (true/false), `decision_notes`, `decided_at`
- **agent_outputs.csv** — `email`, `recommendation`, `confidence_score`, `strengths`, `concerns`, `summary`, `next_step`, `created_at`
- **hr_feedback.csv** — `email`, `agent_output_id` (optional), `hr_name`, `rating` (1–5), `decision_alignment`, `useful_output`, `bias_flagged`, `feedback_comment`, `corrected_recommendation`, `reviewed_at`

---

## Troubleshooting

**`psycopg2.OperationalError: could not connect to server`**
Postgres isn't running, or your `DATABASE_URL` is wrong. Verify:
```bash
psql -U postgres -d recruiter_ai -c "SELECT 1;"
```

**`InvalidPasswordError` / `password authentication failed`**
Update the password in `.env` to match what you set in step 2.

**Port 8000 in use**
```bash
uvicorn app.main:app --reload --port 8001
```

**Tables out of sync after schema changes**
Drop and recreate during development:
```bash
psql -U postgres -d recruiter_ai -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
python -m app.seed_csv
```

**Frontend gets a CORS error**
Make sure your dev server runs on `localhost:3000` or `localhost:5173`.
Otherwise, add your origin to `CORS_ORIGINS` in `app/config.py`.

---

## License

Internal/hackathon use.