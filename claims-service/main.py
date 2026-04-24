import random, string
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, get_db
import models, schemas, auth

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Claims Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def generate_claim_number():
    return "CLM-" + "".join(random.choices(string.digits, k=10))

@app.get("/health")
def health():
    return {"status": "healthy", "service": "claims-service"}

@app.post("/claims", response_model=schemas.ClaimOut, status_code=201)
def file_claim(
    payload: schemas.ClaimCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    claim_number = generate_claim_number()
    while db.query(models.Claim).filter(models.Claim.claim_number == claim_number).first():
        claim_number = generate_claim_number()
    claim = models.Claim(
        claim_number=claim_number,
        user_id=current_user["user_id"],
        **payload.dict()
    )
    db.add(claim)
    db.commit()
    db.refresh(claim)
    return claim

@app.get("/claims", response_model=list[schemas.ClaimOut])
def list_claims(
    status: str = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    query = db.query(models.Claim)
    if current_user["role"] != "admin":
        query = query.filter(models.Claim.user_id == current_user["user_id"])
    if status:
        query = query.filter(models.Claim.status == status)
    return query.order_by(models.Claim.created_at.desc()).all()

@app.get("/claims/{claim_id}", response_model=schemas.ClaimOut)
def get_claim(
    claim_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    claim = db.query(models.Claim).filter(models.Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    if current_user["role"] != "admin" and claim.user_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    return claim

@app.put("/claims/{claim_id}", response_model=schemas.ClaimOut)
def update_claim(
    claim_id: int,
    payload: schemas.ClaimUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    claim = db.query(models.Claim).filter(models.Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admin can update claim status")
    for field, value in payload.dict(exclude_none=True).items():
        setattr(claim, field, value)
    if payload.status in ("approved", "rejected", "paid"):
        claim.resolved_date = datetime.utcnow()
    db.commit()
    db.refresh(claim)
    return claim

@app.delete("/claims/{claim_id}")
def withdraw_claim(
    claim_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    claim = db.query(models.Claim).filter(models.Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    if current_user["role"] != "admin" and claim.user_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    if claim.status not in ("submitted",):
        raise HTTPException(status_code=400, detail="Cannot withdraw claim in current status")
    db.delete(claim)
    db.commit()
    return {"message": "Claim withdrawn"}

@app.get("/claims/stats/summary")
def claim_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    query = db.query(models.Claim)
    if current_user["role"] != "admin":
        query = query.filter(models.Claim.user_id == current_user["user_id"])
    claims = query.all()
    return {
        "total": len(claims),
        "submitted": sum(1 for c in claims if c.status == "submitted"),
        "under_review": sum(1 for c in claims if c.status == "under_review"),
        "approved": sum(1 for c in claims if c.status == "approved"),
        "rejected": sum(1 for c in claims if c.status == "rejected"),
        "paid": sum(1 for c in claims if c.status == "paid"),
        "total_claimed": float(sum(c.claim_amount for c in claims)),
        "total_approved": float(sum(c.approved_amount or 0 for c in claims if c.status in ("approved", "paid"))),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
