from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.connection import get_db
from app.models import Transaction
from app.schemas.transaction import TransactionCreate, TransactionOut
from app.services.transaction_service import validate_transaction, create_transaction_record
from sqlalchemy import select

router = APIRouter(prefix="/api/v1/transactions", tags=["transactions"])

@router.get("/", response_model=list[TransactionOut])
async def list_transactions(
    booth_id: int = Query(None),
    service_id: int = Query(None),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Transaction).order_by(Transaction.id)
    if booth_id:
        stmt = stmt.where(Transaction.booth_id == booth_id)
    if service_id:
        stmt = stmt.where(Transaction.service_id == service_id)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{transaction_code}", response_model=TransactionOut)
async def get_transaction(transaction_code: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Transaction).where(Transaction.transaction_code == transaction_code)
    result = await db.execute(stmt)
    trans = result.scalar_one_or_none()
    if not trans:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return trans

@router.post("/", response_model=TransactionOut, status_code=201)
async def create_transaction(
    data: TransactionCreate,
    db: AsyncSession = Depends(get_db)
):
    # Step 1: validate
    booth, service, remaining = await validate_transaction(db, data)

    # Step 2: create
    transaction = await create_transaction_record(db, data, service)

    return transaction