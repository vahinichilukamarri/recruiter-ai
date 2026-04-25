"""
Standalone CSV seed script.

Usage (from the project root):
    python -m app.seed_csv
or
    python app/seed_csv.py

Reads CSV files from the directory configured by CSV_DIR (default ./csv)
and inserts them into PostgreSQL through the SQLAlchemy ORM.

CSV files expected (any subset is fine — missing files are skipped):
    - candidates.csv
    - assessments.csv
    - interview_schedules.csv
    - final_decisions.csv
    - agent_outputs.csv
    - hr_feedback.csv
"""
import sys
import json
from pathlib import Path

# Ensure project root is on sys.path when run as `python app/seed_csv.py`
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.config import settings  # noqa: E402
from app.database import Base, engine, SessionLocal  # noqa: E402
from app import models  # noqa: F401, E402
from app.services.csv_loader import run_csv_import  # noqa: E402


def main() -> None:
    print("=" * 70)
    print(f" Recruiter-AI — CSV Seed Script")
    print(f" Database : {settings.DATABASE_URL.split('@')[-1]}")
    print(f" CSV dir  : {Path(settings.CSV_DIR).resolve()}")
    print("=" * 70)

    # Make sure tables exist before we try to insert
    print("\n→ Ensuring database tables exist...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables ready")

    print("\n→ Importing CSV files...\n")
    db = SessionLocal()
    try:
        report = run_csv_import(db)
    finally:
        db.close()

    print("\n" + "=" * 70)
    print(" Import Report")
    print("=" * 70)
    print(json.dumps(report, indent=2))
    print()


if __name__ == "__main__":
    main()