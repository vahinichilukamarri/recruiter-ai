# Recruiter-AI Backend

FastAPI + Aiven PostgreSQL backend with CSV data importer.

## File structure

```
backend/
├── .env                       ← put your Aiven URL here
├── README.md
├── requirements.txt
├── csv/                       ← drop your CSVs here (sample data included)
│   ├── candidates.csv
│   ├── assessments.csv
│   ├── interview_schedules.csv
│   ├── final_decisions.csv
│   ├── agent_outputs.csv
│   └── hr_feedback.csv
└── app/
    ├── __init__.py            (empty)
    ├── config.py
    ├── database.py
    ├── main.py
    ├── models.py
    ├── schemas.py
    ├── seed_csv.py            ← runnable CSV importer
    └── routes/
        ├── __init__.py        (empty)
        ├── agent.py
        ├── analytics.py
        ├── assessments.py
        ├── candidates.py
        ├── decisions.py
        ├── feedback.py
        └── interviews.py
```

## Setup (Windows, Python 3.12)

```cmd
cd backend
py -3.12 -m venv venv
venv\Scripts\activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

## Configure your Aiven database

Open `.env` and replace the placeholder URL:

```
DATABASE_URL=postgresql+psycopg://avnadmin:YOUR_PASSWORD@YOUR-HOST.aivencloud.com:13456/defaultdb?sslmode=require
```

The driver MUST be `postgresql+psycopg` (psycopg v3) and `?sslmode=require` is required for Aiven.

## Load sample CSV data

```cmd
python -m app.seed_csv
```

You should see:
```
✅ candidates.csv: inserted 20 rows
✅ assessments.csv: inserted 20 rows
✅ interview_schedules.csv: inserted 20 rows
✅ final_decisions.csv: inserted 16 rows
✅ agent_outputs.csv: inserted 16 rows
✅ hr_feedback.csv: inserted 16 rows
✅ Seed complete
```

The seeder is **idempotent** — running it twice will skip duplicates by email.

## Run the server

```cmd
python -m uvicorn app.main:app --reload
```

Open http://127.0.0.1:8000/docs

## Test the API

```cmd
curl http://localhost:8000/api/dashboard/summary
curl http://localhost:8000/api/candidates
curl http://localhost:8000/api/final-decisions/selected
curl http://localhost:8000/api/charts/decision-pie
```

## Replace sample data with your own

Replace any CSV in `csv/` with your real data. Required columns:

- **candidates.csv**: full_name, email, phone, role_applied, department, experience_years, created_at
- **assessments.csv**: email (or candidate_id), total_questions, attempted_questions, correct_answers, wrong_answers, unanswered, mcq_score_percent, time_taken_seconds, resume_match_percent, jd_skill_match_percent, submitted_at
- **interview_schedules.csv**: email, interviewer_name, interview_mode, scheduled_date, scheduled_time, status, meeting_link, notes, created_at
- **final_decisions.csv**: email, recruiter_name, final_decision, human_final_decision, decision_notes, decided_at
- **agent_outputs.csv**: email, recommendation, confidence_score, strengths, concerns, summary, next_step, created_at
- **hr_feedback.csv**: email, hr_name, rating, decision_alignment, useful_output, bias_flagged, feedback_comment, corrected_recommendation, reviewed_at

`status` accepts: Scheduled, In Progress, Completed, Cancelled
`final_decision` accepts: Selected, Rejected, Hold
`human_final_decision` accepts: true, false, 1, 0, yes, no

## Endpoint reference

| Method | Path                                 |
| ------ | ------------------------------------ |
| GET    | `/`                                  |
| GET    | `/health`                            |
| GET    | `/api/candidates`                    |
| GET    | `/api/candidates/{id}`               |
| POST   | `/api/candidates`                    |
| GET    | `/api/assessments`                   |
| GET    | `/api/assessments/{candidate_id}`    |
| GET    | `/api/interviews`                    |
| GET    | `/api/interviews/scheduled`          |
| GET    | `/api/interviews/completed`          |
| GET    | `/api/interviews/in-progress`        |
| GET    | `/api/final-decisions`               |
| GET    | `/api/final-decisions/selected`      |
| GET    | `/api/final-decisions/rejected`      |
| GET    | `/api/final-decisions/hold`          |
| GET    | `/api/agent-output`                  |
| GET    | `/api/agent-output/{candidate_id}`   |
| GET    | `/api/hr-feedback`                   |
| POST   | `/api/hr-feedback`                   |
| GET    | `/api/dashboard/summary`             |
| GET    | `/api/charts/decision-pie`           |
| GET    | `/api/charts/interview-status`       |
| GET    | `/api/charts/department-bar`         |
| GET    | `/api/charts/mcq-distribution`       |
| GET    | `/api/charts/weekly-trend`           |