"""
HR feedback endpoints (read + create).
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/hr-feedback", tags=["HR Feedback"])


@router.get("", response_model=List[schemas.HRFeedbackOut])
def list_all(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(500, ge=1, le=2000),
):
    return (
        db.query(models.HRFeedback)
        .order_by(models.HRFeedback.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.post("", response_model=schemas.HRFeedbackOut, status_code=201)
def create_feedback(payload: schemas.HRFeedbackCreate, db: Session = Depends(get_db)):
    if not db.get(models.Candidate, payload.candidate_id):
        raise HTTPException(404, "Candidate not found")
    if payload.agent_output_id and not db.get(models.AgentOutput, payload.agent_output_id):
        raise HTTPException(404, "Agent output not found")
    obj = models.HRFeedback(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj