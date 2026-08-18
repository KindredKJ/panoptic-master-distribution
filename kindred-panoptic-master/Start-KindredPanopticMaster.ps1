$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
node --env-file=.env.local src/api/server.mjs