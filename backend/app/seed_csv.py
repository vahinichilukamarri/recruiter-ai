"""
Standalone CSV seed script.

Reads CSV files from ./csv/ and inserts them into the database via SQLAlchemy.
Uses Python's stdlib `csv` module — no pandas needed.

Usage (from the project root, with venv activated):
    python -m app.seed_csv

Files expected in ./csv/ (each one is optional — missing files are skipped):
    candidates.csv
    assessments.csv
    interview_schedules.csv
    final_decisions.csv
    agent_outputs.csv
    hr_feedback.csv

Foreign-key resolution:
    Non-candidate tables can use either a numeric `candidate_id` column OR
    an `email` column that matches a candidate already in candidates.csv.
"""
import sys
import csv
import math
from pathlib import Path
from datetime import datetime, date, time
from typing import Any, Optional, Dict

# Make sure the project root is on sys.path
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.config import settings  # noqa: E402
from app.database import Base, engine, SessionLocal  # noqa: E402
import app.models as models  # noqa: E402

CSV_DIR = ROOT / "csv"


# ─────────── helpers ───────────

def _str(v: Any) -> Optional[str]:
    if v is None:
        return None
    s = str(v).strip()
    return s or None


def _int(v: Any, default: int = 0) -> int:
    try:
        if v is None or v == "":
            return default
        return int(float(v))
    except (TypeError, ValueError):
        return default


def _float(v: Any, default: float = 0.0) -> float:
    try:
        if v is None or v == "":
            return default
        f = float(v)
        if math.isnan(f):
            return default
        return f
    except (TypeError, ValueError):
        return default


def _bool(v: Any, default: bool = False) -> bool:
    if v is None or v == "":
        return default
    if isinstance(v, bool):
        return v
    s = str(v).strip().lower()
    if s in ("true", "1", "yes", "y", "t"):
        return True
    if s in ("false", "0", "no", "n", "f"):
        return False
    return default


def _dt(v: Any) -> Optional[datetime]:
    if v is None or v == "":
        return None
    if isinstance(v, datetime):
        return v
    s = str(v).strip()
    for fmt in (
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d %H:%M",
        "%Y-%m-%d",
        "%d/%m/%Y %H:%M",
        "%d/%m/%Y",
        "%m/%d/%Y",
    ):
        try:
            return datetime.strptime(s, fmt)
        except ValueError:
            continue
    return None


def _date(v: Any) -> Optional[date]:
    dt = _dt(v)
    return dt.date() if dt else None


def _time(v: Any) -> Optional[time]:
    if v is None or v == "":
        return None
    s = str(v).strip()
    for fmt in ("%H:%M:%S", "%H:%M", "%I:%M %p", "%I:%M:%S %p"):
        try:
            return datetime.strptime(s, fmt).time()
        except ValueError:
            continue
    return None


def _read_csv(path: Path) -> list[dict]:
    """Return list of dicts with normalized lowercase keys."""
    rows = []
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            normalized = {(k or "").strip().lower().replace(" ", "_"): v for k, v in row.items()}
            rows.append(normalized)
    return rows


def _email_to_id(db) -> Dict[str, int]:
    """Map email → candidate_id for FK resolution."""
    return {e: i for e, i in db.query(models.Candidate.email, models.Candidate.id).all()}


def _resolve_candidate_id(row: dict, email_map: Dict[str, int]) -> Optional[int]:
    cid = _int(row.get("candidate_id"), 0)
    if cid:
        return cid
    email = _str(row.get("email") or row.get("candidate_email"))
    if email and email in email_map:
        return email_map[email]
    return None


# ─────────── per-table loaders ───────────

def load_candidates(db, rows) -> int:
    existing = {e for (e,) in db.query(models.Candidate.email).all()}
    inserted = 0
    for row in rows:
        email = _str(row.get("email"))
        if not email or email in existing:
            continue
        obj = models.Candidate(
            full_name=_str(row.get("full_name") or row.get("name")) or "Unknown",
            email=email,
            phone=_str(row.get("phone")),
            role_applied=_str(row.get("role_applied") or row.get("role")),
            department=_str(row.get("department") or row.get("dept")),
            experience_years=_float(row.get("experience_years") or row.get("experience"), 0.0),
            created_at=_dt(row.get("created_at")) or datetime.utcnow(),
        )
        db.add(obj)
        existing.add(email)
        inserted += 1
    db.commit()
    return inserted


def load_assessments(db, rows) -> int:
    email_map = _email_to_id(db)
    inserted = 0
    for row in rows:
        cid = _resolve_candidate_id(row, email_map)
        if cid is None:
            continue
        db.add(models.Assessment(
            candidate_id=cid,
            total_questions=_int(row.get("total_questions")),
            attempted_questions=_int(row.get("attempted_questions")),
            correct_answers=_int(row.get("correct_answers")),
            wrong_answers=_int(row.get("wrong_answers")),
            unanswered=_int(row.get("unanswered")),
            mcq_score_percent=_float(row.get("mcq_score_percent") or row.get("score_percent")),
            time_taken_seconds=_int(row.get("time_taken_seconds")),
            resume_match_percent=_float(row.get("resume_match_percent")),
            jd_skill_match_percent=_float(row.get("jd_skill_match_percent")),
            submitted_at=_dt(row.get("submitted_at")) or datetime.utcnow(),
        ))
        inserted += 1
    db.commit()
    return inserted


def load_interviews(db, rows) -> int:
    email_map = _email_to_id(db)
    valid = {s.value for s in models.InterviewStatus}
    inserted = 0
    for row in rows:
        cid = _resolve_candidate_id(row, email_map)
        if cid is None:
            continue
        status_raw = _str(row.get("status")) or "Scheduled"
        status_val = status_raw if status_raw in valid else "Scheduled"
        db.add(models.InterviewSchedule(
            candidate_id=cid,
            interviewer_name=_str(row.get("interviewer_name")),
            interview_mode=_str(row.get("interview_mode") or row.get("mode")),
            scheduled_date=_date(row.get("scheduled_date") or row.get("date")),
            scheduled_time=_time(row.get("scheduled_time") or row.get("time")),
            status=models.InterviewStatus(status_val),
            meeting_link=_str(row.get("meeting_link") or row.get("link")),
            notes=_str(row.get("notes")),
            created_at=_dt(row.get("created_at")) or datetime.utcnow(),
        ))
        inserted += 1
    db.commit()
    return inserted


def load_decisions(db, rows) -> int:
    email_map = _email_to_id(db)
    valid = {s.value for s in models.FinalDecisionEnum}
    inserted = 0
    for row in rows:
        cid = _resolve_candidate_id(row, email_map)
        if cid is None:
            continue
        dec_raw = _str(row.get("final_decision") or row.get("decision")) or "Hold"
        dec_val = dec_raw if dec_raw in valid else "Hold"
        db.add(models.FinalDecision(
            candidate_id=cid,
            recruiter_name=_str(row.get("recruiter_name")),
            final_decision=models.FinalDecisionEnum(dec_val),
            human_final_decision=_bool(row.get("human_final_decision"), False),
            decision_notes=_str(row.get("decision_notes") or row.get("notes")),
            decided_at=_dt(row.get("decided_at")) or datetime.utcnow(),
        ))
        inserted += 1
    db.commit()
    return inserted


def load_agent_outputs(db, rows) -> int:
    email_map = _email_to_id(db)
    inserted = 0
    for row in rows:
        cid = _resolve_candidate_id(row, email_map)
        if cid is None:
            continue
        db.add(models.AgentOutput(
            candidate_id=cid,
            recommendation=_str(row.get("recommendation")),
            confidence_score=_float(row.get("confidence_score")),
            strengths=_str(row.get("strengths")),
            concerns=_str(row.get("concerns")),
            summary=_str(row.get("summary")),
            next_step=_str(row.get("next_step")),
            created_at=_dt(row.get("created_at")) or datetime.utcnow(),
        ))
        inserted += 1
    db.commit()
    return inserted


def load_hr_feedback(db, rows) -> int:
    email_map = _email_to_id(db)
    inserted = 0
    for row in rows:
        cid = _resolve_candidate_id(row, email_map)
        if cid is None:
            continue
        rating = _int(row.get("rating"), 0)
        rating = max(1, min(5, rating)) if rating else 3
        db.add(models.HRFeedback(
            candidate_id=cid,
            agent_output_id=_int(row.get("agent_output_id")) or None,
            hr_name=_str(row.get("hr_name")) or "Unknown",
            rating=rating,
            decision_alignment=_bool(row.get("decision_alignment")),
            useful_output=_bool(row.get("useful_output")),
            bias_flagged=_bool(row.get("bias_flagged")),
            feedback_comment=_str(row.get("feedback_comment")),
            corrected_recommendation=_str(row.get("corrected_recommendation")),
            reviewed_at=_dt(row.get("reviewed_at")) or datetime.utcnow(),
        ))
        inserted += 1
    db.commit()
    return inserted


LOADERS = [
    ("candidates.csv", load_candidates),
    ("assessments.csv", load_assessments),
    ("interview_schedules.csv", load_interviews),
    ("final_decisions.csv", load_decisions),
    ("agent_outputs.csv", load_agent_outputs),
    ("hr_feedback.csv", load_hr_feedback),
]


def main() -> None:
    print("=" * 70)
    print(" Recruiter-AI — CSV Seed Script")
    print(f" Database: {settings.DATABASE_URL.split('@')[-1].split('/')[0]}")
    print(f" CSV dir : {CSV_DIR}")
    print("=" * 70)

    print("\n→ Ensuring database tables exist...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables ready")

    print("\n→ Importing CSV files...\n")
    db = SessionLocal()
    try:
        for filename, loader in LOADERS:
            path = CSV_DIR / filename
            if not path.exists():
                print(f"⚠️  {filename}: not found, skipping")
                continue
            try:
                rows = _read_csv(path)
                inserted = loader(db, rows)
                print(f"✅ {filename}: inserted {inserted} rows")
            except Exception as exc:
                db.rollback()
                print(f"❌ {filename}: {exc}")
    finally:
        db.close()

    print("\n✅ Seed complete\n")


if __name__ == "__main__":
    main()
