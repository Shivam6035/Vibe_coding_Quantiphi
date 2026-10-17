# app/schemas.py
from pydantic import BaseModel, Field, field_validator
from typing import List


def validate_currency_code(code: str) -> str:
    cleaned = code.strip().upper()
    if len(cleaned) != 3 or not cleaned.isalpha():
        raise ValueError("Currency code must be a valid 3-letter ISO code (e.g., USD, INR).")
    return cleaned


class ConvertRequest(BaseModel):
    source_currency: str = Field(..., description="3-letter source currency code")
    target_currency: str = Field(..., description="3-letter target currency code")
    amount: float = Field(..., gt=0, description="Amount to convert (must be > 0)")

    @field_validator("source_currency", "target_currency")
    @classmethod
    def check_code(cls, v: str) -> str:
        return validate_currency_code(v)


class ConvertResponse(BaseModel):
    source_currency: str
    target_currency: str
    amount: float
    converted_amount: float
    exchange_rate: float
    inverse_rate: float


class FavoriteCreateRequest(BaseModel):
    source_currency: str
    target_currency: str

    @field_validator("source_currency", "target_currency")
    @classmethod
    def check_code(cls, v: str) -> str:
        return validate_currency_code(v)


class TravelBudgetRequest(BaseModel):
    base_currency: str = Field(..., description="Base currency code")
    amount: float = Field(..., gt=0, description="Base budget amount (must be > 0)")

    @field_validator("base_currency")
    @classmethod
    def check_code(cls, v: str) -> str:
        return validate_currency_code(v)


class TravelBudgetItem(BaseModel):
    currency_code: str
    currency_name: str
    symbol: str
    exchange_rate: float
    converted_amount: float


class TravelBudgetResponse(BaseModel):
    base_currency: str
    base_amount: float
    comparisons: List[TravelBudgetItem]