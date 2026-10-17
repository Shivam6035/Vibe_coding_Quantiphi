# app/config.py
import os
from dotenv import load_dotenv

load_dotenv()

# SQLite Database Path
DB_PATH = os.getenv("DB_PATH", "currency_converter.db")

# ExchangeRate API (Open V6 endpoint works out-of-the-box without a key, or uses API key if provided)
EXCHANGE_RATE_API_KEY = os.getenv("EXCHANGE_RATE_API_KEY", "")
EXCHANGE_RATE_BASE_URL = "https://open.er-api.com/v6/latest"

# Historical Trend API (Frankfurter API for real historical data + deterministic fallback)
HISTORICAL_API_URL = "https://api.frankfurter.dev/v1"

# Cache TTL in seconds (15 minutes)
CACHE_TTL_SECONDS = 900

# Pool of major global currencies for "Travel Budgeting" mode (top 5 distinct from base will be chosen)
MAJOR_GLOBAL_CURRENCIES = [
    {"code": "USD", "name": "US Dollar", "symbol": "$"},
    {"code": "EUR", "name": "Euro", "symbol": "€"},
    {"code": "GBP", "name": "British Pound", "symbol": "£"},
    {"code": "JPY", "name": "Japanese Yen", "symbol": "¥"},
    {"code": "AUD", "name": "Australian Dollar", "symbol": "A$"},
    {"code": "CAD", "name": "Canadian Dollar", "symbol": "C$"},
]

# Common currency metadata for dropdowns
SUPPORTED_CURRENCIES = [
    "USD", "INR", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "SGD", "AED", "NZD"
]