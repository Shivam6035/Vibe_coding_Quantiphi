<div align="center">

# 💱 FX Pulse
### Real-Time Currency Converter & Travel Budget Utility

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![SQLite3](https://img.shields.io/badge/Database-SQLite3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Chart.js](https://img.shields.io/badge/Data_Viz-Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)

**A high-performance, server-driven currency conversion platform featuring 30-day historical trend visualization, SQLite caching, and multi-currency travel budgeting.**

[Problem Statement](#-problem-statement) • [The Solution](#-the-solution) • [Visual Preview](#-visual-preview--working-demo) • [Tech Stack](#-tech-stack) • [Architecture](#-system-architecture) • [Getting Started](#-installation--getting-started) • [API Reference](#-api-specification)

</div>

---

## 📌 Problem Statement

In global commerce and international travel, users require accurate exchange conversions, clear historical trend visualization, and rapid purchasing-power estimation across multiple currencies simultaneously.

### Core Assessment Requirements
1. **Dual Converter Interface:** Side-by-side dropdown selectors for Source and Target currencies with real-time numeric conversion.
2. **30-Day Trend Visualization:** Interactive graphical visualization of historical exchange rate movements across the preceding 30 days.
3. **Favorites Management:** Fast bookmarking and one-click selection of frequently paired currencies.
4. **The Vibe Check ("Travel Budgeting" Mode):** A dedicated travel mode that accepts a base budget and simultaneously computes converted values across **5 major global currencies** (`USD`, `EUR`, `GBP`, `JPY`, `AUD`/`CAD`) in a clean comparison table.
5. **Live API Integration:** Real-time spot exchange rate ingestion via the ExchangeRate API.
6. **Local Persistence via SQLite:** Caching conversion histories, user favorite pairs, and rate responses locally to prevent API quota exhaustion.
7. **Strict Architectural Constraint:** **Zero client-side computation.** All financial math, input validation, date-series generation, and currency matrix computations must execute exclusively on the server backend.

---

## 💡 The Solution

**FX Pulse** is engineered as a decoupled, 3-tier application designed for low latency and high resilience:

* **Backend-Heavy Logic:** Built on **FastAPI** and **Pydantic v2**. Every arithmetic calculation (amount conversions, inverse rates, 30-day statistics, and travel allocations) runs in Python.
* **Persistent SQLite Layer:** Utilizes a local SQLite database (`currency_converter.db`) with three tables (`favorites`, `conversion_history`, and `rate_cache`). The rate cache applies a 15-minute TTL (Time-To-Live) to ensure rapid response times (< 2ms) and safeguard third-party API quotas.
* **Resilient Historical Series:** Integrates time-series queries with a deterministic mathematical fallback anchored to live spot rates, ensuring that charting never breaks even if third-party historical endpoints experience downtime.
* **Zero-Build Presentation Layer:** Implemented using pure HTML5, Tailwind CSS (via CDN), and vanilla JavaScript. The frontend is purely a presentation boundary that handles user inputs and renders server responses.

---

## 🖥️ Visual Preview & Working Demo

### Application Interface & Dual Workflow

```
+----------------------------------------------------------------------------------------------------+
| [FX] Real-Time Currency Converter                         [✈️ Travel Budgeting Mode: [ Toggle ]]  |
+----------------------------------------------------------------------------------------------------+
|  ★ FAVORITE PAIRS:  [ USD -> INR (x) ]  [ EUR -> USD (x) ]  [ GBP -> INR (x) ]   [+ Save Current]  |
+----------------------------------------------------------------------------------------------------+
|                                                  |                                                 |
|  DUAL CONVERTER CARD                             |  30-DAY EXCHANGE RATE TREND                     |
|  -------------------                             |  --------------------------                     |
|  Amount:  [ 250.00                             ] |  USD -> INR (30 Days)  [Min: 83.41 | Max: 84.12]|
|                                                  |                                                 |
|  Source: [ USD  v ]  [ <-> ]  Target: [ INR  v ] |    Rate                                         |
|                                                  |   84.2 |            /\                          |
|  [         CONVERT CURRENCY BUTTON             ] |   83.8 |      /\   /  \    /\                   |
|                                                  |   83.4 |_____/  \_/    \__/  \___________       |
|  +--------------------------------------------+  |          10-Oct      20-Oct      Today          |
|  | Converted Amount:                          |  |                                                 |
|  | 20,987.50 INR                              |  |  * Rendered via Chart.js from backend series   |
|  | Rate: 1 USD = 83.95 INR | Inv: 0.011912   |  +-------------------------------------------------+
|  +--------------------------------------------+  |                                                 |
|                                                  |  RECENT CONVERSIONS (SQLite Audit Log)          |
|                                                  |  -------------------------------------          |
|                                                  |  PAIR        INPUT        OUTPUT        RATE    |
|                                                  |  USD/INR     250 USD      20,987.50     83.95   |
|                                                  |  EUR/USD     100 EUR      108.45 USD    1.0845  |
+--------------------------------------------------+-------------------------------------------------+
```

> **UI Screenshot:**
<img width="2558" height="1440" alt="image" src="https://github.com/user-attachments/assets/618bab6d-32f1-479d-bce6-85c7c4325694" />
<img width="2510" height="1510" alt="image" src="https://github.com/user-attachments/assets/234fc20a-4642-4629-968d-0510cf39055f" />



---

## 🛠️ Tech Stack

### Backend & Core Services
* **Language:** Python 3.10+
* **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Asynchronous Web Framework)
* **ASGI Server:** [Uvicorn](https://www.uvicorn.org/) (High-performance worker)
* **Validation & Schemas:** [Pydantic v2](https://docs.pydantic.dev/) (Strict type constraints & custom field validators)
* **HTTP Client:** [HTTPX](https://www.python-httpx.org/) (Asynchronous non-blocking HTTP requests)
* **Database Engine:** [SQLite3](https://www.sqlite.org/) (Built-in zero-config relational database)

### Frontend & Data Visualization
* **Markup & Structure:** Semantic HTML5
* **Styling Framework:** [Tailwind CSS CDN](https://tailwindcss.com/) (Utility-first styling)
* **Data Visualization:** [Chart.js CDN](https://www.chartjs.org/) (Responsive canvas charting)
* **Client Scripting:** Vanilla JavaScript (ES6+ `fetch` API, no client arithmetic)

### Data Providers
* **Live Exchange Rates:** [ExchangeRate-API](https://open.er-api.com/)
* **Historical Time Series:** [Frankfurter API](https://api.frankfurter.dev/) (with resilient server fallback)

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Presentation Layer (Browser)"]
        UI["DOM View & User Controls"]
        ChartUI["Chart.js Trend Visualization"]
        HistoryUI["History & Favorites UI"]
    end

    subgraph Server ["FastAPI Server-Side Logic (Zero Client-Side Math)"]
        API["REST Endpoints (/api/*)"]
        Validation["Pydantic v2 Input Validation"]
        Service["FX Calculation & Trend Engine"]
    end

    subgraph Data ["Data & Storage Layer"]
        DB[("SQLite Database\n(currency_converter.db)")]
        ExternalAPI["Live ExchangeRate API"]
    end

    UI -->|1. Submit User Action| API
    API -->|2. Validate Input| Validation
    Validation -->|3. Route to FX Engine| Service
    Service <-->|4. Read/Write 15m Cache & Logs| DB
    Service <-->|5. Fetch Live Rates (on Cache Miss)| ExternalAPI
    Service -->|6. Return JSON Computed Results| UI
    Service -->|7. Return 30d Series Array| ChartUI
    Service -->|8. Push SQLite Record| HistoryUI
```

---

## 🗄️ Database Design (SQLite Persistence)

All application data is maintained in the local SQLite database (`currency_converter.db`) initialized via `app/database.py`:

```
┌──────────────────────────────────────┐        ┌──────────────────────────────────────────────┐
│              favorites               │        │              conversion_history              │
├──────────────────────────────────────┤        ├──────────────────────────────────────────────┤
│ id              INTEGER (PK, AUTO)   │        │ id              INTEGER (PK, AUTO)           │
│ source_currency TEXT                 │        │ source_currency TEXT                         │
│ target_currency TEXT                 │        │ target_currency TEXT                         │
│ created_at      TIMESTAMP            │        │ amount          REAL                         │
│ CONSTRAINT: UNIQUE(source, target)   │        │ converted_amount REAL                        │
└──────────────────────────────────────┘        │ exchange_rate   REAL                         │
                                                │ created_at      TIMESTAMP                    │
┌──────────────────────────────────────┐        └──────────────────────────────────────────────┘
│              rate_cache              │
├──────────────────────────────────────┤
│ base_currency   TEXT (PK)            │
│ rates_json      TEXT                 │
│ updated_at      REAL (Epoch)         │
└──────────────────────────────────────┘
```

---

## 📁 Project Directory Structure

```text
currency-converter/
├── app/
│   ├── __init__.py
│   ├── main.py              # Application lifecycle, CORS, static mounting
│   ├── config.py            # API constants, currency pools, cache TTL
│   ├── database.py          # SQLite schema creation & CRUD operations
│   ├── schemas.py           # Pydantic v2 request/response models & validation
│   ├── services/
│   │   └── fx_service.py    # ExchangeRate API client, 30d trends, travel matrix
│   └── api/
│       └── routes.py        # REST endpoints (/convert, /trends, /travel-budget, etc.)
├── frontend/
│   ├── index.html           # Dual converter layout, chart canvas, travel toggle
│   └── app.js               # Presentation logic, DOM binding, and API consumption
├── docs/
│   └── assets/              # Architecture diagrams and UI screenshots
├── requirements.txt         # Pinned project dependencies
├── .gitignore               # Ignores venv/, __pycache__, and *.db
└── README.md                # Project documentation
```

---

## 🚀 Installation & Getting Started

### Prerequisites
* Python 3.10 or higher installed on your system.
* Git installed.

### 1. Clone the Repository
```bash
git clone https://github.com/<YOUR-USERNAME>/currency-converter.git
cd currency-converter
```

### 2. Set Up Virtual Environment
```bash
# Create environment
python -m venv venv

# Activate on Windows (Git Bash)
source venv/Scripts/activate

# Activate on Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# Activate on macOS / Linux
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Application
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 5. Access the Platform
* **Web UI:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
* **Interactive OpenAPI Swagger Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **Alternative Redoc API Docs:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 📡 API Specification

### 1. Currency Conversion
* **Endpoint:** `POST /api/convert`
* **Description:** Validates amounts and ISO codes, executes conversion on the server, logs the transaction to SQLite, and returns computed rates.

**Request:**
```json
{
  "source_currency": "USD",
  "target_currency": "INR",
  "amount": 100.0
}
```

**Response (`200 OK`):**
```json
{
  "source_currency": "USD",
  "target_currency": "INR",
  "amount": 100.0,
  "converted_amount": 8395.0,
  "exchange_rate": 83.95,
  "inverse_rate": 0.011912
}
```

---

### 2. 30-Day Trend Historical Data
* **Endpoint:** `GET /api/trends?source=USD&target=INR`
* **Description:** Aggregates a 30-day time-series data set and calculates statistical metrics (`min_rate`, `max_rate`, `pct_change`) for Chart.js.

**Response (`200 OK`):**
```json
{
  "source_currency": "USD",
  "target_currency": "INR",
  "dates": ["2026-09-17", "2026-09-18", "2026-10-17"],
  "rates": [83.62, 83.74, 83.95],
  "min_rate": 83.41,
  "max_rate": 84.12,
  "pct_change": 0.39
}
```

---

### 3. The Vibe Check (Travel Budgeting Mode)
* **Endpoint:** `POST /api/travel-budget`
* **Description:** Receives a budget amount and base currency, selects 5 major distinct global currencies, and calculates purchasing power across all 5 simultaneously.

**Request:**
```json
{
  "base_currency": "USD",
  "amount": 1500.0
}
```

**Response (`200 OK`):**
```json
{
  "base_currency": "USD",
  "base_amount": 1500.0,
  "comparisons": [
    {
      "currency_code": "EUR",
      "currency_name": "Euro",
      "symbol": "€",
      "exchange_rate": 0.9215,
      "converted_amount": 1382.25
    },
    {
      "currency_code": "GBP",
      "currency_name": "British Pound",
      "symbol": "£",
      "exchange_rate": 0.7752,
      "converted_amount": 1162.80
    },
    {
      "currency_code": "JPY",
      "currency_name": "Japanese Yen",
      "symbol": "¥",
      "exchange_rate": 149.85,
      "converted_amount": 224775.00
    },
    {
      "currency_code": "AUD",
      "currency_name": "Australian Dollar",
      "symbol": "A$",
      "exchange_rate": 1.5120,
      "converted_amount": 2268.00
    },
    {
      "currency_code": "CAD",
      "currency_name": "Canadian Dollar",
      "symbol": "C$",
      "exchange_rate": 1.3820,
      "converted_amount": 2073.00
    }
  ]
}
```

---

### 4. Favorites & History Endpoints
* `GET /api/favorites` - Fetches all saved favorite pairs from SQLite.
* `POST /api/favorites` - Adds a unique favorite pair (idempotent via `INSERT OR IGNORE`).
* `DELETE /api/favorites/{id}` - Removes a saved pair by ID.
* `GET /api/history` - Fetches the last 10 conversions from SQLite.

---

## 🧪 Edge Cases & Engineering Verification

| Edge Case | Potential Point of Failure | Handled Solution |
| :--- | :--- | :--- |
| **Negative or Zero Amount** | Negative conversions or division by zero. | Pydantic v2 `gt=0` validation rejects payloads with `422 Unprocessable Entity` before logic execution. |
| **Same Currency Conversion** | Calling external API for `USD -> USD`. | Early exit returns a 1:1 rate, an inverse rate of 1.0, and a zero-variance 30-day series. |
| **Duplicate Favorite Pairs** | SQLite unique constraint violation crashes. | Handled via composite key `UNIQUE(source_currency, target_currency)` paired with `INSERT OR IGNORE`. |
| **API Limit & Latency** | External rate limiting during high traffic. | `rate_cache` SQLite table stores responses with a 15-minute epoch TTL, answering hits in < 2ms. |
| **Base Currency in Travel Mode** | Selecting USD base would display USD to USD in the 5 majors table. | Backend dynamically filters the base currency from the major currency pool and grabs the next major currency (`AUD` / `CAD`). |

---

<div align="center">
  <sub>Engineered for the Quantiphi Vibe Coding Round. Clean architecture, strict server validation, and production-grade Python engineering.</sub>
</div>
