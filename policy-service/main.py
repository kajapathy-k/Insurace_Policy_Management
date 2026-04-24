import random, string
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, get_db
import models, schemas, auth

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Policy Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Predefined policy plans — customers select from these, no free-form customisation
POLICY_PLANS = [
    {"id": 1,  "name": "Basic Health Shield",     "policy_type": "health",  "coverage_amount": 50000,   "premium_amount": 199,  "premium_frequency": "monthly",   "description": "Essential health cover for individuals with hospitalisation and outpatient benefits."},
    {"id": 2,  "name": "Premium Health Plus",     "policy_type": "health",  "coverage_amount": 200000,  "premium_amount": 599,  "premium_frequency": "monthly",   "description": "Comprehensive health plan with specialist care, dental, and vision coverage."},
    {"id": 3,  "name": "Term Life Guard",          "policy_type": "life",    "coverage_amount": 500000,  "premium_amount": 299,  "premium_frequency": "monthly",   "description": "20-year term life insurance providing financial security for your family."},
    {"id": 4,  "name": "Whole Life Premier",       "policy_type": "life",    "coverage_amount": 1000000, "premium_amount": 799,  "premium_frequency": "monthly",   "description": "Lifetime coverage with cash value accumulation and premium waiver on disability."},
    {"id": 5,  "name": "Auto Basic Cover",         "policy_type": "auto",    "coverage_amount": 30000,   "premium_amount": 149,  "premium_frequency": "monthly",   "description": "Third-party liability and basic own-damage cover for personal vehicles."},
    {"id": 6,  "name": "Auto Comprehensive Plus",  "policy_type": "auto",    "coverage_amount": 80000,   "premium_amount": 349,  "premium_frequency": "monthly",   "description": "Full comprehensive cover including theft, natural disasters, and roadside assistance."},
    {"id": 7,  "name": "Home Protect Basic",       "policy_type": "home",    "coverage_amount": 150000,  "premium_amount": 199,  "premium_frequency": "monthly",   "description": "Building and contents protection against fire, flooding, and burglary."},
    {"id": 8,  "name": "Home Protect Premium",     "policy_type": "home",    "coverage_amount": 400000,  "premium_amount": 449,  "premium_frequency": "monthly",   "description": "High-value home cover with liability protection and alternative accommodation benefit."},
    {"id": 9,  "name": "Travel Safe Annual",       "policy_type": "travel",  "coverage_amount": 25000,   "premium_amount": 99,   "premium_frequency": "annual",    "description": "Annual multi-trip cover for medical emergencies, cancellations, and lost baggage."},
    {"id": 10, "name": "Travel Elite Worldwide",   "policy_type": "travel",  "coverage_amount": 75000,   "premium_amount": 199,  "premium_frequency": "annual",    "description": "Premium worldwide travel cover including adventure sports and business travel."},
]

def generate_policy_number():
    return "POL-" + "".join(random.choices(string.digits, k=10))

@app.get("/health")
def health():
    return {"status": "healthy", "service": "policy-service"}

@app.get("/policy-plans")
def list_plans():
    return POLICY_PLANS

@app.post("/policies", response_model=schemas.PolicyOut, status_code=201)
def create_policy(
    payload: schemas.PolicyCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    # Look up the predefined plan
    plan = next((p for p in POLICY_PLANS if p["id"] == payload.plan_id), None)
    if not plan:
        raise HTTPException(status_code=400, detail="Invalid plan_id")

    policy_number = generate_policy_number()
    while db.query(models.Policy).filter(models.Policy.policy_number == policy_number).first():
        policy_number = generate_policy_number()

    policy = models.Policy(
        policy_number=policy_number,
        user_id=current_user["user_id"],
        policy_type=plan["policy_type"],
        coverage_amount=plan["coverage_amount"],
        premium_amount=plan["premium_amount"],
        premium_frequency=plan["premium_frequency"],
        description=plan["description"],
        start_date=payload.start_date,
        end_date=payload.end_date,
        beneficiary_name=payload.beneficiary_name,
        beneficiary_relation=payload.beneficiary_relation,
        status="pending",
    )
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy

@app.get("/policies", response_model=list[schemas.PolicyOut])
def list_policies(
    status: str = Query(None),
    policy_type: str = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    query = db.query(models.Policy)
    if current_user["role"] != "admin":
        query = query.filter(models.Policy.user_id == current_user["user_id"])
    if status:
        query = query.filter(models.Policy.status == status)
    if policy_type:
        query = query.filter(models.Policy.policy_type == policy_type)
    return query.order_by(models.Policy.created_at.desc()).all()

@app.get("/policies/{policy_id}", response_model=schemas.PolicyOut)
def get_policy(
    policy_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    policy = db.query(models.Policy).filter(models.Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    if current_user["role"] != "admin" and policy.user_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    return policy

@app.put("/policies/{policy_id}", response_model=schemas.PolicyOut)
def update_policy(
    policy_id: int,
    payload: schemas.PolicyUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    policy = db.query(models.Policy).filter(models.Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    if current_user["role"] != "admin" and policy.user_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    # Only admin can change status; customers cannot self-activate
    if "status" in payload.dict(exclude_none=True) and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admin can change policy status")
    for field, value in payload.dict(exclude_none=True).items():
        setattr(policy, field, value)
    db.commit()
    db.refresh(policy)
    return policy

@app.post("/policies/{policy_id}/approve", response_model=schemas.PolicyOut)
def approve_policy(
    policy_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admin can approve policies")
    policy = db.query(models.Policy).filter(models.Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    if policy.status != "pending":
        raise HTTPException(status_code=400, detail=f"Policy is '{policy.status}', only pending policies can be approved")
    policy.status = "active"
    db.commit()
    db.refresh(policy)
    return policy

@app.post("/policies/{policy_id}/reject", response_model=schemas.PolicyOut)
def reject_policy(
    policy_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admin can reject policies")
    policy = db.query(models.Policy).filter(models.Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    if policy.status != "pending":
        raise HTTPException(status_code=400, detail=f"Policy is '{policy.status}', only pending policies can be rejected")
    policy.status = "inactive"
    db.commit()
    db.refresh(policy)
    return policy

@app.delete("/policies/{policy_id}")
def cancel_policy(
    policy_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    policy = db.query(models.Policy).filter(models.Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    if current_user["role"] != "admin" and policy.user_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    policy.status = "cancelled"
    db.commit()
    return {"message": "Policy cancelled"}

@app.get("/policies/user/{user_id}", response_model=list[schemas.PolicyOut])
def get_user_policies(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    if current_user["role"] != "admin" and current_user["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return db.query(models.Policy).filter(models.Policy.user_id == user_id).all()

@app.get("/policies/stats/summary")
def policy_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    query = db.query(models.Policy)
    if current_user["role"] != "admin":
        query = query.filter(models.Policy.user_id == current_user["user_id"])
    policies = query.all()
    return {
        "total": len(policies),
        "active": sum(1 for p in policies if p.status == "active"),
        "pending": sum(1 for p in policies if p.status == "pending"),
        "expired": sum(1 for p in policies if p.status == "expired"),
        "cancelled": sum(1 for p in policies if p.status == "cancelled"),
        "total_coverage": float(sum(p.coverage_amount for p in policies if p.status == "active")),
        "total_premium": float(sum(p.premium_amount for p in policies if p.status == "active")),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
