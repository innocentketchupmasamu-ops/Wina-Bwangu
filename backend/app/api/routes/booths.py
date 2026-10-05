from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.connection import get_db
from app.models import Booth
from app.schemas.booth import BoothOut
from app.schemas.service import BoothServiceOut
from app.models import booth_services, Service
from sqlalchemy import select

router: APIRouter = APIRouter(prefix="/api/v1/booths", tags=["booths"])

@router.get("/", response_model=list[BoothOut])
async def list_booths(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Booth).order_by(Booth.id))
    return result.scalars().all()

@router.get("/{booth_id}", response_model=BoothOut)
async def get_booth(booth_id: int, db: AsyncSession = Depends(get_db)):
    booth = await db.get(Booth, booth_id)
    if not booth:
        raise HTTPException(status_code=404, detail="Booth not found")
    return booth

@router.get("/{booth_id}/services", response_model=list[BoothServiceOut])
async def get_booth_services(booth_id: int, db: AsyncSession = Depends(get_db)):
    booth = await db.get(Booth, booth_id)
    if not booth:
        raise HTTPException(status_code=404, detail="Booth not found")
    stmt = select(
        Service.id.label("service_id"),
        Service.name.label("service_name"),
        Service.revenue_per_kwacha
    ).join(booth_services, booth_services.c.service_id == Service.id) \
     .where(booth_services.c.booth_id == booth_id) \
     .order_by(Service.name)
    result = await db.execute(stmt)
    return [dict(row._mapping) for row in result.all()]