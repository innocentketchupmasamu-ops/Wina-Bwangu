from sqlalchemy import Column, Integer, ForeignKey, Table
from app.database.connection import Base

booth_services = Table(
    "booth_services",
    Base.metadata,
    Column("booth_id", Integer, ForeignKey("booths.id", ondelete="CASCADE"), primary_key=True),
    Column("service_id", Integer, ForeignKey("services.id", ondelete="CASCADE"), primary_key=True)
)