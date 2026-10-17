# app/database.py
import sqlite3
import json
import time
from typing import List, Dict, Any, Optional
from app.config import DB_PATH, CACHE_TTL_SECONDS


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Initialize SQLite tables for favorites, conversion history, and rate cache."""
    with get_connection() as conn:
        cursor = conn.cursor()

        # 1. Favorites table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS favorites (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_currency TEXT NOT NULL,
                target_currency TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(source_currency, target_currency)
            )
        """)

        # 2. Conversion History table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS conversion_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_currency TEXT NOT NULL,
                target_currency TEXT NOT NULL,
                amount REAL NOT NULL,
                converted_amount REAL NOT NULL,
                exchange_rate REAL NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 3. Exchange Rate Cache table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS rate_cache (
                base_currency TEXT PRIMARY KEY,
                rates_json TEXT NOT NULL,
                updated_at REAL NOT NULL
            )
        """)

        # Seed default favorite pairs if table is empty
        cursor.execute("SELECT COUNT(*) as count FROM favorites")
        if cursor.fetchone()["count"] == 0:
            default_pairs = [("USD", "INR"), ("EUR", "USD"), ("GBP", "INR")]
            cursor.executemany(
                "INSERT OR IGNORE INTO favorites (source_currency, target_currency) VALUES (?, ?)",
                default_pairs,
            )
        conn.commit()


# --- Rate Cache Helpers ---
def get_cached_rates(base_currency: str) -> Optional[Dict[str, float]]:
    with get_connection() as conn:
        row = conn.execute(
            "SELECT rates_json, updated_at FROM rate_cache WHERE base_currency = ?",
            (base_currency.upper(),),
        ).fetchone()
        if row and (time.time() - row["updated_at"]) < CACHE_TTL_SECONDS:
            return json.loads(row["rates_json"])
    return None


def save_cached_rates(base_currency: str, rates: Dict[str, float]) -> None:
    with get_connection() as conn:
        conn.execute(
            """
            INSERT INTO rate_cache (base_currency, rates_json, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(base_currency) DO UPDATE SET
                rates_json = excluded.rates_json,
                updated_at = excluded.updated_at
            """,
            (base_currency.upper(), json.dumps(rates), time.time()),
        )
        conn.commit()


# --- Conversion History Helpers ---
def log_conversion(
    source: str, target: str, amount: float, converted: float, rate: float
) -> None:
    with get_connection() as conn:
        conn.execute(
            """
            INSERT INTO conversion_history
            (source_currency, target_currency, amount, converted_amount, exchange_rate)
            VALUES (?, ?, ?, ?, ?)
            """,
            (source.upper(), target.upper(), amount, converted, rate),
        )
        conn.commit()


def get_recent_history(limit: int = 10) -> List[Dict[str, Any]]:
    with get_connection() as conn:
        rows = conn.execute(
            """
            SELECT id, source_currency, target_currency, amount,
                   converted_amount, exchange_rate, created_at
            FROM conversion_history
            ORDER BY id DESC LIMIT ?
            """,
            (limit,),
        ).fetchall()
        return [dict(r) for r in rows]


# --- Favorites Helpers ---
def get_favorites() -> List[Dict[str, Any]]:
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT id, source_currency, target_currency, created_at FROM favorites ORDER BY id ASC"
        ).fetchall()
        return [dict(r) for r in rows]


def add_favorite(source: str, target: str) -> Dict[str, Any]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT OR IGNORE INTO favorites (source_currency, target_currency) VALUES (?, ?)",
            (source.upper(), target.upper()),
        )
        conn.commit()
        row = conn.execute(
            "SELECT id, source_currency, target_currency, created_at FROM favorites WHERE source_currency = ? AND target_currency = ?",
            (source.upper(), target.upper()),
        ).fetchone()
        return dict(row)


def remove_favorite(fav_id: int) -> bool:
    with get_connection() as conn:
        cursor = conn.execute("DELETE FROM favorites WHERE id = ?", (fav_id,))
        conn.commit()
        return cursor.rowcount > 0