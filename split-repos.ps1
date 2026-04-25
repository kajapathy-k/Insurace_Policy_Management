$ErrorActionPreference = "Stop"

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$exportBase = Split-Path -Parent $rootDir

function New-CleanRepo {
    param([string]$Name)
    $repoPath = Join-Path $exportBase $Name
    if (Test-Path $repoPath) {
        Remove-Item -Recurse -Force $repoPath
    }
    New-Item -ItemType Directory -Path $repoPath | Out-Null
    return $repoPath
}

function Copy-FileSafe {
    param(
        [string]$Source,
        [string]$Destination
    )
    $parent = Split-Path -Parent $Destination
    if (-not (Test-Path $parent)) {
        New-Item -ItemType Directory -Path $parent -Force | Out-Null
    }
    Copy-Item -Path $Source -Destination $Destination -Force
}

function Copy-DirSafe {
    param(
        [string]$Source,
        [string]$Destination
    )
    New-Item -ItemType Directory -Path $Destination -Force | Out-Null
    Copy-Item -Path (Join-Path $Source "*") -Destination $Destination -Recurse -Force
}

function Copy-CommonGitIgnore {
    param([string]$RepoPath)
    Copy-FileSafe -Source (Join-Path $rootDir ".gitignore") -Destination (Join-Path $RepoPath ".gitignore")
}

Write-Host "Creating export folders in: $exportBase"

$apiRepo = New-CleanRepo "insurance-api-gateway"
$userRepo = New-CleanRepo "insurance-user-service"
$policyRepo = New-CleanRepo "insurance-policy-service"
$claimsRepo = New-CleanRepo "insurance-claims-service"
$paymentRepo = New-CleanRepo "insurance-payment-service"
$frontendRepo = New-CleanRepo "insurance-frontend"
$ciTemplatesRepo = New-CleanRepo "insurance-ci-templates"
$ciOrchestratorRepo = New-CleanRepo "insurance-ci-orchestrator"

$allRepos = @($apiRepo, $userRepo, $policyRepo, $claimsRepo, $paymentRepo, $frontendRepo, $ciTemplatesRepo, $ciOrchestratorRepo)
foreach ($repo in $allRepos) {
    Copy-CommonGitIgnore -RepoPath $repo
}

# API Gateway
Copy-FileSafe (Join-Path $rootDir "api-gateway/.dockerignore") (Join-Path $apiRepo ".dockerignore")
Copy-FileSafe (Join-Path $rootDir "api-gateway/Dockerfile") (Join-Path $apiRepo "Dockerfile")
Copy-FileSafe (Join-Path $rootDir "api-gateway/main.py") (Join-Path $apiRepo "main.py")
Copy-FileSafe (Join-Path $rootDir "api-gateway/requirements.txt") (Join-Path $apiRepo "requirements.txt")
Copy-DirSafe (Join-Path $rootDir "k8s/api-gateway") (Join-Path $apiRepo "deploy/k8s")

# User Service
Copy-FileSafe (Join-Path $rootDir "user-service/.dockerignore") (Join-Path $userRepo ".dockerignore")
Copy-FileSafe (Join-Path $rootDir "user-service/Dockerfile") (Join-Path $userRepo "Dockerfile")
Copy-FileSafe (Join-Path $rootDir "user-service/auth.py") (Join-Path $userRepo "auth.py")
Copy-FileSafe (Join-Path $rootDir "user-service/database.py") (Join-Path $userRepo "database.py")
Copy-FileSafe (Join-Path $rootDir "user-service/main.py") (Join-Path $userRepo "main.py")
Copy-FileSafe (Join-Path $rootDir "user-service/models.py") (Join-Path $userRepo "models.py")
Copy-FileSafe (Join-Path $rootDir "user-service/requirements.txt") (Join-Path $userRepo "requirements.txt")
Copy-FileSafe (Join-Path $rootDir "user-service/schemas.py") (Join-Path $userRepo "schemas.py")
Copy-DirSafe (Join-Path $rootDir "k8s/user-service") (Join-Path $userRepo "deploy/k8s")

# Policy Service
Copy-FileSafe (Join-Path $rootDir "policy-service/.dockerignore") (Join-Path $policyRepo ".dockerignore")
Copy-FileSafe (Join-Path $rootDir "policy-service/Dockerfile") (Join-Path $policyRepo "Dockerfile")
Copy-FileSafe (Join-Path $rootDir "policy-service/auth.py") (Join-Path $policyRepo "auth.py")
Copy-FileSafe (Join-Path $rootDir "policy-service/database.py") (Join-Path $policyRepo "database.py")
Copy-FileSafe (Join-Path $rootDir "policy-service/main.py") (Join-Path $policyRepo "main.py")
Copy-FileSafe (Join-Path $rootDir "policy-service/models.py") (Join-Path $policyRepo "models.py")
Copy-FileSafe (Join-Path $rootDir "policy-service/requirements.txt") (Join-Path $policyRepo "requirements.txt")
Copy-FileSafe (Join-Path $rootDir "policy-service/schemas.py") (Join-Path $policyRepo "schemas.py")
Copy-DirSafe (Join-Path $rootDir "k8s/policy-service") (Join-Path $policyRepo "deploy/k8s")

# Claims Service
Copy-FileSafe (Join-Path $rootDir "claims-service/.dockerignore") (Join-Path $claimsRepo ".dockerignore")
Copy-FileSafe (Join-Path $rootDir "claims-service/Dockerfile") (Join-Path $claimsRepo "Dockerfile")
Copy-FileSafe (Join-Path $rootDir "claims-service/auth.py") (Join-Path $claimsRepo "auth.py")
Copy-FileSafe (Join-Path $rootDir "claims-service/database.py") (Join-Path $claimsRepo "database.py")
Copy-FileSafe (Join-Path $rootDir "claims-service/main.py") (Join-Path $claimsRepo "main.py")
Copy-FileSafe (Join-Path $rootDir "claims-service/models.py") (Join-Path $claimsRepo "models.py")
Copy-FileSafe (Join-Path $rootDir "claims-service/requirements.txt") (Join-Path $claimsRepo "requirements.txt")
Copy-FileSafe (Join-Path $rootDir "claims-service/schemas.py") (Join-Path $claimsRepo "schemas.py")
Copy-DirSafe (Join-Path $rootDir "k8s/claims-service") (Join-Path $claimsRepo "deploy/k8s")

# Payment Service
Copy-FileSafe (Join-Path $rootDir "payment-service/.dockerignore") (Join-Path $paymentRepo ".dockerignore")
Copy-FileSafe (Join-Path $rootDir "payment-service/Dockerfile") (Join-Path $paymentRepo "Dockerfile")
Copy-FileSafe (Join-Path $rootDir "payment-service/auth.py") (Join-Path $paymentRepo "auth.py")
Copy-FileSafe (Join-Path $rootDir "payment-service/database.py") (Join-Path $paymentRepo "database.py")
Copy-FileSafe (Join-Path $rootDir "payment-service/main.py") (Join-Path $paymentRepo "main.py")
Copy-FileSafe (Join-Path $rootDir "payment-service/models.py") (Join-Path $paymentRepo "models.py")
Copy-FileSafe (Join-Path $rootDir "payment-service/requirements.txt") (Join-Path $paymentRepo "requirements.txt")
Copy-FileSafe (Join-Path $rootDir "payment-service/schemas.py") (Join-Path $paymentRepo "schemas.py")
Copy-DirSafe (Join-Path $rootDir "k8s/payment-service") (Join-Path $paymentRepo "deploy/k8s")

# Frontend
Copy-FileSafe (Join-Path $rootDir "frontend/.dockerignore") (Join-Path $frontendRepo ".dockerignore")
Copy-FileSafe (Join-Path $rootDir "frontend/Dockerfile") (Join-Path $frontendRepo "Dockerfile")
Copy-FileSafe (Join-Path $rootDir "frontend/nginx.conf") (Join-Path $frontendRepo "nginx.conf")
Copy-FileSafe (Join-Path $rootDir "frontend/package.json") (Join-Path $frontendRepo "package.json")
Copy-FileSafe (Join-Path $rootDir "frontend/package-lock.json") (Join-Path $frontendRepo "package-lock.json")
Copy-DirSafe (Join-Path $rootDir "frontend/public") (Join-Path $frontendRepo "public")
Copy-DirSafe (Join-Path $rootDir "frontend/src") (Join-Path $frontendRepo "src")
Copy-DirSafe (Join-Path $rootDir "k8s/frontend") (Join-Path $frontendRepo "deploy/k8s")

# CI Orchestrator
Copy-FileSafe (Join-Path $rootDir "docker-compose.yml") (Join-Path $ciOrchestratorRepo "docker-compose.yml")
Copy-FileSafe (Join-Path $rootDir "init.sql") (Join-Path $ciOrchestratorRepo "init.sql")
Copy-FileSafe (Join-Path $rootDir "start-local.sh") (Join-Path $ciOrchestratorRepo "start-local.sh")
Copy-FileSafe (Join-Path $rootDir "README.md") (Join-Path $ciOrchestratorRepo "README.md")
Copy-DirSafe (Join-Path $rootDir "k8s") (Join-Path $ciOrchestratorRepo "k8s")
Copy-FileSafe (Join-Path $rootDir "monorepo-separation-report.md") (Join-Path $ciOrchestratorRepo "monorepo-separation-report.md")

# CI Templates skeleton (no workflows yet)
New-Item -ItemType Directory -Path (Join-Path $ciTemplatesRepo "templates") -Force | Out-Null
@"
# insurance-ci-templates

This repository is reserved for reusable CI/CD templates and shared pipeline fragments.

No workflow files were generated by the monorepo split preparation.
"@ | Set-Content -Path (Join-Path $ciTemplatesRepo "README.md") -Encoding UTF8

@"
# templates

Place reusable workflow templates and shared automation assets here.
"@ | Set-Content -Path (Join-Path $ciTemplatesRepo "templates/README.md") -Encoding UTF8

Write-Host "Done. Export repositories created:"
$allRepos | ForEach-Object { Write-Host "- $_" }
