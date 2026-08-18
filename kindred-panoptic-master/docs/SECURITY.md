# Panoptic Master Security Model

The bootstrap is local-first and fail-closed.

## Local founder bootstrap

- A random bearer token is generated once into `.env.local`.
- A local Ed25519 founder keypair is generated once into `.data/authority/`.
- The private key is excluded from Git by `.data/`.
- High-impact intent approvals are signed over the exact plan hash.
- A changed plan invalidates the approval.

## Production requirements

Before exposing this runtime outside the local machine, replace the bootstrap bearer token with a production identity system and add:

- OIDC / workload identity
- explicit tenant membership
- scoped RBAC / ABAC
- short-lived machine credentials
- mTLS
- key rotation / hardware-backed key storage where appropriate
- rate limits
- network policy
- production database backups
- production audit retention
- secret manager
- deployment approvals
- adapter-specific authorization and revocation

External execution remains disabled by default.