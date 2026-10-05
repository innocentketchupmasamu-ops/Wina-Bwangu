from pydantic import BaseModel
from decimal import Decimal

class ServiceBase(BaseModel):
    name: str
    monthly_limit: int
    revenue_per_kwacha: Decimal

class ServiceOut(ServiceBase):
    id: int

class BoothServiceOut(BaseModel):
    service_id: int
    service_name: str
    revenue_per_kwacha: Decimal