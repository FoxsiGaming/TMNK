<#
Automated setup for the `admin` app (Windows PowerShell).
Copies `.env.example` to `.env` (if missing), installs deps, runs migrations and seeds.
#>

param(
    [switch]$SkipInstall
)

Push-Location -LiteralPath (Split-Path -Parent $MyInvocation.MyCommand.Definition)
Set-Location .

if (-not (Test-Path -Path .env)) {
    Copy-Item .env.example .env
    Write-Host "Created .env from .env.example — please review values before proceeding."
}

if (-not $SkipInstall) {
    Write-Host "Installing npm dependencies..."
    npm install
}

Write-Host "Running DB migration..."
npm run migrate

Write-Host "Seeding initial data..."
npm run seed

Write-Host "Setup complete. Start the server with: npm start"

Pop-Location
