from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from decimal import Decimal

class PolicyCreate(BaseModel):
    plan_id: int
    start_date: date
    end_date: date
    beneficiary_name: Optional[str] = None
    beneficiary_relation: Optional[str] = None

class PolicyUpdate(BaseModel):
    coverage_amount: Optional[Decimal] = None
    premium_amount: Optional[Decimal] = None
    premium_frequency: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = None
    beneficiary_name: Optional[str] = None
    beneficiary_relation: Optional[str] = None
    description: Optional[str] = None

class PolicyOut(BaseModel):
    id: int
    policy_number: str
    user_id: int
    policy_type: str
    coverage_amount: Decimal
    premium_amount: Decimal
    premium_frequency: str
    start_date: date
    end_date: date
    status: str
    beneficiary_name: Optional[str]
    beneficiary_relation: Optional[str]
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
