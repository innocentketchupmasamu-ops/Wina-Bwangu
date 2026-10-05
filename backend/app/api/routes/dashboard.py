from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.connection import get_db
from app.services import dashboard_service
from app.schemas.dashboard import (
    DashboardSummary, ServicePerformance, BoothPerformance,
    ServiceFrequency, LimitStatus, RevenueCapital
)

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])

@router.get("/summary", response_model=DashboardSummary)
async def get_summary(db: AsyncSession = Depends(get_db)):
    return await dashboard_service.get_dashboard_summary(db)

@router.get("/service-performance", response_model=list[ServicePerformance])
async def get_service_performance(db: AsyncSession = Depends(get_db)):
    return await dashboard_service.get_service_performance(db)

@router.get("/booth-performance", response_model=list[BoothPerformance])
async def get_booth_performance(db: AsyncSession = Depends(get_db)):
    return await dashboard_service.get_booth_performance(db)

@router.get("/service-frequency", response_model=list[ServiceFrequency])
async def get_service_frequency(db: AsyncSession = Depends(get_db)):
    return await dashboard_service.get_service_frequency(db)

@router.get("/limit-status", response_model=list[LimitStatus])
async def get_limit_status(db: AsyncSession = Depends(get_db)):
    return await dashboard_service.get_limit_status(db)

@router.get("/revenue-capital", response_model=RevenueCapital)
async def get_revenue_capital(db: AsyncSession = Depends(get_db)):
    return await dashboard_service.get_revenue_capital(db)