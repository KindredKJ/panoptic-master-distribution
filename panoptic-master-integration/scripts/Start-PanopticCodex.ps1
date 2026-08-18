$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..
Write-Host "Starting Codex in Panoptic integration workspace..." -ForegroundColor Cyan
Write-Host "Project instructions: AGENTS.md" -ForegroundColor DarkGray
Write-Host "Master mission: PANOPTIC_MASTER_CODEX_PROMPT.md" -ForegroundColor DarkGray
& codex
