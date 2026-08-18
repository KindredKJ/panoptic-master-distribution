# KINDRED PANOPTIC MASTER — CODEX OPERATING DIRECTIVE

## Authority
This workspace is an integration and migration workbench for the verified Kindred Panoptic Master.
The existing Panoptic Master at `C:\KindredLabs\kindred-panoptic-master` is a protected baseline until a migration stage explicitly says otherwise.

## Non-negotiable runtime laws
1. PORT ZERO remains `(0,0,0)` and the master-axis intersection.
2. Preserve the validated Meta-Cube topology: 6 faces, 3 opposite-face axes, 12 structural edges, 8 convergence vertices.
3. Preserve X × Y × Z × Tau:
   - X = capability
   - Y = stratum/domain
   - Z = scope/control scale
   - Tau = time/evidence/value/risk/cost/demand/confidence/state
4. No external adapter may report success until independently authorized, configured, tested, evidenced, and enabled.
5. Do not fabricate customers, revenue, bank settlement, utility dispatch, telecom authority, regulatory approval, cloud deployment, or production capability.
6. Founder/high-impact approval remains cryptographically bound to the exact plan or immutable action digest.
7. Evidence must be append-only/tamper-evident and independently verifiable.
8. Preserve recovery, rollback, kill-switch, and bounded execution paths.
9. Never destroy or rewrite an authoritative source merely to make integration easier.
10. Prefer: existing interface → additive extension → compatibility adapter → Kindred-native implementation behind existing interface → architecture change only after an explicit decision record.

## Operating posture
- Discovery before mutation.
- Evidence before status promotion.
- Integrate by adapter, not by copy/paste duplication.
- One authoritative owner per capability.
- Cross-stratum composition is allowed; authority leakage is not.
- High-impact, irreversible, financial, legal/regulatory, credential, production deployment, ownership/control-transfer, and external physical actions remain founder-gated unless a narrower explicit policy is proven.

## Level-4 autonomy target
Interpret Level 4 as bounded autonomy:
- The system may independently decompose missions, choose tools/adapters, retry, optimize, schedule, reconcile, and perform reversible low-risk actions inside pre-authorized mission classes.
- It must stop or escalate on policy uncertainty, missing evidence, material scope expansion, irreversible effects, new credentials, external financial movement, legal/regulatory actions, ownership/control changes, production-impacting deployment, or physical-world actions outside a pre-authorized envelope.
- Every autonomous action needs a mission ID, authority context, budget/resource envelope, route, evidence output, failure mode, timeout/circuit breaker, and recovery path.
- Silence is never approval.

## Source classification required
For each discovered asset classify it as exactly one or more:
- authoritative
- additive extension
- compatibility adapter
- prototype
- divergent implementation
- duplicate/superseded
- external dependency
- unsupported claim
- evidence-only artifact

Do not infer operational status from filenames, README claims, test names, or existence alone.

## Required deliverables
Maintain these as machine-readable and human-readable artifacts:
- `state/source-authority-map.json`
- `state/component-inventory.json`
- `state/capability-registry.json`
- `state/adapter-registry.json`
- `state/pipeline-registry.json`
- `state/evidence-gap-register.json`
- `state/decision-register.json`
- `state/migration-ledger.json`
- `reports/PANOPTIC-INTEGRATION-STATUS.md`
- `reports/PANOPTIC-REALITY-MATRIX.md`
- `reports/PANOPTIC-COMMERCIAL-READINESS.md`

## Verification discipline
Before completing any work package:
- run the narrowest relevant tests;
- run Panoptic Master integrity verification if geometry, authority, routing, evidence, or runtime state changed;
- record exact command, exit code, timestamp, evidence location, and resulting status;
- distinguish LOCAL_VERIFIED, INTEGRATION_VERIFIED, EXTERNAL_VERIFIED, and PRODUCTION_OPERATIONAL.

## Git discipline
- Work on a dedicated integration branch/worktree where possible.
- Keep changes coherent and reviewable.
- Never force-push, reset shared branches, delete repos, rotate/revoke credentials, merge, deploy externally, or change production resources without explicit founder instruction.
- Commit generated manifests only when they contain no secrets or machine-private material.

## Secrets
Never copy secret values into prompts, docs, Git, reports, fixtures, or logs.
Record only secret names, providers, scope, and whether configured.
