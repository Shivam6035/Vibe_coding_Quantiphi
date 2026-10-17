# app/api/routes.py
from fastapi import APIRouter, HTTPException, Query
from app.config import SUPPORTED_CURRENCIES
from app.database import (
    get_favorites,
    add_favorite,
    remove_favorite,
    get_recent_history,
)
from app.schemas import (
    ConvertRequest,
    ConvertResponse,
    FavoriteCreateRequest,
    TravelBudgetRequest,
    TravelBudgetResponse,
    validate_currency_code,
)
from app.services.fx_service import (
    perform_conversion,
    get_30_day_trends,
    calculate_travel_budget,
    fetch_live_rates,
)

router = APIRouter(prefix="/api", tags=["Currency Converter"])


@router.get("/currencies")
async def list_currencies():
    """Returns supported currencies for dropdown selectors."""
    try:
        rates = await fetch_live_rates("USD")
        all_codes = sorted(list(rates.keys()))
    except Exception:
        all_codes = SUPPORTED_CURRENCIES
    return {"currencies": all_codes, "popular": SUPPORTED_CURRENCIES}


@router.post("/convert", response_model=ConvertResponse)
async def convert_currency(payload: ConvertRequest):
    """Server-side conversion endpoint."""
    return await perform_conversion(
        payload.source_currency, payload.target_currency, payload.amount
    )


@router.get("/trends")
async def currency_trends(
    source: str = Query("USD", description="Source currency code"),
    target: str = Query("INR", description="Target currency code"),
):
    """Returns 30-day exchange rate movement for Chart.js visualization."""
    try:
        src = validate_currency_code(source)
        tgt = validate_currency_code(target)
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))
    return await get_30_day_trends(src, tgt)


@router.post("/travel-budget", response_model=TravelBudgetResponse)
async def travel_budget_mode(payload: TravelBudgetRequest):
    """Vibe Check: Simultaneous calculation across 5 major global currencies."""
    return await calculate_travel_budget(payload.base_currency, payload.amount)


@router.get("/favorites")
async def list_favorite_pairs():
    return {"favorites": get_favorites()}


@router.post("/favorites")
async def create_favorite_pair(payload: FavoriteCreateRequest):
    if payload.source_currency == payload.target_currency:
        raise HTTPException(
            status_code=400,
            detail="Source and target currencies must be different for a favorite pair.",
        )
    fav = add_favorite(payload.source_currency, payload.target_currency)
    return {"favorite": fav, "favorites": get_favorites()}


@router.delete("/favorites/{fav_id}")
async def delete_favorite_pair(fav_id: int):
    deleted = remove_favorite(fav_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Favorite pair not found.")
    return {"favorites": get_favorites()}


@router.get("/history")
async def conversion_history():
    return {"history": get_recent_history(limit=10)}