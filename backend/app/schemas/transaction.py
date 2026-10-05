from pydantic import BaseModel, Field
from decimal import Decimal
from datetime import datetime


class TransactionCreate(BaseModel):
    booth_id: int
    service_id: int
    transaction_amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)


class TransactionOut(BaseModel):
    id: int
    transaction_code: str
    booth_id: int
    service_id: int
    transaction_amount: Decimal
    revenue: Decimal
    tax_amount: Decimal | None
    amount_after_tax: Decimal | None
    created_at: datetime
