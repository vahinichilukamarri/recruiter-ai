"""FastAPI application entrypoint.

Run with:
    python -m uvicorn app.main:app --reload
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.config import settings
from app.database import Base, engine

# Importing models registers them on Base.metadata before create_all
import app.models as models  # noqa: F401

# Routers
from app.routes import (
    candidates,
    assessments,
    interviews,
    decisions,
    agent,
    feedback,
    analytics,
)

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s | %(levelname)s | %(message)s")
log = logging.getLogger("recruiter-ai")


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Starting %s v%s (env=%s)",
             settings.PROJECT_NAME, settings.VERSION, settings.ENV)
    log.info("DB host: %s",
             settings.DATABASE_URL.split("@")[-1].split("/")[0])
    Base.metadata.create_all(bind=engine)
    log.info("Tables ensured")
    yield
    log.info("Shutting down")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for the Recruiter-AI platform.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(candidates.router)
app.include_router(assessments.router)
app.include_router(interviews.router)
app.include_router(decisions.router)
app.include_router(agent.router)
app.include_router(feedback.router)
app.include_router(analytics.router)


@app.get("/", tags=["Root"])
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "running",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health",
    }


@app.get("/health", tags=["Root"])
def health():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_ok = True
    except Exception as exc:
        log.error("DB health check failed: %s", exc)
        db_ok = False
    return {"status": "ok" if db_ok else "degraded", "database": db_ok}


@app.exception_handler(Exception)
async def unhandled_exception_handler(request, exc):
    log.exception("Unhandled error on %s %s", request.method, request.url)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc)},
    )