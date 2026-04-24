from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from decimal import Decimal

class PaymentCreate(BaseModel):
    policy_id: int
    payment_type: str
    amount: Decimal
    payment_method: str
    due_date: Optional[date] = None
    notes: Optional[str] = None

class PaymentOut(BaseModel):
    id: int
    payment_number: str
    policy_id: int
    user_id: int
    payment_type: str
    amount: Decimal
    payment_method: str
    status: str
    transaction_id: Optional[str]
    due_date: Optional[date]
    paid_date: Optional[datetime]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
