from decimal import Decimal, ROUND_HALF_UP
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException
from app.models import Transaction, Booth, Service, booth_services
from app.core.config import settings
from app.schemas.transaction import TransactionCreate
from typing import Tuple


async def validate_transaction(
    db: AsyncSession, data: TransactionCreate
) -> Tuple[Booth, Service, Decimal]:
    booth = await db.get(Booth, data.booth_id)
    if not booth:
        raise HTTPException(status_code=404, detail="Booth not found")

    service = await db.get(Service, data.service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    stmt = select(booth_services).where(
        booth_services.c.booth_id == data.booth_id,
        booth_services.c.service_id == data.service_id,
    )
    rel = await db.execute(stmt)
    if not rel.first():
        raise HTTPException(status_code=400, detail="Service is not offered at this booth")

    used_stmt = select(func.coalesce(func.sum(Transaction.transaction_amount), 0)).where(
        Transaction.service_id == data.service_id
    )
    used = (await db.execute(used_stmt)).scalar() or Decimal("0")
    remaining = Decimal(service.monthly_limit) - Decimal(used)

    if data.transaction_amount > remaining:
        raise HTTPException(
            status_code=400,
            detail=f"Transaction exceeds the {service.name} monthly limit. Remaining: K{remaining:,.2f}",
        )

    return booth, service, remaining


async def create_transaction_record(
    db: AsyncSession, data: TransactionCreate, service: Service
) -> Transaction:
    result = await db.execute(
        select(func.max(Transaction.transaction_code))
    )
    max_code = result.scalar()
    next_number = int(max_code[2:]) + 1 if max_code else 1
    new_code = f"WB{next_number:07d}"

    revenue = (data.transaction_amount * Decimal(service.revenue_per_kwacha)).quantize(
        Decimal("0.001"), rounding=ROUND_HALF_UP
    )
    tax = (data.transaction_amount * Decimal(str(settings.tax_rate))).quantize(
        Decimal("0.001"), rounding=ROUND_HALF_UP
    )
    after_tax = (data.transaction_amount + tax).quantize(
        Decimal("0.001"), rounding=ROUND_HALF_UP
    )

    transaction = Transaction(
        transaction_code=new_code,
        booth_id=data.booth_id,
        service_id=data.service_id,
        transaction_amount=data.transaction_amount,
        revenue=revenue,
        tax_amount=tax,
        amount_after_tax=after_tax,
    )
    db.add(transaction)
    await db.commit()
    await db.refresh(transaction)
    return transaction
