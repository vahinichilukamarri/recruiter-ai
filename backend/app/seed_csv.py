"""
Standalone CSV seed script.

Run:
    python -m app.seed_csv
"""

import sys
import csv
import math
from pathlib import Path
from datetime import datetime, date, time, UTC
from typing import Any, Optional, Dict

# --------------------------------------------------
# PROJECT ROOT
# --------------------------------------------------
ROOT = Path(__file__).resolve().parent.parent

if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

# --------------------------------------------------
# IMPORTS
# --------------------------------------------------
from app.config import settings
from app.database import Base, engine, SessionLocal
import app.models as models

# --------------------------------------------------
# CSV DIRECTORY
# --------------------------------------------------
CSV_DIR = ROOT / "csv"


# ==================================================
# HELPERS
# ==================================================
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
    except:
        return default


def _float(v: Any, default: float = 0.0) -> float:
    try:
        if v is None or v == "":
            return default
        f = float(v)
        if math.isnan(f):
            return default
        return f
    except:
        return default


def _bool(v: Any, default=False) -> bool:
    if v is None or v == "":
        return default

    s = str(v).strip().lower()

    if s in ["true", "1", "yes", "y"]:
        return True

    if s in ["false", "0", "no", "n"]:
        return False

    return default


def _dt(v: Any) -> Optional[datetime]:
    if v is None or v == "":
        return None

    if isinstance(v, datetime):
        return v

    s = str(v).strip()

    formats = [
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d %H:%M",
        "%Y-%m-%d",
        "%d/%m/%Y",
        "%m/%d/%Y",
    ]

    for fmt in formats:
        try:
            return datetime.strptime(s, fmt)
        except:
            pass

    return None


def _date(v: Any) -> Optional[date]:
    d = _dt(v)
    return d.date() if d else None


def _time(v: Any) -> Optional[time]:
    if v is None or v == "":
        return None

    s = str(v).strip()

    formats = [
        "%H:%M:%S",
        "%H:%M",
        "%I:%M %p",
    ]

    for fmt in formats:
        try:
            return datetime.strptime(s, fmt).time()
        except:
            pass

    return None


def now_utc():
    return datetime.now(UTC)


def _read_csv(path: Path):
    rows = []

    with path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)

        for row in reader:
            normalized = {
                (k or "").strip().lower().replace(" ", "_"): v
                for k, v in row.items()
            }

            rows.append(normalized)

    return rows


def _email_to_id(db) -> Dict[str, int]:
    return {
        email: cid
        for email, cid in db.query(
            models.Candidate.email,
            models.Candidate.id,
        ).all()
    }


def _resolve_candidate_id(row, email_map):
    cid = _int(row.get("candidate_id"), 0)

    if cid:
        return cid

    email = _str(row.get("email"))

    if email and email in email_map:
        return email_map[email]

    return None


# ==================================================
# LOADERS
# ==================================================
def load_candidates(db, rows):
    existing = {
        e for (e,) in db.query(
            models.Candidate.email
        ).all()
    }

    inserted = 0

    for row in rows:
        email = _str(row.get("email"))

        if not email or email in existing:
            continue

        db.add(
            models.Candidate(
                full_name=_str(row.get("full_name")) or "Unknown",
                email=email,
                phone=_str(row.get("phone")),
                role_applied=_str(row.get("role_applied")),
                department=_str(row.get("department")),
                experience_years=_float(
                    row.get("experience_years")
                ),
                created_at=_dt(row.get("created_at")) or now_utc(),
            )
        )

        inserted += 1
        existing.add(email)

    db.commit()
    return inserted


def load_assessments(db, rows):
    email_map = _email_to_id(db)
    inserted = 0

    for row in rows:
        cid = _resolve_candidate_id(row, email_map)

        if cid is None:
            continue

        db.add(
            models.Assessment(
                candidate_id=cid,
                total_questions=_int(row.get("total_questions")),
                attempted_questions=_int(
                    row.get("attempted_questions")
                ),
                correct_answers=_int(
                    row.get("correct_answers")
                ),
                wrong_answers=_int(
                    row.get("wrong_answers")
                ),
                unanswered=_int(row.get("unanswered")),
                mcq_score_percent=_float(
                    row.get("mcq_score_percent")
                ),
                time_taken_seconds=_int(
                    row.get("time_taken_seconds")
                ),
                resume_match_percent=_float(
                    row.get("resume_match_percent")
                ),
                jd_skill_match_percent=_float(
                    row.get("jd_skill_match_percent")
                ),
                submitted_at=_dt(
                    row.get("submitted_at")
                ) or now_utc(),
            )
        )

        inserted += 1

    db.commit()
    return inserted


def load_interviews(db, rows):
    email_map = _email_to_id(db)
    inserted = 0

    for row in rows:
        cid = _resolve_candidate_id(row, email_map)

        if cid is None:
            continue

        db.add(
            models.InterviewSchedule(
                candidate_id=cid,
                interviewer_name=_str(
                    row.get("interviewer_name")
                ),
                interview_mode=_str(
                    row.get("interview_mode")
                ),
                scheduled_date=_date(
                    row.get("scheduled_date")
                ),
                scheduled_time=_time(
                    row.get("scheduled_time")
                ),
                status=row.get("status") or "Scheduled",
                meeting_link=_str(
                    row.get("meeting_link")
                ),
                notes=_str(row.get("notes")),
                created_at=_dt(
                    row.get("created_at")
                ) or now_utc(),
            )
        )

        inserted += 1

    db.commit()
    return inserted


def load_decisions(db, rows):
    email_map = _email_to_id(db)
    inserted = 0

    for row in rows:
        cid = _resolve_candidate_id(row, email_map)

        if cid is None:
            continue

        db.add(
            models.FinalDecision(
                candidate_id=cid,
                recruiter_name=_str(
                    row.get("recruiter_name")
                ),
                final_decision=row.get(
                    "final_decision"
                )
                or "Hold",
                human_final_decision=_bool(
                    row.get(
                        "human_final_decision"
                    )
                ),
                decision_notes=_str(
                    row.get("decision_notes")
                ),
                decided_at=_dt(
                    row.get("decided_at")
                ) or now_utc(),
            )
        )

        inserted += 1

    db.commit()
    return inserted


def load_agent_outputs(db, rows):
    email_map = _email_to_id(db)
    inserted = 0

    for row in rows:
        cid = _resolve_candidate_id(row, email_map)

        if cid is None:
            continue

        db.add(
            models.AgentOutput(
                candidate_id=cid,
                recommendation=_str(
                    row.get("recommendation")
                ),
                confidence_score=_float(
                    row.get("confidence_score")
                ),
                strengths=_str(
                    row.get("strengths")
                ),
                concerns=_str(
                    row.get("concerns")
                ),
                summary=_str(row.get("summary")),
                next_step=_str(
                    row.get("next_step")
                ),
                created_at=_dt(
                    row.get("created_at")
                ) or now_utc(),
            )
        )

        inserted += 1

    db.commit()
    return inserted


def load_hr_feedback(db, rows):
    email_map = _email_to_id(db)
    inserted = 0

    for row in rows:
        cid = _resolve_candidate_id(row, email_map)

        if cid is None:
            continue

        db.add(
            models.HRFeedback(
                candidate_id=cid,
                hr_name=_str(
                    row.get("hr_name")
                )
                or "Unknown",
                rating=_int(
                    row.get("rating"),
                    3,
                ),
                decision_alignment=_bool(
                    row.get(
                        "decision_alignment"
                    )
                ),
                useful_output=_bool(
                    row.get("useful_output")
                ),
                bias_flagged=_bool(
                    row.get("bias_flagged")
                ),
                feedback_comment=_str(
                    row.get(
                        "feedback_comment"
                    )
                ),
                corrected_recommendation=_str(
                    row.get(
                        "corrected_recommendation"
                    )
                ),
                reviewed_at=_dt(
                    row.get("reviewed_at")
                ) or now_utc(),
            )
        )

        inserted += 1

    db.commit()
    return inserted


# ==================================================
# FILE MAP
# ==================================================
LOADERS = [
    ("candidates.csv", load_candidates),
    ("assessments.csv", load_assessments),
    ("interview_schedules.csv", load_interviews),
    ("final_decisions.csv", load_decisions),
    ("agent_outputs.csv", load_agent_outputs),
    ("hr_feedback.csv", load_hr_feedback),
]


# ==================================================
# MAIN
# ==================================================
def main():
    print("=" * 70)
    print(" Recruiter-AI CSV Seeder")
    print(
        f" Database: {settings.DATABASE_URL.split('@')[-1].split('/')[0]}"
    )
    print(f" CSV Dir : {CSV_DIR}")
    print("=" * 70)

    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        for filename, loader in LOADERS:
            path = CSV_DIR / filename

            if not path.exists():
                print(f"⚠ {filename}: missing")
                continue

            try:
                rows = _read_csv(path)
                inserted = loader(db, rows)

                print(
                    f"✅ {filename}: inserted {inserted}"
                )

            except Exception as exc:
                db.rollback()
                print(
                    f"❌ {filename}: {exc}"
                )

    finally:
        db.close()

    print("\n✅ Seed complete")


if __name__ == "__main__":
    main()