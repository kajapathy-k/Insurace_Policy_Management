param(
    [Parameter(Mandatory = $true)]
    [string]$SourceRoot,

    [Parameter(Mandatory = $true)]
    [string]$TargetRoot,

    [string[]]$Services = @(
        'api-gateway',
        'claims-service',
        'payment-service',
        'policy-service',
        'user-service',
        'frontend'
    )
)

$workflowFiles = @(
    'ci.yaml',
    'ci-image-pipeline.yaml',
    'release.yaml'
)

foreach ($service in $Services) {
    $sourceServiceDir = Join-Path $SourceRoot $service
    $targetServiceDir = Join-Path $TargetRoot $service
    $targetWorkflowDir = Join-Path $targetServiceDir '.github\workflows'

    if (-not (Test-Path $sourceServiceDir)) {
        Write-Host "Skipping $service: source folder not found at $sourceServiceDir" -ForegroundColor Yellow
        continue
    }

    if (-not (Test-Path $targetServiceDir)) {
        Write-Host "Skipping $service: target repo folder not found at $targetServiceDir" -ForegroundColor Yellow
        continue
    }

    New-Item -ItemType Directory -Path $targetWorkflowDir -Force | Out-Null

    foreach ($workflowFile in $workflowFiles) {
        $sourceFile = Join-Path $sourceServiceDir $workflowFile
        $targetFile = Join-Path $targetWorkflowDir $workflowFile

        if (-not (Test-Path $sourceFile)) {
            Write-Host "Missing source workflow for $service : $workflowFile" -ForegroundColor Yellow
            continue
        }

        Copy-Item -Path $sourceFile -Destination $targetFile -Force
        Write-Host "Copied $service/$workflowFile -> $targetFile" -ForegroundColor Green
    }
}

Write-Host "Done. Review the target repos, commit, and push the workflow files from each service repo." -ForegroundColor Cyan
