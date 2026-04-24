from sqlalchemy import Column, Integer, String, Enum, Text, Date, DECIMAL, TIMESTAMP
from sqlalchemy.sql import func
from database import Base

class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    policy_number = Column(String(20), unique=True, nullable=False, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    policy_type = Column(Enum('health', 'life', 'auto', 'home', 'travel'), nullable=False)
    coverage_amount = Column(DECIMAL(15, 2), nullable=False)
    premium_amount = Column(DECIMAL(10, 2), nullable=False)
    premium_frequency = Column(Enum('monthly', 'quarterly', 'semi-annual', 'annual'), default='monthly')
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(Enum('active', 'inactive', 'expired', 'cancelled', 'pending'), default='pending')
    beneficiary_name = Column(String(100))
    beneficiary_relation = Column(String(50))
    description = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
