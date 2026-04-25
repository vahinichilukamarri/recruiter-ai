"""
Tiny utility helpers used across the app.
"""
from typing import Any, Optional
import math
from datetime import datetime, date, time


def safe_str(v: Any) -> Optional[str]:
    if v is None:
        return None
    if isinstance(v, float) and math.isnan(v):
        return None
    s = str(v).strip()
    return s or None


def safe_int(v: Any, default: int = 0) -> int:
    try:
        if v is None or v == "":
            return default
        if isinstance(v, float) and math.isnan(v):
            return default
        return int(float(v))
    except (TypeError, ValueError):
        return default


def safe_float(v: Any, default: float = 0.0) -> float:
    try:
        if v is None or v == "":
            return default
        if isinstance(v, float) and math.isnan(v):
            return default
        return float(v)
    except (TypeError, ValueError):
        return default


def safe_bool(v: Any, default: bool = False) -> bool:
    if v is None:
        return default
    if isinstance(v, bool):
        return v
    if isinstance(v, (int, float)) and not (isinstance(v, float) and math.isnan(v)):
        return bool(int(v))
    s = str(v).strip().lower()
    if s in ("true", "1", "yes", "y", "t"):
        return True
    if s in ("false", "0", "no", "n", "f"):
        return False
    return default


def parse_dt(v: Any) -> Optional[datetime]:
    if v is None or v == "":
        return None
    if isinstance(v, datetime):
        return v
    s = str(v).strip()
    for fmt in (
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d %H:%M",
        "%Y-%m-%d",
        "%d/%m/%Y %H:%M",
        "%d/%m/%Y",
        "%m/%d/%Y",
    ):
        try:
            return datetime.strptime(s, fmt)
        except ValueError:
            continue
    return None


def parse_date(v: Any) -> Optional[date]:
    dt = parse_dt(v)
    return dt.date() if dt else None


def parse_time(v: Any) -> Optional[time]:
    if v is None or v == "":
        return None
    if isinstance(v, time):
        return v
    s = str(v).strip()
    for fmt in ("%H:%M:%S", "%H:%M", "%I:%M %p", "%I:%M:%S %p"):
        try:
            return datetime.strptime(s, fmt).time()
        except ValueError:
            continue
    return None