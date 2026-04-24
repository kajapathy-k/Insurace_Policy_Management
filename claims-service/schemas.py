from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from decimal import Decimal

class ClaimCreate(BaseModel):
    policy_id: int
    claim_type: str
    claim_amount: Decimal
    description: str
    incident_date: date

class ClaimUpdate(BaseModel):
    status: Optional[str] = None
    approved_amount: Optional[Decimal] = None
    reviewer_notes: Optional[str] = None

class ClaimOut(BaseModel):
    id: int
    claim_number: str
    policy_id: int
    user_id: int
    claim_type: str
    claim_amount: Decimal
    approved_amount: Optional[Decimal]
    description: str
    incident_date: date
    filed_date: datetime
    status: str
    reviewer_notes: Optional[str]
    resolved_date: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True
