"""
Final decision endpoints with status filters.
"""
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/final-decisions", tags=["Final Decisions"])


def _by_decision(db: Session, dec: models.FinalDecisionEnum, skip: int, limit: int):
    return (
        db.query(models.FinalDecision)
        .filter(models.FinalDecision.final_decision == dec)
        .order_by(models.FinalDecision.decided_at.desc().nullslast(),
                  models.FinalDecision.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("", response_model=List[schemas.FinalDecisionOut])
def list_all(
    db: Session = Depends(get_db),
    human_only: bool = Query(False, description="Only return rows where human_final_decision is true"),
    skip: int = Query(0, ge=0),
    limit: int = Query(500, ge=1, le=2000),
):
    q = db.query(models.FinalDecision)
    if human_only:
        q = q.filter(models.FinalDecision.human_final_decision.is_(True))
    return q.order_by(models.FinalDecision.id.desc()).offset(skip).limit(limit).all()


@router.get("/selected", response_model=List[schemas.FinalDecisionOut])
def list_selected(db: Session = Depends(get_db),
                  skip: int = Query(0, ge=0),
                  limit: int = Query(500, ge=1, le=2000)):
    return _by_decision(db, models.FinalDecisionEnum.Selected, skip, limit)


@router.get("/rejected", response_model=List[schemas.FinalDecisionOut])
def list_rejected(db: Session = Depends(get_db),
                  skip: int = Query(0, ge=0),
                  limit: int = Query(500, ge=1, le=2000)):
    return _by_decision(db, models.FinalDecisionEnum.Rejected, skip, limit)


@router.get("/hold", response_model=List[schemas.FinalDecisionOut])
def list_hold(db: Session = Depends(get_db),
              skip: int = Query(0, ge=0),
              limit: int = Query(500, ge=1, le=2000)):
    return _by_decision(db, models.FinalDecisionEnum.Hold, skip, limit)