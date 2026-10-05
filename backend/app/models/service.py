from sqlalchemy import Column, Integer, String, Numeric
from sqlalchemy.orm import relationship
from app.database.connection import Base


class Service(Base):
    __tablename__ = "services"

    id = Column("service_id", Integer, primary_key=True, index=True)
    name = Column("service_name", String(50), unique=True, nullable=False, index=True)
    monthly_limit = Column(Numeric(12, 2), nullable=False)
    revenue_per_kwacha = Column("revenue_rate", Numeric(5, 4), nullable=False)

    booths = relationship(
        "Booth",
        secondary="booth_services",
        back_populates="services",
    )
    transactions = relationship("Transaction", back_populates="service")
