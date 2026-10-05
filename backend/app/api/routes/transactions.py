from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.connection import get_db
from app.models import Transaction, Booth, Service
from app.schemas.transaction import TransactionCreate, TransactionOut
from app.services.transaction_service import validate_transaction, create_transaction_record

router = APIRouter(prefix="/api/v1/transactions", tags=["transactions"])


@router.get("/", response_model=list[TransactionOut])
async def list_transactions(
    booth_id: int | None = Query(default=None),
    service_id: int | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Transaction)
        .order_by(Transaction.id.desc())
    )
    if booth_id is not None:
        stmt = stmt.where(Transaction.booth_id == booth_id)
    if service_id is not None:
        stmt = stmt.where(Transaction.service_id == service_id)

    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{transaction_code}", response_model=TransactionOut)
async def get_transaction(transaction_code: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Transaction).where(Transaction.transaction_code == transaction_code)
    )
    transaction = result.scalar_one_or_none()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction


@router.post("/", response_model=TransactionOut, status_code=201)
async def create_transaction(
    data: TransactionCreate,
    db: AsyncSession = Depends(get_db),
):
    _, service, _ = await validate_transaction(db, data)
    return await create_transaction_record(db, data, service)


@router.get("/details/all")
async def list_transaction_details(db: AsyncSession = Depends(get_db)):
    stmt = (
        select(
            Transaction.transaction_code,
            Booth.name.label("booth"),
            Booth.location,
            Service.name.label("service"),
            Service.revenue_per_kwacha,
            Transaction.transaction_amount,
            Transaction.revenue,
            Transaction.tax_amount,
            Transaction.amount_after_tax,
            Transaction.created_at,
        )
        .join(Booth, Transaction.booth_id == Booth.id)
        .join(Service, Transaction.service_id == Service.id)
        .order_by(Transaction.id.desc())
    )
    result = await db.execute(stmt)
    return [dict(row._mapping) for row in result.all()]
