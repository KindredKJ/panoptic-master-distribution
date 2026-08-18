param(
    [Parameter(Mandatory)][string]$SnapshotZip,
    [string]$Destination = "C:\KindredLabs\panoptic-master-integration-restored"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $SnapshotZip)) {
    throw "Snapshot not found: $SnapshotZip"
}

$Manifest = "$SnapshotZip.sha256.json"
if (Test-Path -LiteralPath $Manifest) {
    $Expected = (Get-Content -LiteralPath $Manifest -Raw | ConvertFrom-Json).sha256
    $Actual = (Get-FileHash -LiteralPath $SnapshotZip -Algorithm SHA256).Hash

    if ($Expected -ne $Actual) {
        throw "Snapshot SHA-256 mismatch."
    }
}

if (Test-Path -LiteralPath $Destination) {
    throw "Destination already exists: $Destination"
}

New-Item -ItemType Directory -Force -Path $Destination | Out-Null
Expand-Archive -LiteralPath $SnapshotZip -DestinationPath $Destination
Write-Host "Restored to: $Destination" -ForegroundColor Green