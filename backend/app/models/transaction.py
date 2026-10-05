from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.database.connection import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column("transaction_id", Integer, primary_key=True, index=True)
    transaction_code = Column(String(20), unique=True, nullable=False, index=True)
    booth_id = Column(Integer, ForeignKey("booths.booth_id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.service_id"), nullable=False)
    transaction_amount = Column(Numeric(12, 2), nullable=False)
    tax_amount = Column(Numeric(12, 3))
    amount_after_tax = Column(Numeric(12, 3))
    revenue = Column(Numeric(12, 3), nullable=False)
    created_at = Column("transaction_date", DateTime, server_default=func.now())

    booth = relationship("Booth", back_populates="transactions")
    service = relationship("Service", back_populates="transactions")
