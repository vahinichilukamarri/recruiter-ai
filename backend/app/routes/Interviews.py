"""
Interview schedule endpoints with status filters.
"""
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/interviews", tags=["Interviews"])


def _filter_by_status(db: Session, status: models.InterviewStatus, skip: int, limit: int):
    return (
        db.query(models.InterviewSchedule)
        .filter(models.InterviewSchedule.status == status)
        .order_by(models.InterviewSchedule.scheduled_date.desc().nullslast(),
                  models.InterviewSchedule.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("", response_model=List[schemas.InterviewOut])
def list_all(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(500, ge=1, le=2000),
):
    return (
        db.query(models.InterviewSchedule)
        .order_by(models.InterviewSchedule.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/scheduled", response_model=List[schemas.InterviewOut])
def list_scheduled(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(500, ge=1, le=2000),
):
    return _filter_by_status(db, models.InterviewStatus.Scheduled, skip, limit)


@router.get("/completed", response_model=List[schemas.InterviewOut])
def list_completed(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(500, ge=1, le=2000),
):
    return _filter_by_status(db, models.InterviewStatus.Completed, skip, limit)


@router.get("/in-progress", response_model=List[schemas.InterviewOut])
def list_in_progress(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(500, ge=1, le=2000),
):
    return _filter_by_status(db, models.InterviewStatus.InProgress, skip, limit)