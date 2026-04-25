"""
CSV → PostgreSQL loader.

Reads CSV files from the configured CSV_DIR and bulk-inserts rows
through SQLAlchemy. Skips duplicates by primary key / unique key
and resolves foreign keys by either explicit candidate_id column
or candidate email.
"""
from pathlib import Path
from typing import Dict, Any, Callable, List
import os

import pandas as pd
from sqlalchemy.orm import Session

from app.config import settings
from app import models
from app.utils import (
    safe_str, safe_int, safe_float, safe_bool,
    parse_dt, parse_date, parse_time,
)


# ─────────── helpers ───────────

def _read_csv(path: Path) -> pd.DataFrame:
    df = pd.read_csv(path)
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    return df


def _candidate_id_lookup(db: Session) -> Dict[str, int]:
    """email → candidate_id"""
    rows = db.query(models.Candidate.email, models.Candidate.id).all()
    return {e: i for e, i in rows}


def _resolve_candidate_id(row: dict, email_to_id: Dict[str, int]) -> int | None:
    cid = safe_int(row.get("candidate_id"), default=0)
    if cid:
        return cid
    email = safe_str(row.get("email") or row.get("candidate_email"))
    if email and email in email_to_id:
        return email_to_id[email]
    return None


# ─────────── per-table loaders ───────────

def load_candidates(db: Session, df: pd.DataFrame) -> int:
    existing = {e for (e,) in db.query(models.Candidate.email).all()}
    inserted = 0
    for _, row in df.iterrows():
        d = row.to_dict()
        email = safe_str(d.get("email"))
        if not email or email in existing:
            continue
        obj = models.Candidate(
            full_name=safe_str(d.get("full_name") or d.get("name")) or "Unknown",
            email=email,
            phone=safe_str(d.get("phone")),
            role_applied=safe_str(d.get("role_applied") or d.get("role")),
            department=safe_str(d.get("department") or d.get("dept")),
            experience_years=safe_float(d.get("experience_years") or d.get("experience"), 0.0),
            created_at=parse_dt(d.get("created_at")) or None,
        )
        if obj.created_at is None:
            obj.created_at = None  # let DB default fire
            obj.created_at = __import__("datetime").datetime.utcnow()
        db.add(obj)
        existing.add(email)
        inserted += 1
    db.commit()
    return inserted


def load_assessments(db: Session, df: pd.DataFrame) -> int:
    email_to_id = _candidate_id_lookup(db)
    inserted = 0
    for _, row in df.iterrows():
        d = row.to_dict()
        cid = _resolve_candidate_id(d, email_to_id)
        if cid is None:
            continue
        obj = models.Assessment(
            candidate_id=cid,
            total_questions=safe_int(d.get("total_questions")),
            attempted_questions=safe_int(d.get("attempted_questions")),
            correct_answers=safe_int(d.get("correct_answers")),
            wrong_answers=safe_int(d.get("wrong_answers")),
            unanswered=safe_int(d.get("unanswered")),
            mcq_score_percent=safe_float(d.get("mcq_score_percent") or d.get("score_percent")),
            time_taken_seconds=safe_int(d.get("time_taken_seconds")),
            resume_match_percent=safe_float(d.get("resume_match_percent")),
            jd_skill_match_percent=safe_float(d.get("jd_skill_match_percent")),
            submitted_at=parse_dt(d.get("submitted_at")) or __import__("datetime").datetime.utcnow(),
        )
        db.add(obj)
        inserted += 1
    db.commit()
    return inserted


def load_interviews(db: Session, df: pd.DataFrame) -> int:
    email_to_id = _candidate_id_lookup(db)
    valid_status = {s.value for s in models.InterviewStatus}
    inserted = 0
    for _, row in df.iterrows():
        d = row.to_dict()
        cid = _resolve_candidate_id(d, email_to_id)
        if cid is None:
            continue
        status_raw = safe_str(d.get("status")) or "Scheduled"
        status_val = status_raw if status_raw in valid_status else "Scheduled"
        obj = models.InterviewSchedule(
            candidate_id=cid,
            interviewer_name=safe_str(d.get("interviewer_name")),
            interview_mode=safe_str(d.get("interview_mode") or d.get("mode")),
            scheduled_date=parse_date(d.get("scheduled_date") or d.get("date")),
            scheduled_time=parse_time(d.get("scheduled_time") or d.get("time")),
            status=models.InterviewStatus(status_val),
            meeting_link=safe_str(d.get("meeting_link") or d.get("link")),
            notes=safe_str(d.get("notes")),
            created_at=parse_dt(d.get("created_at")) or __import__("datetime").datetime.utcnow(),
        )
        db.add(obj)
        inserted += 1
    db.commit()
    return inserted


def load_decisions(db: Session, df: pd.DataFrame) -> int:
    email_to_id = _candidate_id_lookup(db)
    valid = {s.value for s in models.FinalDecisionEnum}
    inserted = 0
    for _, row in df.iterrows():
        d = row.to_dict()
        cid = _resolve_candidate_id(d, email_to_id)
        if cid is None:
            continue
        dec_raw = safe_str(d.get("final_decision") or d.get("decision")) or "Hold"
        dec_val = dec_raw if dec_raw in valid else "Hold"
        obj = models.FinalDecision(
            candidate_id=cid,
            recruiter_name=safe_str(d.get("recruiter_name")),
            final_decision=models.FinalDecisionEnum(dec_val),
            human_final_decision=safe_bool(d.get("human_final_decision"), False),
            decision_notes=safe_str(d.get("decision_notes") or d.get("notes")),
            decided_at=parse_dt(d.get("decided_at")) or __import__("datetime").datetime.utcnow(),
        )
        db.add(obj)
        inserted += 1
    db.commit()
    return inserted


def load_agent_outputs(db: Session, df: pd.DataFrame) -> int:
    email_to_id = _candidate_id_lookup(db)
    inserted = 0
    for _, row in df.iterrows():
        d = row.to_dict()
        cid = _resolve_candidate_id(d, email_to_id)
        if cid is None:
            continue
        obj = models.AgentOutput(
            candidate_id=cid,
            recommendation=safe_str(d.get("recommendation")),
            confidence_score=safe_float(d.get("confidence_score")),
            strengths=safe_str(d.get("strengths")),
            concerns=safe_str(d.get("concerns")),
            summary=safe_str(d.get("summary")),
            next_step=safe_str(d.get("next_step")),
            created_at=parse_dt(d.get("created_at")) or __import__("datetime").datetime.utcnow(),
        )
        db.add(obj)
        inserted += 1
    db.commit()
    return inserted


def load_hr_feedback(db: Session, df: pd.DataFrame) -> int:
    email_to_id = _candidate_id_lookup(db)
    inserted = 0
    for _, row in df.iterrows():
        d = row.to_dict()
        cid = _resolve_candidate_id(d, email_to_id)
        if cid is None:
            continue
        rating = safe_int(d.get("rating"), 0)
        rating = max(1, min(5, rating)) if rating else 0
        obj = models.HRFeedback(
            candidate_id=cid,
            agent_output_id=safe_int(d.get("agent_output_id")) or None,
            hr_name=safe_str(d.get("hr_name")) or "Unknown",
            rating=rating or 3,
            decision_alignment=safe_bool(d.get("decision_alignment")),
            useful_output=safe_bool(d.get("useful_output")),
            bias_flagged=safe_bool(d.get("bias_flagged")),
            feedback_comment=safe_str(d.get("feedback_comment")),
            corrected_recommendation=safe_str(d.get("corrected_recommendation")),
            reviewed_at=parse_dt(d.get("reviewed_at")) or __import__("datetime").datetime.utcnow(),
        )
        db.add(obj)
        inserted += 1
    db.commit()
    return inserted


# ─────────── orchestrator ───────────

LOADERS: List[tuple[str, Callable[[Session, pd.DataFrame], int]]] = [
    ("candidates.csv", load_candidates),
    ("assessments.csv", load_assessments),
    ("interview_schedules.csv", load_interviews),
    ("final_decisions.csv", load_decisions),
    ("agent_outputs.csv", load_agent_outputs),
    ("hr_feedback.csv", load_hr_feedback),
]


def run_csv_import(db: Session, csv_dir: str | None = None) -> Dict[str, Any]:
    """
    Run all CSV loaders in dependency order. Returns a per-file report.
    Files that don't exist are silently skipped.
    """
    base = Path(csv_dir or settings.CSV_DIR)
    report: Dict[str, Any] = {}
    for filename, loader in LOADERS:
        path = base / filename
        if not path.exists():
            report[filename] = {"status": "skipped (file not found)", "rows": 0}
            print(f"⚠️  {filename} not found at {path}, skipping")
            continue
        try:
            df = _read_csv(path)
            inserted = loader(db, df)
            report[filename] = {"status": "ok", "rows": inserted}
            print(f"✅ {filename}: inserted {inserted} rows")
        except Exception as exc:  # pragma: no cover
            db.rollback()
            report[filename] = {"status": f"error: {exc}", "rows": 0}
            print(f"❌ {filename}: {exc}")
    return report