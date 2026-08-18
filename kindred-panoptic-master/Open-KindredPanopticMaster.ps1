$ErrorActionPreference = "Stop"
Start-Process "http://127.0.0.1:8788/"
Write-Host "Dashboard opened. Use KBOX_BOOTSTRAP_TOKEN from .env.local when prompted." -ForegroundColor Cyan