# INSURANCE Monorepo Separation Report

## 1) Current Source Tree Ownership

### Service source ownership (direct move)

- insurance-api-gateway
  - api-gateway/.dockerignore
  - api-gateway/Dockerfile
  - api-gateway/main.py
  - api-gateway/requirements.txt

- insurance-user-service
  - user-service/.dockerignore
  - user-service/auth.py
  - user-service/database.py
  - user-service/Dockerfile
  - user-service/main.py
  - user-service/models.py
  - user-service/requirements.txt
  - user-service/schemas.py

- insurance-policy-service
  - policy-service/.dockerignore
  - policy-service/auth.py
  - policy-service/database.py
  - policy-service/Dockerfile
  - policy-service/main.py
  - policy-service/models.py
  - policy-service/requirements.txt
  - policy-service/schemas.py

- insurance-claims-service
  - claims-service/.dockerignore
  - claims-service/auth.py
  - claims-service/database.py
  - claims-service/Dockerfile
  - claims-service/main.py
  - claims-service/models.py
  - claims-service/requirements.txt
  - claims-service/schemas.py

- insurance-payment-service
  - payment-service/.dockerignore
  - payment-service/auth.py
  - payment-service/database.py
  - payment-service/Dockerfile
  - payment-service/main.py
  - payment-service/models.py
  - payment-service/requirements.txt
  - payment-service/schemas.py

- insurance-frontend
  - frontend/.dockerignore
  - frontend/Dockerfile
  - frontend/nginx.conf
  - frontend/package.json
  - frontend/package-lock.json
  - frontend/public/index.html
  - frontend/src/**

### Platform/orchestration ownership (direct move)

- insurance-ci-orchestrator
  - docker-compose.yml
  - init.sql
  - start-local.sh
  - README.md
  - k8s/**

### Template ownership

- insurance-ci-templates
  - no reusable CI workflow files currently exist in this monorepo
  - repository should start with docs/templates skeleton only

## 2) Hidden Monorepo Dependencies Detected

### Root-level .env coupling

- docker-compose references root secrets and settings from .env:
  - docker-compose.yml
    - MYSQL_ROOT_PASSWORD
    - SECRET_KEY
    - ALGORITHM
    - ACCESS_TOKEN_EXPIRE_MINUTES

Impact:
- services run correctly in compose because root .env injects values centrally.
- after split, each repo must provide its own env strategy for local run and CI.

### Shared script coupling

- start-local.sh starts all services and frontend in one script with hardcoded paths and credentials.
- start-local.sh contains machine-specific paths and all-service assumptions.

Impact:
- this script belongs in orchestrator only.
- it is not reusable as-is in per-service repos.

### Docker compose assumptions

- single compose file assumes all service folders exist side-by-side.
- single shared mysql service and shared init.sql mounted from repository root.
- internal hostnames use compose DNS (user-service, policy-service, claims-service, payment-service, mysql).

Impact:
- per-service repos cannot use current compose unchanged unless they are orchestrated from a central repo.

### Root-level configuration dependencies

- README.md documents monorepo startup only.
- init.sql is shared DB bootstrap for all services.
- k8s folder is centralized for all services.

Impact:
- per-service CI should not depend on root orchestrator files.
- infra deployment ownership must be explicit (recommended: orchestrator repo).

### Runtime hardcoded assumptions inside services

- policy-service/auth.py, claims-service/auth.py, payment-service/auth.py
  - OAuth2 tokenUrl hardcoded to http://localhost:8001/auth/login

Impact:
- docs/openapi auth flow metadata is environment-specific.
- independent deployment behind non-localhost endpoints can become inconsistent.

- user-service/database.py, policy-service/database.py, claims-service/database.py, payment-service/database.py
  - fallback DATABASE_URL includes mysql+pymysql://root:InsurePass@2024@localhost:3306/insurance_db

Impact:
- fallback embeds credentials and environment assumptions.
- in independent repos, env var override must always be present.

- api-gateway/main.py
  - defaults downstream URLs to localhost service ports.

Impact:
- independent gateway deployment still works, but URL envs must be configured per environment.

- frontend/src/services/api.js
  - base URL uses REACT_APP_API_URL or /api fallback.

Impact:
- frontend repo is independently runnable, but reverse-proxy behavior must be defined per deployment.

## 3) Independent Runnable/Buildable Status by Target Repo

- insurance-api-gateway
  - docker-buildable: yes
  - independently runnable: yes (requires USER_SERVICE_URL/POLICY_SERVICE_URL/CLAIMS_SERVICE_URL/PAYMENT_SERVICE_URL envs)

- insurance-user-service
  - docker-buildable: yes
  - independently runnable: yes (requires DATABASE_URL + auth envs)

- insurance-policy-service
  - docker-buildable: yes
  - independently runnable: yes (requires DATABASE_URL + auth envs)

- insurance-claims-service
  - docker-buildable: yes
  - independently runnable: yes (requires DATABASE_URL + auth envs)

- insurance-payment-service
  - docker-buildable: yes
  - independently runnable: yes (requires DATABASE_URL + auth envs)

- insurance-frontend
  - docker-buildable: yes
  - independently runnable: yes (requires REACT_APP_API_URL or reverse proxy to /api)

## 4) File Movement Plan

### Files to move (single-owner)

- Move each service folder contents into corresponding service repository root.
- Move orchestrator artifacts (docker-compose.yml, init.sql, start-local.sh, README.md, k8s/) into insurance-ci-orchestrator.

### Files to duplicate

- Duplicate root .gitignore into all target repos for baseline ignore policy.
- Duplicate service-specific k8s manifests into each service repo under deploy/k8s/:
  - k8s/api-gateway/* -> insurance-api-gateway/deploy/k8s/
  - k8s/user-service/* -> insurance-user-service/deploy/k8s/
  - k8s/policy-service/* -> insurance-policy-service/deploy/k8s/
  - k8s/claims-service/* -> insurance-claims-service/deploy/k8s/
  - k8s/payment-service/* -> insurance-payment-service/deploy/k8s/
  - k8s/frontend/* -> insurance-frontend/deploy/k8s/

Reason:
- enables service-level deployment ownership while retaining centralized orchestration copy.

### Files to exclude from split exports

- .env (secrets)
- .DS_Store
- .claude/
- .git/
- __pycache__/
- frontend/node_modules/
- frontend/build/

## 5) Pre-CI Issues to Fix Before Independent Pipelines

1. Hardcoded localhost auth tokenUrl in policy/claims/payment auth modules should be environment-driven.
2. Per-service env documentation is missing (.env.example per repo recommended).
3. start-local.sh is machine-specific and should not be used as CI entrypoint.
4. Frontend stack is CRA-based although project description says Vite; align naming/docs before pipeline standardization.
5. CI templates repo has no reusable pipeline artifacts yet.

## 6) Output of This Preparation

Created automation scripts:

- split-repos.sh
- split-repos.ps1

Behavior:

- creates export folders adjacent to this monorepo:
  - insurance-api-gateway
  - insurance-user-service
  - insurance-policy-service
  - insurance-claims-service
  - insurance-payment-service
  - insurance-frontend
  - insurance-ci-templates
  - insurance-ci-orchestrator
- copies the mapped files for each repository.
- excludes runtime/generated artifacts.
