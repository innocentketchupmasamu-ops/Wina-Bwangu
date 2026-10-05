from pydantic import BaseModel
from decimal import Decimal
from typing import List

class ServiceSummary(BaseModel):
    service_name: str
    monthly_limit: int
    used: Decimal
    remaining: Decimal

class BoothRevenue(BaseModel):
    booth_name: str
    total_revenue: Decimal

class ServiceFrequency(BaseModel):
    booth_name: str
    service_name: str
    count: int

class DashboardSummary(BaseModel):
    total_transactions: int
    total_revenue: Decimal
    total_capital: int
    tax_rate: float

class ServicePerformance(BaseModel):
    service_name: str
    monthly_limit: int
    used: Decimal
    remaining: Decimal
    utilisation_percent: float

class BoothPerformance(BaseModel):
    booth_name: str
    transaction_count: int
    total_revenue: Decimal

class LimitStatus(BaseModel):
    service_name: str
    monthly_limit: int
    used: Decimal
    remaining: Decimal
    is_available: bool

class RevenueCapital(BaseModel):
    total_revenue: Decimal
    total_capital: int