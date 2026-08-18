$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..
$Prompt = Get-Content -LiteralPath ".\PANOPTIC_MASTER_CODEX_PROMPT.md" -Raw
$Prompt | & codex exec
if ($LASTEXITCODE -ne 0) {
    throw "Codex mission exited with code $LASTEXITCODE"
}
