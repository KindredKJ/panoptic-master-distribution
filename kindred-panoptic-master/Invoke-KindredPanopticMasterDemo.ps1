$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
node --env-file=.env.local scripts/demo.mjs