param(
    [string]$GDriveRoot = ""
)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$SnapshotDir = Join-Path $Root "snapshots"
New-Item -ItemType Directory -Force -Path $SnapshotDir | Out-Null

$Zip = Join-Path $SnapshotDir "panoptic-integration-$Stamp.zip"
$Temp = Join-Path $env:TEMP "panoptic-integration-$Stamp"
New-Item -ItemType Directory -Force -Path $Temp | Out-Null

$Exclude = @(".git","snapshots",".bootstrap-backup","node_modules",".data")
Get-ChildItem -LiteralPath $Root -Force | Where-Object { $Exclude -notcontains $_.Name } |
    Copy-Item -Destination $Temp -Recurse -Force

Compress-Archive -Path (Join-Path $Temp "*") -DestinationPath $Zip -CompressionLevel Optimal -Force
Remove-Item -LiteralPath $Temp -Recurse -Force

$Hash = Get-FileHash -LiteralPath $Zip -Algorithm SHA256
$Hash | ConvertTo-Json | Set-Content -LiteralPath "$Zip.sha256.json" -Encoding utf8NoBOM

if ($GDriveRoot -and (Test-Path -LiteralPath ([System.IO.Path]::GetPathRoot($GDriveRoot)))) {
    New-Item -ItemType Directory -Force -Path $GDriveRoot | Out-Null
    Copy-Item -LiteralPath $Zip -Destination $GDriveRoot -Force
    Copy-Item -LiteralPath "$Zip.sha256.json" -Destination $GDriveRoot -Force
    Write-Host "Copied snapshot to $GDriveRoot" -ForegroundColor Green
}

Write-Host "Snapshot: $Zip" -ForegroundColor Green
Write-Host "SHA256:   $($Hash.Hash)" -ForegroundColor Green
