"""Candidate endpoints."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

import app.models as models
import app.schemas as schemas
from app.database import get_db

router = APIRouter(prefix="/api/candidates", tags=["Candidates"])


@router.get("", response_model=List[schemas.CandidateOut])
def list_candidates(
    db: Session = Depends(get_db),
    q: Optional[str] = Query(None, description="Search name/email/role"),
    department: Optional[str] = None,
    role: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(200, ge=1, le=1000),
):
    query = db.query(models.Candidate)
    if q:
        like = f"%{q}%"
        query = query.filter(or_(
            models.Candidate.full_name.ilike(like),
            models.Candidate.email.ilike(like),
            models.Candidate.role_applied.ilike(like),
        ))
    if department:
        query = query.filter(models.Candidate.department == department)
    if role:
        query = query.filter(models.Candidate.role_applied == role)
    return query.order_by(models.Candidate.id.desc()).offset(skip).limit(limit).all()


@router.get("/{candidate_id}", response_model=schemas.CandidateOut)
def get_candidate(candidate_id: int, db: Session = Depends(get_db)):
    obj = db.get(models.Candidate, candidate_id)
    if not obj:
        raise HTTPException(404, "Candidate not found")
    return obj


@router.post("", response_model=schemas.CandidateOut, status_code=201)
def create_candidate(payload: schemas.CandidateCreate, db: Session = Depends(get_db)):
    if db.query(models.Candidate).filter_by(email=payload.email).first():
        raise HTTPException(409, "Email already registered")
    obj = models.Candidate(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj