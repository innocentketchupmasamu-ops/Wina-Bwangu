from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.connection import get_db
from app.models import Service
from app.schemas.service import ServiceOut
from sqlalchemy import select

router = APIRouter(prefix="/api/v1/services", tags=["services"])

@router.get("/", response_model=list[ServiceOut])
async def list_services(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Service).order_by(Service.id))
    return result.scalars().all()

@router.get("/{service_id}", response_model=ServiceOut)
async def get_service(service_id: int, db: AsyncSession = Depends(get_db)):
    service = await db.get(Service, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service