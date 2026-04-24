from sqlalchemy import Column, Integer, String, Enum, Text, Date, DECIMAL, TIMESTAMP
from sqlalchemy.sql import func
from database import Base

class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    claim_number = Column(String(20), unique=True, nullable=False, index=True)
    policy_id = Column(Integer, nullable=False, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    claim_type = Column(String(50), nullable=False)
    claim_amount = Column(DECIMAL(15, 2), nullable=False)
    approved_amount = Column(DECIMAL(15, 2))
    description = Column(Text, nullable=False)
    incident_date = Column(Date, nullable=False)
    filed_date = Column(TIMESTAMP, server_default=func.now())
    status = Column(Enum('submitted', 'under_review', 'approved', 'rejected', 'paid'), default='submitted')
    reviewer_notes = Column(Text)
    resolved_date = Column(TIMESTAMP)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
