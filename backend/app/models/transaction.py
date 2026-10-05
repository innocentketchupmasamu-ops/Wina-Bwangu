from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_code = Column(String(20), unique=True, nullable=False, index=True)  # e.g., WB0000001
    booth_id = Column(Integer, ForeignKey("booths.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    transaction_amount = Column(Numeric(12, 2), nullable=False)
    revenue = Column(Numeric(12, 2), nullable=False)            # amount * revenue_per_kwacha
    tax_amount = Column(Numeric(12, 2), nullable=False)         # amount * TAX_RATE
    amount_after_tax = Column(Numeric(12, 2), nullable=False)   # amount + tax
    created_at = Column(DateTime, server_default=func.now())

    booth = relationship("Booth", back_populates="transactions")
    service = relationship("Service", back_populates="transactions")