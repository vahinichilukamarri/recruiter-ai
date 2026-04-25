"""
Pydantic schemas (request/response payloads).
"""
from __future__ import annotations
from datetime import datetime, date, time
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ───────────────────── CANDIDATES ─────────────────────

class CandidateBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    role_applied: Optional[str] = None
    department: Optional[str] = None
    experience_years: Optional[float] = 0.0


class CandidateCreate(CandidateBase):
    pass


class CandidateUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    role_applied: Optional[str] = None
    department: Optional[str] = None
    experience_years: Optional[float] = None


class CandidateOut(CandidateBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ───────────────────── ASSESSMENTS ─────────────────────

class AssessmentOut(BaseModel):
    id: int
    candidate_id: int
    total_questions: int
    attempted_questions: int
    correct_answers: int
    wrong_answers: int
    unanswered: int
    mcq_score_percent: float
    time_taken_seconds: int
    resume_match_percent: float
    jd_skill_match_percent: float
    submitted_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ───────────────────── INTERVIEWS ─────────────────────

class InterviewOut(BaseModel):
    id: int
    candidate_id: int
    interviewer_name: Optional[str] = None
    interview_mode: Optional[str] = None
    scheduled_date: Optional[date] = None
    scheduled_time: Optional[time] = None
    status: Optional[str] = None
    meeting_link: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ───────────────────── FINAL DECISIONS ─────────────────────

class FinalDecisionOut(BaseModel):
    id: int
    candidate_id: int
    recruiter_name: Optional[str] = None
    final_decision: Optional[str] = None
    human_final_decision: bool
    decision_notes: Optional[str] = None
    decided_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ───────────────────── AGENT OUTPUTS ─────────────────────

class AgentOutputOut(BaseModel):
    id: int
    candidate_id: int
    recommendation: Optional[str] = None
    confidence_score: float
    strengths: Optional[str] = None
    concerns: Optional[str] = None
    summary: Optional[str] = None
    next_step: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ───────────────────── HR FEEDBACK ─────────────────────

class HRFeedbackBase(BaseModel):
    candidate_id: int
    agent_output_id: Optional[int] = None
    hr_name: str
    rating: int = Field(ge=1, le=5)
    decision_alignment: bool = False
    useful_output: bool = False
    bias_flagged: bool = False
    feedback_comment: Optional[str] = None
    corrected_recommendation: Optional[str] = None


class HRFeedbackCreate(HRFeedbackBase):
    pass


class HRFeedbackOut(HRFeedbackBase):
    id: int
    reviewed_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ───────────────────── ANALYTICS ─────────────────────

class DashboardSummary(BaseModel):
    total_candidates: int
    total_selected: int
    total_rejected: int
    total_hold: int
    interviews_scheduled: int
    interviews_completed: int
    avg_mcq_score: float


class PieSlice(BaseModel):
    label: str
    value: int


class BarBucket(BaseModel):
    label: str
    value: int


class TrendPoint(BaseModel):
    label: str   # ISO week-start date
    value: int