# Insurance Policy Management Platform

This repository contains the end-to-end implementation of a full-stack insurance system, developed as a microservice architecture and evolved through all major deployment stages:

1. Local development
2. Containerization with Docker
3. Kubernetes manifests deployment
4. Helm chart templating for environments
5. Argo CD based GitOps automation

This README is written to be both project documentation and a ready-to-use PPT flow reference.

## 1. Project Goal

Build a scalable insurance platform where users can:

- Register and login securely
- Purchase and manage policies
- File and track claims
- Pay premiums and view payment history

And where admins/agents can:

- Manage users and policies
- Review claims lifecycle
- Monitor transactions and service health

## 2. Final System Architecture

```text
Frontend (React + Nginx)
                    |
                    v
API Gateway (FastAPI)
      |       |        |        |
      v       v        v        v
User   Policy    Claims   Payment  (FastAPI microservices)
                                    |
                                    v
                              MySQL
```

### Service and Port Mapping

| Component | Port | Responsibility |
|---|---:|---|
| Frontend | 3000 (local) / 8080 (container) | UI for customer/admin workflows |
| API Gateway | 8000 | Single entry point and routing |
| User Service | 8001 | Authentication and user management |
| Policy Service | 8002 | Policy lifecycle and policy data |
| Claims Service | 8003 | Claim submission and review |
| Payment Service | 8004 | Premium/payment records |
| MySQL | 3306 | Persistent relational database |

## 3. End-to-End Implementation Journey

### Phase A: Core Development (Microservices + Frontend)

- Developed each domain as an independent FastAPI service:
     - `user-service`
     - `policy-service`
     - `claims-service`
     - `payment-service`
- Built `api-gateway` to aggregate routes and hide internal service topology from clients.
- Built `frontend` React application that consumes gateway APIs.
- Added JWT-based auth and role-driven access flows.
- Created shared data model on MySQL with seed/init setup through `init.sql`.

### Key Result
Functional modular application with clear service boundaries and independent service codebases.

---

### Phase B: Local Development Workflow

Two local options are maintained:

1. Manual service startup for debugging each service independently
2. Convenience startup script (`start-local.sh`) for starting backend services and frontend together

### Key Result
Fast developer feedback loop and simple local testing setup.

---

### Phase C: Dockerization and Compose Orchestration

- Added Dockerfiles for all services and frontend.
- Added `docker-compose.yml` to orchestrate complete stack.
- Configured startup dependencies and health checks (MySQL readiness before services).
- Externalized core secrets/config through environment variables such as `MYSQL_ROOT_PASSWORD` and `SECRET_KEY`.

### Key Result
Single-command local stack boot with production-like service isolation.

Run:

```bash
docker-compose up --build
```

---

### Phase D: Kubernetes Manifests Deployment

- Created Kubernetes YAML manifests under `k8s/` for each component:
     - `Deployment`
     - `Service`
     - `ConfigMap`
     - `Secret`
- Added namespace-level resources (`k8s/namespace.yaml`).
- Added Gateway API resources:
     - `k8s/gateway.yaml`
     - `k8s/httproute.yaml`

Routing behavior:

- `/api/*` -> API Gateway service (with prefix rewrite)
- `/` -> Frontend service

### Key Result
Cluster-native deployment with external traffic handling via Gateway + HTTPRoute.

---

### Phase E: Helm Conversion (Environment-Aware Packaging)

- Converted static Kubernetes manifests into reusable Helm charts in `helm/`.
- Maintained independent chart per service:
  - `helm/api-gateway`
  - `helm/user-service`
  - `helm/policy-service`
  - `helm/claims-service`
  - `helm/payment-service`
  - `helm/frontend`
  - `helm/mysql`
- Added per-environment values files:
  - `values-dev.yaml`
  - `values-prod.yaml`

### Key Result
Reusable, parameterized deployments for dev/prod without duplicating manifests.

Example install:

```bash
helm upgrade --install api-gateway ./helm/api-gateway -f ./helm/api-gateway/values-dev.yaml
```

---

### Phase F: Argo CD GitOps Automation

- Added Argo CD Application manifests under `argocd/dev` and `argocd/prod`.
- Each app points to chart path + environment value file in Git.
- Enabled automated sync features:
     - `prune: true`
     - `selfHeal: true`
     - `CreateNamespace=true`

Environments currently modeled:

- `insurance-dev`
- `insurance-prod`

### Key Result
Declarative Git-driven deployments where cluster state continuously matches repository state.

---

## 4. CI/CD Operational Helpers

- `scripts/update-helm-tag.sh`
  - Updates Helm image repository/tag values for a service in dev or prod values file.
- `scripts/sync-caller-workflows.ps1`
  - Workflow helper script for synchronization tasks.

### Key Result
Simplified release tagging and environment promotion operations.

## 5. Current DevOps Maturity (What Is Implemented So Far)

Implemented:

- Microservice backend decomposition
- API Gateway aggregation pattern
- JWT-based auth flow
- React frontend integration
- Docker image build strategy for all services
- Docker Compose multi-container orchestration
- Kubernetes manifests for every component
- Gateway API and HTTPRoute based traffic entry
- Helm charts with dev/prod configuration
- Argo CD Application definitions for GitOps

This confirms the project has already progressed from application development to full cloud-native deployment architecture.

## 6. Suggested PPT Flow (Slide by Slide)

Use this exact flow for presentation:

1. Problem Statement and Project Objective
2. Why Microservices (Design Decision)
3. Service Breakdown and Responsibilities
4. High-Level Architecture Diagram
5. Development Phase (FastAPI + React + MySQL)
6. API Gateway and Authentication Flow
7. Dockerization Strategy (Dockerfiles + Compose)
8. Kubernetes Migration (Deployments/Services/Config/Secrets)
9. Ingress/Routing using Gateway API + HTTPRoute
10. Helm Adoption for Dev/Prod Reusability
11. Argo CD GitOps Setup (Auto Sync, Self Heal, Prune)
12. Environment Promotion and Image Tag Management
13. End-to-End Request Lifecycle Demo
14. Challenges Faced and Solutions Applied
15. Current Status and Next Roadmap

## 7. End-to-End Request Lifecycle (For Demo Narration)

1. User opens frontend UI.
2. Frontend calls API Gateway.
3. Gateway validates/authenticates and routes to target service.
4. Service reads/writes MySQL.
5. Response returns via Gateway to frontend.
6. In Kubernetes, Gateway API routes external traffic to frontend and `/api` traffic to backend gateway.
7. In GitOps mode, Argo CD keeps the deployed resources synced with Git state.

## 8. Local Run and Access Quick Commands

### Docker Compose

```bash
docker-compose up --build
```

### API Docs

- Gateway: http://localhost:8000/docs
- User: http://localhost:8001/docs
- Policy: http://localhost:8002/docs
- Claims: http://localhost:8003/docs
- Payment: http://localhost:8004/docs

### Frontend

- http://localhost:3000

## 9. Repository Layout (Top-Level)

```text
api-gateway/
user-service/
policy-service/
claims-service/
payment-service/
frontend/
k8s/
helm/
argocd/
scripts/
docker-compose.yml
init.sql
```

## 10. What Comes Next (Roadmap)

- Add centralized observability (metrics, logs, tracing)
- Add CI pipelines for build, scan, and deploy gates
- Add automated integration and load tests in pipeline
- Add secret management integration (Vault/External Secrets)
- Add autoscaling and progressive delivery strategy

---

If you use this README as your PPT source, you can narrate a complete engineering journey from coding to production-grade GitOps deployment with clear implementation evidence from this repository.
