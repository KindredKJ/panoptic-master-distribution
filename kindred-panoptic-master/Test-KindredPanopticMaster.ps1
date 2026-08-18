$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
node --test
if ($LASTEXITCODE -ne 0) { throw "Panoptic Master tests failed." }
node --env-file=.env.local scripts/verify-master.mjs
if ($LASTEXITCODE -ne 0) { throw "Panoptic Master integrity verification failed." }
Write-Host ""
Write-Host "PANOPTIC MASTER VERIFICATION PASSED" -ForegroundColor Green