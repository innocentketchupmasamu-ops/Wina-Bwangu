from pydantic import BaseModel, Field
from decimal import Decimal
from datetime import datetime

class TransactionCreate(BaseModel):
    booth_id: int
    service_id: int
    transaction_amount: Decimal = Field(gt=0, description="Must be positive")

class TransactionOut(BaseModel):
    id: int
    transaction_code: str
    booth_id: int
    service_id: int
    transaction_amount: Decimal
    revenue: Decimal
    tax_amount: Decimal
    amount_after_tax: Decimal
    created_at: datetime