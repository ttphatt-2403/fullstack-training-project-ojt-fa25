<#
Auto-migrate script for development.

This script will:
- Create a new migration with name Auto_yyyyMMddHHmmss
- If the generated migration is empty (no migrationBuilder calls), it will remove it
- Otherwise it will apply the migration to the database via `dotnet ef database update`

Usage (PowerShell from project folder):
  powershell -ExecutionPolicy Bypass -File .\scripts\auto-migrate.ps1

Notes:
- This is intended for local development only. Do NOT run this on production.
- Review the generated migration files before committing them.
#>

param(
    [string]$ProjectPath = ".",
    [string]$Project = "",
    [string]$StartupProject = "",
    [switch]$DoUpdate = $true
)

Push-Location $ProjectPath
try {
    # Ensure dotnet-ef is available
    Write-Host "Checking dotnet-ef..."
    $efCheck = & dotnet 'ef' '--version' 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "dotnet-ef not found or failed. Please install with: dotnet tool install --global dotnet-ef"
        exit 1
    }

    $timestamp = (Get-Date).ToString("yyyyMMddHHmmss")
    $migName = "Auto_$timestamp"

    # Build optional project arguments as an array (safe for external process calls)
    $projArgs = @()
    if ($Project -ne "") { $projArgs += "--project"; $projArgs += $Project }
    if ($StartupProject -ne "") { $projArgs += "--startup-project"; $projArgs += $StartupProject }

    Write-Host "Creating migration $migName ..."
    $addArgs = @('ef','migrations','add',$migName) + $projArgs
    & dotnet @addArgs
    if ($LASTEXITCODE -ne 0) {
        Write-Error "dotnet ef migrations add failed. Aborting."
        exit 1
    }

    $migrationsDir = Join-Path (Get-Location) "Migrations"
    if (-not (Test-Path $migrationsDir)) {
        Write-Host "Migrations folder not found; nothing to check."
        exit 0
    }

    # Find newest migration file created
    $migrationFile = Get-ChildItem -Path $migrationsDir -Filter "*$migName*.cs" -Recurse -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if (-not $migrationFile) {
        Write-Host "Migration file not found. It might have been created in a different folder or naming."
        exit 0
    }

    Write-Host "Checking migration file: $($migrationFile.FullName) ..."
    $migContent = Get-Content $migrationFile.FullName -Raw

    # Robust single-line regex to capture the entire Up method body across newlines
    $upMethodPattern = '(?s)protected\s+override\s+void\s+Up\s*\(\s*MigrationBuilder\s+\w+\s*\)\s*\{(.*?)\}'
    if ($migContent -match $upMethodPattern) {
        $upMethodBody = $Matches[1].Trim()
        $hasOperations = $upMethodBody -match 'migrationBuilder\.\w+\('
        if (-not $hasOperations) {
            Write-Host "Migration appears empty (no migrationBuilder operations in Up method). Removing migration..."
            $removeArgs = @('ef','migrations','remove','--force') + $projArgs
            & dotnet @removeArgs
            exit 0
        }
    } else {
        # Fallback: look for any migrationBuilder usage anywhere in file
        if ($migContent -notmatch 'migrationBuilder\.') {
            Write-Host "No migrationBuilder calls found in migration file. Removing migration..."
            $removeArgs = @('ef','migrations','remove','--force') + $projArgs
            & dotnet @removeArgs
            exit 0
        }
    }

    Write-Host "Migration contains changes." -ForegroundColor Green
    Write-Host "Migration file path: $($migrationFile.FullName)" -ForegroundColor Green
    if ($DoUpdate) {
        Write-Host "Applying migration to database..."
        $updateArgs = @('ef','database','update') + $projArgs
        & dotnet @updateArgs
        if ($LASTEXITCODE -ne 0) {
            Write-Error "dotnet ef database update failed."
            exit 1
        }
        Write-Host "Migration applied successfully."
    } else {
        Write-Host "DoUpdate not set; skipping database update."
    }
}
finally {
    Pop-Location
}
