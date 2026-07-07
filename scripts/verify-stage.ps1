$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " WMS PROJECT VERIFICATION" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$requiredFiles = @(
  # APP
  "src/app/app.ts",
  "src/app/app.html",
  "src/app/app.config.ts",
  "src/app/app.routes.ts",

  # CORE MODELS
  "src/app/core/models/base-entity.ts",
  "src/app/core/models/api-response.ts",
  "src/app/core/models/paginated-result.ts",
  "src/app/core/models/query-params.ts",
  "src/app/core/models/auth-user.ts",
  "src/app/core/models/user-role.enum.ts",
  "src/app/core/models/unit-of-measure.enum.ts",
  "src/app/core/models/movement-type.enum.ts",
  "src/app/core/models/transfer-status.enum.ts",
  "src/app/core/models/shipment-status.enum.ts",
  "src/app/core/models/stock-status.enum.ts",
  "src/app/core/models/audit-action-type.enum.ts",

  # CORE SERVICES
  "src/app/core/services/storage.ts",
  "src/app/core/services/mock-db.ts",
  "src/app/core/services/audit-log.ts",
  "src/app/core/services/notification.ts",
  "src/app/core/services/loading.ts",
  "src/app/core/services/auth.ts",
  "src/app/core/services/confirm-dialog.ts",
  "src/app/core/services/id-generator.ts",

  # GUARDS
  "src/app/core/guards/auth-guard.ts",
  "src/app/core/guards/role-guard.ts",
  "src/app/core/guards/unsaved-changes-guard.ts",

  # SHARED DIRECTIVES
  "src/app/shared/directives/permission.ts",
  "src/app/shared/directives/autofocus.ts",
  "src/app/shared/directives/debounce.ts",

  # SHARED PIPES
  "src/app/shared/pipes/status-label-pipe.ts",
  "src/app/shared/pipes/money-pipe.ts",
  "src/app/shared/pipes/app-date-pipe.ts",
  "src/app/shared/pipes/remaining-time-pipe.ts",

  # SHARED VALIDATORS
  "src/app/shared/validators/required-if.validator.ts",
  "src/app/shared/validators/positive-number.validator.ts",
  "src/app/shared/validators/date-range.validator.ts",
  "src/app/shared/validators/match-fields.validator.ts",

  # PRODUCT MODELS
  "src/app/features/products/models/product.ts",
  "src/app/features/products/models/barcode-record.ts",

  # WAREHOUSE MODEL
  "src/app/features/warehouses/models/warehouse.ts",

  # STOCK MODELS
  "src/app/features/stock-movements/models/stock-movement.ts",
  "src/app/features/stock-movements/models/stock-balance.ts",
  "src/app/features/stock-movements/models/inventory-query.ts",

  # TRANSFER MODEL
  "src/app/features/transfers/models/transfer-request.ts",

  # SHIPMENT MODELS
  "src/app/features/shipments/models/shipment.ts",
  "src/app/features/shipments/models/shipment-item.ts",

  # CRITICAL STOCK
  "src/app/features/critical-stock/models/low-stock-rule.ts",

  # AUDIT
  "src/app/features/audit-log/models/audit-log-entry.ts",

  # ROUTES
  "src/app/features/dashboard/dashboard.routes.ts",
  "src/app/features/products/products.routes.ts",
  "src/app/features/warehouses/warehouses.routes.ts",
  "src/app/features/stock-movements/stock-movements.routes.ts",
  "src/app/features/transfers/transfers.routes.ts",
  "src/app/features/shipments/shipments.routes.ts",
  "src/app/features/critical-stock/critical-stock.routes.ts",
  "src/app/features/reports/reports.routes.ts",
  "src/app/features/audit-log/audit-log.routes.ts"
)

$missingFiles = @()

foreach ($file in $requiredFiles) {
  if (-not (Test-Path $file)) {
    $missingFiles += $file
  }
}

if ($missingFiles.Count -gt 0) {
  Write-Host "MISSING FILES:" -ForegroundColor Red

  foreach ($file in $missingFiles) {
    Write-Host "  X $file" -ForegroundColor Red
  }

  Write-Host ""
  exit 1
}

Write-Host "1/3 Required file check passed." -ForegroundColor Green


Write-Host ""
Write-Host "Checking TypeScript files that are completely empty..." -ForegroundColor Yellow

$emptyTsFiles = Get-ChildItem `
  -Path "src/app" `
  -Recurse `
  -Filter "*.ts" |
  Where-Object {
    $_.Length -eq 0
  }

if ($emptyTsFiles.Count -gt 0) {
  Write-Host ""
  Write-Host "EMPTY TYPESCRIPT FILES FOUND:" -ForegroundColor Yellow

  foreach ($file in $emptyTsFiles) {
    Write-Host "  ! $($file.FullName)" -ForegroundColor Yellow
  }

  Write-Host ""
  Write-Host "Note: Some files may intentionally be pending implementation." -ForegroundColor Yellow
}
else {
  Write-Host "2/3 No completely empty TypeScript files." -ForegroundColor Green
}


Write-Host ""
Write-Host "Running Angular production build..." -ForegroundColor Cyan
Write-Host ""

ng build

if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "BUILD FAILED." -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host ""
Write-Host "3/3 Angular build passed." -ForegroundColor Green

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host " CHECKPOINT PASSED" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
