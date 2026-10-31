# Internet Computer Store — current status

## Production

- Frontend: 6iwiq-eyaaa-aaaaf-qhb4a-cai.
- Backend: ufzkd-paaaa-aaaab-ahcqq-cai.
- Persistent state contains the catalog, per-caller profiles/favorites and administrator/importer roles.
- Owner administrator membership is granted; owner controller is retained.
- The current catalog has 29 SNS records; Community Apps is empty.
- GitHub automation contains one daily crawler with manual dispatch.
- Certified v2 frontend responses are required; no raw-domain bypass is used.

## Implementation history

- Earlier prototypes implemented search, classification, ingestion, review and hosting experiments. They were superseded by the current runtime and have now been removed from the current tree.
- 2026-10-27: Responsive administrator UI added; unavailable and read-only states checked at desktop and mobile widths.
- 2026-10-31: Two owner-created ICP canisters deployed. Fresh catalog generated; user isolation, caller permissions, deletion and upgrade persistence verified.
- 2026-10-31: Sign-in request host aligned with the frontend security policy. Owner administrator authorized on the new origin.
- 2026-10-31: Category navigation updated; three former seed entries deleted and the Community Apps section introduced.
- 2026-10-31: Retired brand names removed from current source and paths. Historical Git commits were not rewritten.
- 2026-10-31: Retired hosting implementations, deployment configuration, SQL migrations and obsolete test suites removed. Current eligibility rules moved into the pure crawler validation module.

## Pending verification and work

- Completed: all 20 current regression tests, native backend integration, frontend build, desktop/mobile administrator UI checks and certified mainnet response checks passed (validation run 41163527531).
- Completed: main-branch crawler run 41163616121 prepared and synchronized 29 SNS records using the independent validation module and native importer.
- Verify owner administrator editing/publication in an authenticated owner session.
- Arrange owner-controlled deployment-key custody before removing the temporary deployment controller.
- Add reviewed sources for Community Apps and implement native voting/submission/claim features separately.

The deployed root HTML, entry HTML, JS and CSS match the current build byte-for-byte. The runtime modules and persisted state required no replacement for this source-only cleanup.


## 2026-10-31 — Curated Infrastructure resource UI
Implemented a dedicated Official ICP Resources directory with resource-purpose filters, local search, safe external website/source links, administrator-only add shortcut and distinct loading/error/empty states. Only published manual Infrastructure records are included; individual relationship labels do not imply automatic ownership verification. Resource cards use separate selectors to avoid application voting/card scripts. No production resource records are seeded.
Administrator forms now generate resource IDs and select resource types through existing tags while preserving other tags on edit. Save events refresh the public catalog without rerendering an active editor. Backend schema/code is unchanged. Local 26 regression tests and the frontend build pass; isolated desktop/mobile resource and administrator browser flows plus native tag persistence are validated before cutover. Real owner authentication is not replaced by test fixtures.

Production verification: validation run 41238055102 passed all 26 unit checks, native persistence/upgrade checks, frontend build, isolated desktop/mobile administrator and resource-directory browser checks. The frontend was deployed to the existing canister; certified v2 responses for root, entry HTML, JS and CSS were independently verified. The live public Infrastructure page displays the new directory and its honest empty state, with no administrator shortcut for anonymous visitors. No production resources were seeded and the backend module/state was unchanged.

## 2026-10-31 — Resource card classification
Kept the administrator workspace inside the existing site, per the latest user instruction. Manual Infrastructure records use the resource card renderer across discovery grids, with human-readable purpose labels and #Infrastructure. Reserved resource-type tags are removed from public tags; stored metadata is preserved. Renamed the administrator selector to Resource category. The independent admin entry was withdrawn before any deployment. Unit checks and the frontend build passed; browser validation is pending.

Validation complete: run 41243882690 passed 27 unit checks, frontend build, read-only administrator checks and isolated desktop/mobile create/edit/publish/filter tests. Production frontend deployment passed certified v2 verification for root, HTML, CSS and JS. Live OpenCloud displays Network & data and #Infrastructure, with no internal metadata tag. In-site administrator routing is retained. No backend module or catalog data was changed.

## 2026-10-31 — Automatic Infrastructure website icons
Resource cards derive /favicon.ico from the HTTPS website origin and request it directly in the visitor browser without a referrer. Failed icons reveal the existing initial. Removed the administrator logo URL input; saves send an empty legacy logo field, never a derived URL or image bytes. No backend schema change or data migration. Validation pending.

Validation complete: 28 unit checks and the frontend build passed. GitHub run 41244443916 passed desktop/mobile resource navigation, failed-icon initial fallback and isolated administrator create/edit/publish checks, including absence of the logo URL field and empty legacy logo value. Production deployment passed certified v2 root/HTML/CSS/JS checks. Live OpenCloud loaded https://opencloud.org/favicon.ico successfully. No backend installation or production data migration occurred.
