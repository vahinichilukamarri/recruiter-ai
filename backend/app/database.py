"""Database engine, session factory, FastAPI dependency"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings

engine = create_engine(
    "postgresql+psycopg://",
    connect_args={
        "dbname": "defaultdb",
        "user": "avnadmin",
        "password": "PWD",
        "host": "pg-efa76b4-centific-ecfc.b.aivencloud.com",
        "port": 18636,
        "sslmode": "require",
    },
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    pool_recycle=1800,
    echo=False,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()