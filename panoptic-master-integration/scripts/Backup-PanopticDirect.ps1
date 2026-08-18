param([string]$GDriveRoot = "")
$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$Snap = Join-Path $Root "snapshots"
New-Item -ItemType Directory -Force -Path $Snap | Out-Null

$Zip = Join-Path $Snap "panoptic-direct-$Stamp.zip"
$Temp = Join-Path $env:TEMP "panoptic-direct-$Stamp"

New-Item -ItemType Directory -Force -Path $Temp | Out-Null

$Exclude = @(".git","snapshots",".direct-integrator-backup","node_modules",".data")

Get-ChildItem -LiteralPath $Root -Force |
    Where-Object { $Exclude -notcontains $_.Name } |
    Copy-Item -Destination $Temp -Recurse -Force

Compress-Archive -Path (Join-Path $Temp "*") -DestinationPath $Zip -CompressionLevel Optimal -Force
Remove-Item -LiteralPath $Temp -Recurse -Force

$Hash = Get-FileHash -LiteralPath $Zip -Algorithm SHA256
$Manifest = [ordered]@{
    file = $Zip
    sha256 = $Hash.Hash
    createdAt = (Get-Date).ToString("o")
}

$ManifestPath = "$Zip.sha256.json"
$Manifest | ConvertTo-Json | Set-Content -LiteralPath $ManifestPath -Encoding utf8NoBOM

if ($GDriveRoot) {
    $DriveRoot = [IO.Path]::GetPathRoot($GDriveRoot)
    if ($DriveRoot -and (Test-Path -LiteralPath $DriveRoot)) {
        New-Item -ItemType Directory -Force -Path $GDriveRoot | Out-Null
        Copy-Item -LiteralPath $Zip -Destination $GDriveRoot -Force
        Copy-Item -LiteralPath $ManifestPath -Destination $GDriveRoot -Force
    }
}

Write-Host "Snapshot: $Zip" -ForegroundColor Green
Write-Host "SHA256:   $($Hash.Hash)" -ForegroundColor Green