# Panoptic Adapter Contract v1

Every adapter MUST expose:

- descriptor()
- health()
- preflight(mission)
- query(request)
- execute(mission)
- observe(execution)
- verify(observation)
- recover(execution)
- evidence()
- dependencies()
- credentialsRequired() — names only
- capabilityManifest()
- geometry()
- status()

Mandatory properties:
- correlation/mission ID
- idempotency
- deadline/timeout
- bounded retries
- normalized failures
- evidence receipt
- reality class
- external-operational flag

Reality progression:
DISCOVERED
→ CONTRACT_MAPPED
→ LOCAL_VERIFIED
→ INTEGRATION_VERIFIED
→ EXTERNAL_VERIFIED
→ PRODUCTION_OPERATIONAL

No implementation may skip directly from existence to production status.