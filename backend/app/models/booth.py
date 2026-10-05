from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Booth(Base):
    __tablename__ = "booths"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    location = Column(String(100), nullable=False)

    #Relationships
    services = relationship("Service", secondary="booth_services", back_populates="booths")
    transactions = relationship("Transaction", back_populates="booth")