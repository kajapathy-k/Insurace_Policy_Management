#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXPORT_BASE="$(cd "$ROOT_DIR/.." && pwd)"

create_repo() {
  local repo_name="$1"
  local repo_path="$EXPORT_BASE/$repo_name"
  rm -rf "$repo_path"
  mkdir -p "$repo_path"
  printf "%s" "$repo_path"
}

copy_file() {
  local src="$1"
  local dst="$2"
  mkdir -p "$(dirname "$dst")"
  cp "$src" "$dst"
}

copy_dir() {
  local src="$1"
  local dst="$2"
  mkdir -p "$dst"
  cp -a "$src/." "$dst/"
}

copy_common_gitignore() {
  local dst_repo="$1"
  copy_file "$ROOT_DIR/.gitignore" "$dst_repo/.gitignore"
}

echo "Creating export folders in: $EXPORT_BASE"

api_repo="$(create_repo "insurance-api-gateway")"
user_repo="$(create_repo "insurance-user-service")"
policy_repo="$(create_repo "insurance-policy-service")"
claims_repo="$(create_repo "insurance-claims-service")"
payment_repo="$(create_repo "insurance-payment-service")"
frontend_repo="$(create_repo "insurance-frontend")"
ci_templates_repo="$(create_repo "insurance-ci-templates")"
ci_orchestrator_repo="$(create_repo "insurance-ci-orchestrator")"

for repo in "$api_repo" "$user_repo" "$policy_repo" "$claims_repo" "$payment_repo" "$frontend_repo" "$ci_templates_repo" "$ci_orchestrator_repo"; do
  copy_common_gitignore "$repo"
done

# API Gateway
copy_file "$ROOT_DIR/api-gateway/.dockerignore" "$api_repo/.dockerignore"
copy_file "$ROOT_DIR/api-gateway/Dockerfile" "$api_repo/Dockerfile"
copy_file "$ROOT_DIR/api-gateway/main.py" "$api_repo/main.py"
copy_file "$ROOT_DIR/api-gateway/requirements.txt" "$api_repo/requirements.txt"
copy_dir "$ROOT_DIR/k8s/api-gateway" "$api_repo/deploy/k8s"

# User Service
copy_file "$ROOT_DIR/user-service/.dockerignore" "$user_repo/.dockerignore"
copy_file "$ROOT_DIR/user-service/Dockerfile" "$user_repo/Dockerfile"
copy_file "$ROOT_DIR/user-service/auth.py" "$user_repo/auth.py"
copy_file "$ROOT_DIR/user-service/database.py" "$user_repo/database.py"
copy_file "$ROOT_DIR/user-service/main.py" "$user_repo/main.py"
copy_file "$ROOT_DIR/user-service/models.py" "$user_repo/models.py"
copy_file "$ROOT_DIR/user-service/requirements.txt" "$user_repo/requirements.txt"
copy_file "$ROOT_DIR/user-service/schemas.py" "$user_repo/schemas.py"
copy_dir "$ROOT_DIR/k8s/user-service" "$user_repo/deploy/k8s"

# Policy Service
copy_file "$ROOT_DIR/policy-service/.dockerignore" "$policy_repo/.dockerignore"
copy_file "$ROOT_DIR/policy-service/Dockerfile" "$policy_repo/Dockerfile"
copy_file "$ROOT_DIR/policy-service/auth.py" "$policy_repo/auth.py"
copy_file "$ROOT_DIR/policy-service/database.py" "$policy_repo/database.py"
copy_file "$ROOT_DIR/policy-service/main.py" "$policy_repo/main.py"
copy_file "$ROOT_DIR/policy-service/models.py" "$policy_repo/models.py"
copy_file "$ROOT_DIR/policy-service/requirements.txt" "$policy_repo/requirements.txt"
copy_file "$ROOT_DIR/policy-service/schemas.py" "$policy_repo/schemas.py"
copy_dir "$ROOT_DIR/k8s/policy-service" "$policy_repo/deploy/k8s"

# Claims Service
copy_file "$ROOT_DIR/claims-service/.dockerignore" "$claims_repo/.dockerignore"
copy_file "$ROOT_DIR/claims-service/Dockerfile" "$claims_repo/Dockerfile"
copy_file "$ROOT_DIR/claims-service/auth.py" "$claims_repo/auth.py"
copy_file "$ROOT_DIR/claims-service/database.py" "$claims_repo/database.py"
copy_file "$ROOT_DIR/claims-service/main.py" "$claims_repo/main.py"
copy_file "$ROOT_DIR/claims-service/models.py" "$claims_repo/models.py"
copy_file "$ROOT_DIR/claims-service/requirements.txt" "$claims_repo/requirements.txt"
copy_file "$ROOT_DIR/claims-service/schemas.py" "$claims_repo/schemas.py"
copy_dir "$ROOT_DIR/k8s/claims-service" "$claims_repo/deploy/k8s"

# Payment Service
copy_file "$ROOT_DIR/payment-service/.dockerignore" "$payment_repo/.dockerignore"
copy_file "$ROOT_DIR/payment-service/Dockerfile" "$payment_repo/Dockerfile"
copy_file "$ROOT_DIR/payment-service/auth.py" "$payment_repo/auth.py"
copy_file "$ROOT_DIR/payment-service/database.py" "$payment_repo/database.py"
copy_file "$ROOT_DIR/payment-service/main.py" "$payment_repo/main.py"
copy_file "$ROOT_DIR/payment-service/models.py" "$payment_repo/models.py"
copy_file "$ROOT_DIR/payment-service/requirements.txt" "$payment_repo/requirements.txt"
copy_file "$ROOT_DIR/payment-service/schemas.py" "$payment_repo/schemas.py"
copy_dir "$ROOT_DIR/k8s/payment-service" "$payment_repo/deploy/k8s"

# Frontend
copy_file "$ROOT_DIR/frontend/.dockerignore" "$frontend_repo/.dockerignore"
copy_file "$ROOT_DIR/frontend/Dockerfile" "$frontend_repo/Dockerfile"
copy_file "$ROOT_DIR/frontend/nginx.conf" "$frontend_repo/nginx.conf"
copy_file "$ROOT_DIR/frontend/package.json" "$frontend_repo/package.json"
copy_file "$ROOT_DIR/frontend/package-lock.json" "$frontend_repo/package-lock.json"
copy_dir "$ROOT_DIR/frontend/public" "$frontend_repo/public"
copy_dir "$ROOT_DIR/frontend/src" "$frontend_repo/src"
copy_dir "$ROOT_DIR/k8s/frontend" "$frontend_repo/deploy/k8s"

# CI Orchestrator
copy_file "$ROOT_DIR/docker-compose.yml" "$ci_orchestrator_repo/docker-compose.yml"
copy_file "$ROOT_DIR/init.sql" "$ci_orchestrator_repo/init.sql"
copy_file "$ROOT_DIR/start-local.sh" "$ci_orchestrator_repo/start-local.sh"
copy_file "$ROOT_DIR/README.md" "$ci_orchestrator_repo/README.md"
copy_dir "$ROOT_DIR/k8s" "$ci_orchestrator_repo/k8s"

# CI Templates skeleton (no workflows yet)
mkdir -p "$ci_templates_repo/templates"
cat > "$ci_templates_repo/README.md" << 'EOF'
# insurance-ci-templates

This repository is reserved for reusable CI/CD templates and shared pipeline fragments.

No workflow files were generated by the monorepo split preparation.
EOF

cat > "$ci_templates_repo/templates/README.md" << 'EOF'
# templates

Place reusable workflow templates and shared automation assets here.
EOF

# Include the split report in orchestrator export for migration planning traceability.
copy_file "$ROOT_DIR/monorepo-separation-report.md" "$ci_orchestrator_repo/monorepo-separation-report.md"

echo "Done. Export repositories created:"
echo "- $api_repo"
echo "- $user_repo"
echo "- $policy_repo"
echo "- $claims_repo"
echo "- $payment_repo"
echo "- $frontend_repo"
echo "- $ci_templates_repo"
echo "- $ci_orchestrator_repo"
