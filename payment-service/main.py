import random, string, uuid
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, get_db
import models, schemas, auth

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Payment Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def generate_payment_number():
    return "PAY-" + "".join(random.choices(string.digits, k=10))

@app.get("/health")
def health():
    return {"status": "healthy", "service": "payment-service"}

@app.post("/payments", response_model=schemas.PaymentOut, status_code=201)
def create_payment(
    payload: schemas.PaymentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    payment_number = generate_payment_number()
    while db.query(models.Payment).filter(models.Payment.payment_number == payment_number).first():
        payment_number = generate_payment_number()

    transaction_id = str(uuid.uuid4()).replace("-", "").upper()[:16]
    payment = models.Payment(
        payment_number=payment_number,
        user_id=current_user["user_id"],
        transaction_id=transaction_id,
        status="completed",
        paid_date=datetime.utcnow(),
        **payload.dict()
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment

@app.get("/payments", response_model=list[schemas.PaymentOut])
def list_payments(
    status: str = Query(None),
    payment_type: str = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    query = db.query(models.Payment)
    if current_user["role"] != "admin":
        query = query.filter(models.Payment.user_id == current_user["user_id"])
    if status:
        query = query.filter(models.Payment.status == status)
    if payment_type:
        query = query.filter(models.Payment.payment_type == payment_type)
    return query.order_by(models.Payment.created_at.desc()).all()

@app.get("/payments/{payment_id}", response_model=schemas.PaymentOut)
def get_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    if current_user["role"] != "admin" and payment.user_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    return payment

@app.get("/payments/policy/{policy_id}", response_model=list[schemas.PaymentOut])
def get_policy_payments(
    policy_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    return db.query(models.Payment).filter(models.Payment.policy_id == policy_id).all()

@app.get("/payments/stats/summary")
def payment_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(auth.get_current_user)
):
    query = db.query(models.Payment)
    if current_user["role"] != "admin":
        query = query.filter(models.Payment.user_id == current_user["user_id"])
    payments = query.all()
    return {
        "total": len(payments),
        "completed": sum(1 for p in payments if p.status == "completed"),
        "pending": sum(1 for p in payments if p.status == "pending"),
        "failed": sum(1 for p in payments if p.status == "failed"),
        "total_paid": float(sum(p.amount for p in payments if p.status == "completed")),
        "premium_paid": float(sum(p.amount for p in payments if p.payment_type == "premium" and p.status == "completed")),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
