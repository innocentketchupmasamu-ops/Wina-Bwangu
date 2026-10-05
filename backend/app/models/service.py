from sqlalchemy import Column, Integer, String, Numeric
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Service(Base):
    __tablename__ = "services"

    id =  Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    monthly_limit = Column(Integer, nullable=False)
    revenue_per_kwacha = Column(Numeric(10,4), nullable=False) #Decimal

    booths = relationship("Booth", secondary="booth_services", back_populates="services")
    transactions = relationship("Transaction", back_populates="service")