"""
Aggregation queries that power the dashboard charts and KPIs.
All functions accept a session and return JSON-serializable data.
"""
from datetime import datetime, timedelta
from typing import List, Dict, Any

from sqlalchemy import func, case
from sqlalchemy.orm import Session

from app import models


# ─────────── KPIs ───────────

def dashboard_summary(db: Session) -> Dict[str, Any]:
    total_candidates = db.query(func.count(models.Candidate.id)).scalar() or 0

    sel = db.query(func.count(models.FinalDecision.id))\
        .filter(models.FinalDecision.final_decision == models.FinalDecisionEnum.Selected).scalar() or 0
    rej = db.query(func.count(models.FinalDecision.id))\
        .filter(models.FinalDecision.final_decision == models.FinalDecisionEnum.Rejected).scalar() or 0
    hold = db.query(func.count(models.FinalDecision.id))\
        .filter(models.FinalDecision.final_decision == models.FinalDecisionEnum.Hold).scalar() or 0

    intv_sched = db.query(func.count(models.InterviewSchedule.id))\
        .filter(models.InterviewSchedule.status == models.InterviewStatus.Scheduled).scalar() or 0
    intv_done = db.query(func.count(models.InterviewSchedule.id))\
        .filter(models.InterviewSchedule.status == models.InterviewStatus.Completed).scalar() or 0

    avg_mcq = db.query(func.coalesce(func.avg(models.Assessment.mcq_score_percent), 0.0)).scalar() or 0.0

    return {
        "total_candidates": int(total_candidates),
        "total_selected": int(sel),
        "total_rejected": int(rej),
        "total_hold": int(hold),
        "interviews_scheduled": int(intv_sched),
        "interviews_completed": int(intv_done),
        "avg_mcq_score": round(float(avg_mcq), 2),
    }


# ─────────── PIE: decisions ───────────

def decision_pie(db: Session) -> List[Dict[str, Any]]:
    rows = (
        db.query(models.FinalDecision.final_decision, func.count(models.FinalDecision.id))
        .group_by(models.FinalDecision.final_decision)
        .all()
    )
    out = {"Selected": 0, "Rejected": 0, "Hold": 0}
    for label, count in rows:
        if label is None:
            continue
        key = label.value if hasattr(label, "value") else str(label)
        out[key] = int(count or 0)
    return [{"label": k, "value": v} for k, v in out.items()]


# ─────────── PIE: interview status ───────────

def interview_status_pie(db: Session) -> List[Dict[str, Any]]:
    rows = (
        db.query(models.InterviewSchedule.status, func.count(models.InterviewSchedule.id))
        .group_by(models.InterviewSchedule.status)
        .all()
    )
    out = {"Scheduled": 0, "In Progress": 0, "Completed": 0, "Cancelled": 0}
    for label, count in rows:
        if label is None:
            continue
        key = label.value if hasattr(label, "value") else str(label)
        out[key] = int(count or 0)
    return [{"label": k, "value": v} for k, v in out.items()]


# ─────────── BAR: candidates by department ───────────

def department_bar(db: Session) -> List[Dict[str, Any]]:
    rows = (
        db.query(
            func.coalesce(models.Candidate.department, "Unspecified"),
            func.count(models.Candidate.id),
        )
        .group_by(models.Candidate.department)
        .order_by(func.count(models.Candidate.id).desc())
        .all()
    )
    return [{"label": label, "value": int(count or 0)} for label, count in rows]


# ─────────── BAR: MCQ score buckets ───────────

def mcq_distribution(db: Session) -> List[Dict[str, Any]]:
    """
    Bucket distribution: 0-20, 21-40, 41-60, 61-80, 81-100.
    """
    bucket_expr = case(
        (models.Assessment.mcq_score_percent <= 20, "0-20"),
        (models.Assessment.mcq_score_percent <= 40, "21-40"),
        (models.Assessment.mcq_score_percent <= 60, "41-60"),
        (models.Assessment.mcq_score_percent <= 80, "61-80"),
        else_="81-100",
    )
    rows = (
        db.query(bucket_expr.label("bucket"), func.count(models.Assessment.id))
        .group_by("bucket")
        .all()
    )
    out = {b: 0 for b in ("0-20", "21-40", "41-60", "61-80", "81-100")}
    for label, count in rows:
        if label is not None:
            out[label] = int(count or 0)
    return [{"label": k, "value": out[k]} for k in ("0-20", "21-40", "41-60", "61-80", "81-100")]


# ─────────── LINE: weekly trend ───────────

def weekly_trend(db: Session, weeks: int = 8) -> List[Dict[str, Any]]:
    """
    Candidates created per ISO week, oldest → newest, last `weeks` weeks.
    """
    cutoff = datetime.utcnow() - timedelta(weeks=weeks)
    rows = (
        db.query(models.Candidate.created_at)
        .filter(models.Candidate.created_at >= cutoff)
        .all()
    )
    buckets: Dict[str, int] = {}
    for (dt,) in rows:
        if dt is None:
            continue
        # ISO week start (Monday)
        monday = (dt - timedelta(days=dt.weekday())).date()
        key = monday.isoformat()
        buckets[key] = buckets.get(key, 0) + 1

    sorted_keys = sorted(buckets.keys())[-weeks:]
    return [{"label": k, "value": buckets[k]} for k in sorted_keys]