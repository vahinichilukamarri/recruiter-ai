"""
Agent (AI) output endpoints.
"""
from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/agent-output", tags=["Agent Outputs"])


@router.get("", response_model=List[schemas.AgentOutputOut])
def list_all(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(500, ge=1, le=2000),
):
    return (
        db.query(models.AgentOutput)
        .order_by(models.AgentOutput.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/{candidate_id}", response_model=List[schemas.AgentOutputOut])
def get_for_candidate(candidate_id: int, db: Session = Depends(get_db)):
    if not db.get(models.Candidate, candidate_id):
        raise HTTPException(404, "Candidate not found")
    return (
        db.query(models.AgentOutput)
        .filter(models.AgentOutput.candidate_id == candidate_id)
        .order_by(models.AgentOutput.created_at.desc())
        .all()
    )