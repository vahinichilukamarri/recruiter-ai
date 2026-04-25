"""Assessment endpoints."""
from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

import app.models as models
import app.schemas as schemas
from app.database import get_db

router = APIRouter(prefix="/api/assessments", tags=["Assessments"])


@router.get("", response_model=List[schemas.AssessmentOut])
def list_assessments(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(200, ge=1, le=1000),
):
    return (
        db.query(models.Assessment)
        .order_by(models.Assessment.id.desc())
        .offset(skip).limit(limit).all()
    )


@router.get("/{candidate_id}", response_model=List[schemas.AssessmentOut])
def get_for_candidate(candidate_id: int, db: Session = Depends(get_db)):
    if not db.get(models.Candidate, candidate_id):
        raise HTTPException(404, "Candidate not found")
    return (
        db.query(models.Assessment)
        .filter(models.Assessment.candidate_id == candidate_id)
        .order_by(models.Assessment.submitted_at.desc())
        .all()
    )