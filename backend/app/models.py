"""
SQLAlchemy ORM models for the Recruiter-AI platform.
"""
from datetime import datetime
import enum

from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text,
    DateTime, Date, Time, ForeignKey, Enum as SAEnum,
)
from sqlalchemy.orm import relationship

from app.database import Base


# ───────────────────── ENUMS ─────────────────────

class InterviewStatus(str, enum.Enum):
    Scheduled = "Scheduled"
    InProgress = "In Progress"
    Completed = "Completed"
    Cancelled = "Cancelled"


class FinalDecisionEnum(str, enum.Enum):
    Selected = "Selected"
    Rejected = "Rejected"
    Hold = "Hold"


# ───────────────────── CANDIDATES ─────────────────────

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False, index=True)
    email = Column(String(150), unique=True, nullable=False, index=True)
    phone = Column(String(40))
    role_applied = Column(String(120), index=True)
    department = Column(String(80), index=True)
    experience_years = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    assessments = relationship("Assessment", back_populates="candidate", cascade="all, delete-orphan")
    interviews = relationship("InterviewSchedule", back_populates="candidate", cascade="all, delete-orphan")
    decisions = relationship("FinalDecision", back_populates="candidate", cascade="all, delete-orphan")
    agent_outputs = relationship("AgentOutput", back_populates="candidate", cascade="all, delete-orphan")
    feedback = relationship("HRFeedback", back_populates="candidate", cascade="all, delete-orphan")


# ───────────────────── ASSESSMENTS ─────────────────────

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), index=True)

    total_questions = Column(Integer, default=0)
    attempted_questions = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    wrong_answers = Column(Integer, default=0)
    unanswered = Column(Integer, default=0)

    mcq_score_percent = Column(Float, default=0.0, index=True)
    time_taken_seconds = Column(Integer, default=0)
    resume_match_percent = Column(Float, default=0.0)
    jd_skill_match_percent = Column(Float, default=0.0)

    submitted_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("Candidate", back_populates="assessments")


# ───────────────────── INTERVIEW SCHEDULES ─────────────────────

class InterviewSchedule(Base):
    __tablename__ = "interview_schedules"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), index=True)

    interviewer_name = Column(String(120))
    interview_mode = Column(String(40))  # Online, Onsite, Phone
    scheduled_date = Column(Date)
    scheduled_time = Column(Time)
    status = Column(SAEnum(InterviewStatus, name="interview_status"),
                    default=InterviewStatus.Scheduled, index=True)

    meeting_link = Column(String(300))
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("Candidate", back_populates="interviews")


# ───────────────────── FINAL DECISIONS ─────────────────────

class FinalDecision(Base):
    __tablename__ = "final_decisions"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), index=True)

    recruiter_name = Column(String(120))
    final_decision = Column(SAEnum(FinalDecisionEnum, name="final_decision_enum"), index=True)
    human_final_decision = Column(Boolean, default=False, index=True)
    decision_notes = Column(Text)
    decided_at = Column(DateTime, default=datetime.utcnow, index=True)

    candidate = relationship("Candidate", back_populates="decisions")


# ───────────────────── AGENT OUTPUTS ─────────────────────

class AgentOutput(Base):
    __tablename__ = "agent_outputs"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), index=True)

    recommendation = Column(String(80))   # Proceed, Hold, Reject, etc.
    confidence_score = Column(Float, default=0.0)
    strengths = Column(Text)
    concerns = Column(Text)
    summary = Column(Text)
    next_step = Column(String(200))
    created_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("Candidate", back_populates="agent_outputs")
    feedback = relationship("HRFeedback", back_populates="agent_output", cascade="all, delete-orphan")


# ───────────────────── HR FEEDBACK ─────────────────────

class HRFeedback(Base):
    __tablename__ = "hr_feedback"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), index=True)
    agent_output_id = Column(Integer, ForeignKey("agent_outputs.id", ondelete="SET NULL"), nullable=True, index=True)

    hr_name = Column(String(120))
    rating = Column(Integer, default=0)            # 1..5
    decision_alignment = Column(Boolean, default=False)
    useful_output = Column(Boolean, default=False)
    bias_flagged = Column(Boolean, default=False, index=True)
    feedback_comment = Column(Text)
    corrected_recommendation = Column(String(80))
    reviewed_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("Candidate", back_populates="feedback")
    agent_output = relationship("AgentOutput", back_populates="feedback")