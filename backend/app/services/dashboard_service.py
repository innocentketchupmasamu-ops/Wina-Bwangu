from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from decimal import Decimal
from app.models import Booth, Service, Transaction
from app.schemas.dashboard import (
    DashboardSummary, ServicePerformance, BoothPerformance,
    ServiceFrequency, LimitStatus, RevenueCapital
)
from typing import List

async def get_dashboard_summary(db: AsyncSession) -> DashboardSummary:
    total_trans = await db.execute(select(func.count(Transaction.id)))
    total_rev = await db.execute(select(func.sum(Transaction.revenue)))
    total_cap = await db.execute(select(func.sum(Service.monthly_limit)))
    return DashboardSummary(
        total_transactions=total_trans.scalar() or 0,
        total_revenue=total_rev.scalar() or Decimal(0),
        total_capital=int(total_cap.scalar() or 0)
    )

async def get_service_performance(db: AsyncSession) -> List[ServicePerformance]:
    stmt = select(
        Service.id,
        Service.name,
        Service.monthly_limit,
        func.coalesce(func.sum(Transaction.transaction_amount), 0).label("used")
    ).outerjoin(Transaction, Transaction.service_id == Service.id) \
     .group_by(Service.id, Service.name, Service.monthly_limit)
    result = await db.execute(stmt)
    rows = result.all()
    output = []
    for row in rows:
        used = Decimal(row.used) if row.used else Decimal(0)
        remaining = Decimal(row.monthly_limit) - used
        util = (used / Decimal(row.monthly_limit)) * 100 if row.monthly_limit > 0 else 0
        output.append(ServicePerformance(
            service_name=row.name,
            monthly_limit=row.monthly_limit,
            used=used,
            remaining=remaining,
            utilisation_percent=float(util)
        ))
    return output

async def get_booth_performance(db: AsyncSession) -> List[BoothPerformance]:
    stmt = select(
        Booth.name,
        func.count(Transaction.id).label("cnt"),
        func.coalesce(func.sum(Transaction.revenue), 0).label("rev")
    ).outerjoin(Transaction, Transaction.booth_id == Booth.id) \
     .group_by(Booth.name)
    result = await db.execute(stmt)
    return [
        BoothPerformance(
            booth_name=row.name,
            transaction_count=row.cnt,
            total_revenue=Decimal(row.rev) if row.rev else Decimal(0)
        ) for row in result.all()
    ]

async def get_service_frequency(db: AsyncSession) -> List[ServiceFrequency]:
    stmt = select(
        Booth.name.label("booth_name"),
        Service.name.label("service_name"),
        func.count(Transaction.id).label("cnt")
    ).join(Transaction, Transaction.booth_id == Booth.id) \
     .join(Service, Transaction.service_id == Service.id) \
     .group_by(Booth.name, Service.name) \
     .order_by(Booth.name, Service.name)
    result = await db.execute(stmt)
    return [
        ServiceFrequency(
            booth_name=row.booth_name,
            service_name=row.service_name,
            count=row.cnt
        ) for row in result.all()
    ]

async def get_limit_status(db: AsyncSession) -> List[LimitStatus]:
    stmt = select(
        Service.name,
        Service.monthly_limit,
        func.coalesce(func.sum(Transaction.transaction_amount), 0).label("used")
    ).outerjoin(Transaction, Transaction.service_id == Service.id) \
     .group_by(Service.name, Service.monthly_limit)
    result = await db.execute(stmt)
    rows = result.all()
    output = []
    for row in rows:
        used = Decimal(row.used) if row.used else Decimal(0)
        remaining = Decimal(row.monthly_limit) - used
        output.append(LimitStatus(
            service_name=row.name,
            monthly_limit=row.monthly_limit,
            used=used,
            remaining=remaining,
            is_available=remaining > 0
        ))
    return output

async def get_revenue_capital(db: AsyncSession) -> RevenueCapital:
    total_rev = await db.execute(select(func.sum(Transaction.revenue)))
    total_cap = await db.execute(select(func.sum(Service.monthly_limit)))
    return RevenueCapital(
        total_revenue=total_rev.scalar() or Decimal(0),
        total_capital=int(total_cap.scalar() or 0)
    )