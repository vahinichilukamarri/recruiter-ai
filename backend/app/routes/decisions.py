"""Final decision endpoints."""

from typing import List
from datetime import datetime, UTC

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

import app.models as models
import app.schemas as schemas
from app.database import get_db

router = APIRouter(
    prefix="/api/final-decisions",
    tags=["Final Decisions"],
)


# ---------------------------------------------------
# Helper
# ---------------------------------------------------
def _by_decision(
    db: Session,
    dec: models.FinalDecisionEnum,
    skip: int,
    limit: int,
):
    return (
        db.query(models.FinalDecision)
        .filter(models.FinalDecision.final_decision == dec)
        .order_by(
            models.FinalDecision.decided_at.desc().nullslast(),
            models.FinalDecision.id.desc(),
        )
        .offset(skip)
        .limit(limit)
        .all()
    )


# ---------------------------------------------------
# GET ALL
# ---------------------------------------------------
@router.get("", response_model=List[schemas.FinalDecisionOut])
def list_all(
    db: Session = Depends(get_db),
    human_only: bool = Query(False),
    skip: int = Query(0, ge=0),
    limit: int = Query(500, ge=1, le=2000),
):
    q = db.query(models.FinalDecision)

    if human_only:
        q = q.filter(
            models.FinalDecision.human_final_decision.is_(True)
        )

    return (
        q.order_by(models.FinalDecision.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


# ---------------------------------------------------
# GET SELECTED
# ---------------------------------------------------
@router.get("/selected", response_model=List[schemas.FinalDecisionOut])
def list_selected(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(500, ge=1, le=2000),
):
    return _by_decision(
        db,
        models.FinalDecisionEnum.Selected,
        skip,
        limit,
    )


# ---------------------------------------------------
# GET REJECTED
# ---------------------------------------------------
@router.get("/rejected", response_model=List[schemas.FinalDecisionOut])
def list_rejected(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(500, ge=1, le=2000),
):
    return _by_decision(
        db,
        models.FinalDecisionEnum.Rejected,
        skip,
        limit,
    )


# ---------------------------------------------------
# GET HOLD
# ---------------------------------------------------
@router.get("/hold", response_model=List[schemas.FinalDecisionOut])
def list_hold(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(500, ge=1, le=2000),
):
    return _by_decision(
        db,
        models.FinalDecisionEnum.Hold,
        skip,
        limit,
    )


# ---------------------------------------------------
# PUT UPDATE / UPSERT
# ---------------------------------------------------
@router.put("/{candidate_id}")
def update_final_decision(
    candidate_id: int,
    payload: dict,
    db: Session = Depends(get_db),
):
    # validate candidate exists
    candidate = (
        db.query(models.Candidate)
        .filter(models.Candidate.id == candidate_id)
        .first()
    )

    if not candidate:
        raise HTTPException(
            status_code=404,
            detail="Candidate not found",
        )

    decision = (
        db.query(models.FinalDecision)
        .filter(
            models.FinalDecision.candidate_id == candidate_id
        )
        .first()
    )

    decision_value = payload.get(
        "final_decision",
        "Hold",
    )

    # enum conversion
    try:
        decision_enum = models.FinalDecisionEnum(
            decision_value
        )
    except:
        raise HTTPException(
            status_code=400,
            detail="Invalid final_decision",
        )

    # UPDATE EXISTING
    if decision:
        decision.final_decision = decision_enum
        decision.human_final_decision = payload.get(
            "human_final_decision",
            True,
        )
        decision.recruiter_name = payload.get(
            "recruiter_name",
            decision.recruiter_name,
        )
        decision.decision_notes = payload.get(
            "decision_notes",
            decision.decision_notes,
        )
        decision.decided_at = datetime.now(UTC)

    # CREATE NEW
    else:
        decision = models.FinalDecision(
            candidate_id=candidate_id,
            recruiter_name=payload.get(
                "recruiter_name",
                "Recruiter",
            ),
            final_decision=decision_enum,
            human_final_decision=payload.get(
                "human_final_decision",
                True,
            ),
            decision_notes=payload.get(
                "decision_notes",
                "",
            ),
            decided_at=datetime.now(UTC),
        )

        db.add(decision)

    db.commit()
    db.refresh(decision)

    return {
        "message": "Final decision updated",
        "candidate_id": candidate_id,
        "final_decision": decision.final_decision.value,
        "human_final_decision": decision.human_final_decision,
    }