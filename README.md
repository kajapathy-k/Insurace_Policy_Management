# InsurePro - Microservice Insurance Policy Management System

A full-stack, microservice-based insurance policy management system.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend :3000                  │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│               API Gateway (FastAPI) :8000                │
└────┬───────────────┬──────────────┬────────────┬────────┘
     │               │              │            │
┌────▼───┐  ┌────────▼──┐  ┌───────▼──┐  ┌─────▼──────┐
│  User  │  │  Policy   │  │  Claims  │  │  Payment   │
│:8001   │  │  :8002    │  │  :8003   │  │  :8004     │
└────┬───┘  └────────┬──┘  └───────┬──┘  └─────┬──────┘
     └───────────────┴─────────────┴────────────┘
                         │
              ┌──────────▼──────────┐
              │    MySQL :3306       │
              └─────────────────────┘
```

## Microservices

| Service       | Port | Responsibility                          |
|---------------|------|-----------------------------------------|
| API Gateway   | 8000 | Route requests to appropriate services  |
| User Service  | 8001 | Auth, registration, user management     |
| Policy Service| 8002 | Policy CRUD, stats                      |
| Claims Service| 8003 | Claims filing, review, tracking         |
| Payment Service| 8004| Premium payments, transaction history   |
| Frontend      | 3000 | React UI (served via nginx in Docker)   |

## Features

- **Authentication** — JWT-based login/register with role-based access (admin/customer/agent)
- **Policies** — Create, view, activate, cancel policies (health/life/auto/home/travel)
- **Claims** — File claims, admin review workflow (submitted → under review → approved → paid)
- **Payments** — Premium payments with multiple methods, full transaction history
- **Dashboard** — Charts, stats, portfolio overview using Recharts
- **Profile** — Update profile, change password

## Quick Start

### With Docker (recommended)

```bash
# Start all services
docker-compose up --build

# Access the app
open http://localhost:3000

# Default admin credentials
Username: admin
Password: admin123  (update the seed in init.sql if needed)
```

### Local Development

**Prerequisites:** Python 3.11+, Node 18+, MySQL 8.0

**1. Start MySQL and run init.sql**
```bash
mysql -u root -p < init.sql
```

**2. Start each service**
```bash
# User Service
cd user-service && pip install -r requirements.txt
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/insurance_db \
SECRET_KEY=my-secret uvicorn main:app --port 8001

# Policy Service
cd policy-service && pip install -r requirements.txt
DATABASE_URL=... SECRET_KEY=my-secret uvicorn main:app --port 8002

# Claims Service
cd claims-service && uvicorn main:app --port 8003

# Payment Service
cd payment-service && uvicorn main:app --port 8004

# API Gateway
cd api-gateway && pip install -r requirements.txt
uvicorn main:app --port 8000
```

**3. Start frontend**
```bash
cd frontend
npm install
REACT_APP_API_URL=http://localhost:8000 npm start
```

## API Docs

Each FastAPI service exposes interactive docs:
- User Service: http://localhost:8001/docs
- Policy Service: http://localhost:8002/docs
- Claims Service: http://localhost:8003/docs
- Payment Service: http://localhost:8004/docs
- Gateway: http://localhost:8000/docs

## Database Schema

- **users** — Authentication, profile, role
- **policies** — Insurance policy records per user
- **claims** — Claim submissions linked to policies
- **payments** — Premium and payout transaction records

## Environment Variables

See [.env](.env) — update `MYSQL_ROOT_PASSWORD` and `SECRET_KEY` before production deployment.
