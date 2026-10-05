from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database.connection import Base


class Booth(Base):
    __tablename__ = "booths"

    id = Column("booth_id", Integer, primary_key=True, index=True)
    name = Column("booth_code", String(10), unique=True, nullable=False, index=True)
    location = Column(String(100), nullable=False)

    services = relationship(
        "Service",
        secondary="booth_services",
        back_populates="booths",
    )
    transactions = relationship("Transaction", back_populates="booth")
