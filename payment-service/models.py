from sqlalchemy import Column, Integer, String, Enum, Text, Date, DECIMAL, TIMESTAMP
from sqlalchemy.sql import func
from database import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    payment_number = Column(String(20), unique=True, nullable=False, index=True)
    policy_id = Column(Integer, nullable=False, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    payment_type = Column(Enum('premium', 'claim_payout'), nullable=False)
    amount = Column(DECIMAL(10, 2), nullable=False)
    payment_method = Column(Enum('credit_card', 'debit_card', 'bank_transfer', 'upi'), nullable=False)
    status = Column(Enum('pending', 'completed', 'failed', 'refunded'), default='pending')
    transaction_id = Column(String(100))
    due_date = Column(Date)
    paid_date = Column(TIMESTAMP)
    notes = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
