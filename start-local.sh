#!/bin/bash
# Start all Insurance microservices locally

DB_URL="mysql+pymysql://root:abcd1234@localhost:3306/insurance_db"
SK="your-super-secret-key-change-in-production-abc123xyz"
PYTHON="/c/Users/Janu/AppData/Local/Programs/Python/Python313/python"
BASE="/c/Users/Janu/OneDrive/Desktop/Insurance"

echo "Starting user-service on port 8001..."
cd "$BASE/user-service"
DATABASE_URL="$DB_URL" SECRET_KEY="$SK" ALGORITHM=HS256 ACCESS_TOKEN_EXPIRE_MINUTES=60 \
  "$PYTHON" -m uvicorn main:app --port 8001 --host 0.0.0.0 > /tmp/user-svc.log 2>&1 &
echo "  PID=$?"

echo "Starting policy-service on port 8002..."
cd "$BASE/policy-service"
DATABASE_URL="$DB_URL" SECRET_KEY="$SK" ALGORITHM=HS256 \
  "$PYTHON" -m uvicorn main:app --port 8002 --host 0.0.0.0 > /tmp/policy-svc.log 2>&1 &

echo "Starting claims-service on port 8003..."
cd "$BASE/claims-service"
DATABASE_URL="$DB_URL" SECRET_KEY="$SK" ALGORITHM=HS256 \
  "$PYTHON" -m uvicorn main:app --port 8003 --host 0.0.0.0 > /tmp/claims-svc.log 2>&1 &

echo "Starting payment-service on port 8004..."
cd "$BASE/payment-service"
DATABASE_URL="$DB_URL" SECRET_KEY="$SK" ALGORITHM=HS256 \
  "$PYTHON" -m uvicorn main:app --port 8004 --host 0.0.0.0 > /tmp/payment-svc.log 2>&1 &

echo "Waiting 3s for services to start..."
sleep 3

echo "Starting api-gateway on port 8000..."
cd "$BASE/api-gateway"
USER_SERVICE_URL=http://localhost:8001 \
POLICY_SERVICE_URL=http://localhost:8002 \
CLAIMS_SERVICE_URL=http://localhost:8003 \
PAYMENT_SERVICE_URL=http://localhost:8004 \
SECRET_KEY="$SK" ALGORITHM=HS256 \
  "$PYTHON" -m uvicorn main:app --port 8000 --host 0.0.0.0 > /tmp/gateway.log 2>&1 &

echo ""
echo "All backend services started."
echo "Logs: /tmp/user-svc.log  /tmp/policy-svc.log  /tmp/claims-svc.log  /tmp/payment-svc.log  /tmp/gateway.log"
echo ""
echo "Starting frontend..."
cd "$BASE/frontend"
npm install --silent
REACT_APP_API_URL=http://localhost:8000 npm start
