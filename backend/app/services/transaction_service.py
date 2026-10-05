from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException, status
from app.models import Transaction, Booth, Service, booth_services
from app.core.config import settings
from app.schemas.transaction import TransactionCreate
from typing import Tuple

async def validate_transaction(db: AsyncSession, data: TransactionCreate) -> Tuple[Booth, Service, Decimal]:
    """
    Validate that the booth and service exist, the service is offered at the booth,
    and the transaction amount does not exceed the remaining monthly limit.

    Returns: (booth, service, remaining_limit)
    Raises HTTPException if any validation fails.
    """
    # 1. Check booth
    booth = await db.get(Booth, data.booth_id)
    if not booth:
        raise HTTPException(status_code=404, detail="Booth not found")

    # 2. Check service
    service = await db.get(Service, data.service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    # 3. Check booth-service association
    stmt = select(booth_services).where(
        booth_services.c.booth_id == data.booth_id,
        booth_services.c.service_id == data.service_id
    )
    rel = await db.execute(stmt)
    if not rel.first():
        raise HTTPException(status_code=400, detail="Service not offered at this booth")

    # 4. Calculate cumulative used for this service
    used_stmt = select(func.sum(Transaction.transaction_amount)).where(
        Transaction.service_id == data.service_id
    )
    used_result = await db.execute(used_stmt)
    used = used_result.scalar() or Decimal(0)

    remaining = Decimal(service.monthly_limit) - used
    if data.transaction_amount > remaining:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient limit. Remaining: {remaining}"
        )

    return booth, service, remaining


async def create_transaction_record(
    db: AsyncSession,
    data: TransactionCreate,
    service: Service
) -> Transaction:
    """
    Generate transaction code, compute revenue/tax, and persist the transaction.
    Assumes all validations have passed.
    """
    # Generate next transaction code
    result = await db.execute(select(func.max(Transaction.transaction_code)))
    max_code = result.scalar()
    if not max_code:
        new_code = "WB0000001"
    else:
        num = int(max_code[2:]) + 1
        new_code = f"WB{num:07d}"

    # Compute financial fields
    revenue = data.transaction_amount * service.revenue_per_kwacha
    tax = data.transaction_amount * Decimal(settings.TAX_RATE)
    after_tax = data.transaction_amount + tax

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