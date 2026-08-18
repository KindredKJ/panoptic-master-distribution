# 09 — WATT Energy Demo

## Objective
Operate this capability from the founder console without confusing simulation, local verification, external verification, or production state.

## Prerequisites
- Panoptic Master baseline verification passes.
- Integration workspace exists.
- PowerShell 7 and Node are available.

## Commands
Run from:

``powershell
cd "C:\KindredLabs\panoptic-master-integration"
npm test
npm run verify
``

## Expected output
All local verification steps must pass without enabling unverified external adapters.

## Common failure states
- missing local source
- external adapter required
- authority escalation required
- evidence conflict
- baseline drift

## Recovery
Stop mutation work, verify the protected baseline, inspect state/evidence-gap-register.json, and restore the most recent snapshot if required.

## Verification
Never promote status beyond the evidence actually produced.