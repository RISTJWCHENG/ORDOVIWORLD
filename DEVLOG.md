# Development log

## Earlier prototypes

The project initially explored directory discovery, classification, ingestion,
search, review and multiple hosting prototypes. Neutral code names and shared
public branding were introduced. These experiments were later superseded; their
retired deployment implementations and instructions are no longer maintained in
the current source tree. Historical commits retain the detailed development log.

## 2026-10-27 — Administrator interface

Added the responsive administrator workspace with overview, filtering, editor,
unavailable-state counts and locked writes. Desktop and 390px layout checks
passed. Real authenticated owner editing remained a separate verification step.

## 2026-10-31 — Native production runtime

Deployed owner-created frontend and backend canisters. Persistent caller-based
profiles, favorites, deletion and role authorization were added. Fresh public
catalog records were generated; GitHub became the daily discovery runner and
screened-text store. Module hashes, retained controllers and certified frontend
responses were verified. Backend tests covered isolation and upgrade persistence.

## 2026-10-31 — Authentication and catalog maintenance

Set the explicit IC API host for identity delegation requests, preserving the
frontend security policy. Authorized the owner administrator. Updated category
navigation, deleted three former seed entries and introduced Community Apps.
The remaining 29 SNS records were preserved through upgrades. Renamed provider-
specific application discovery to neutral reviewed community provenance.

## 2026-10-31 — Source cleanup

Removed retired brand names from source, filenames, configuration and docs.
The previous complete suite passed 251 tests before its obsolete prototype
implementations were removed. The source audit covered 221 files with no retired
brand matches. These historical counts are not the size of the current suite.

Removed obsolete platform backends, upload/provisioning tools, migrations,
preview hosting and custom administrator proof/verifier code. Moved the eligibility
rules still used by production into `crawler/validation.mjs`; retained their safety
and provenance checks. Renamed frontend catalog adapters and centralized the two
neutral browser-local storage prefixes. Production backend state is unchanged.
Validation of the reduced active tree is recorded after its checks complete.

Validation run 41163527531 passed the 20 active regression tests, native backend integration, frontend build, desktop/mobile administrator UI checks and mainnet certificate verification. Certified live root/index/JS/CSS bytes exactly match the new build, so no canister reinstall or state mutation was required.

Main-branch crawler run 41163616121 succeeded after deleting the retired implementations. It used the independent eligibility module and native import path, synchronized 29 SNS records, and found no configured community seeds.


## 2026-10-31 — Curated Infrastructure resource UI
Implemented a dedicated Official ICP Resources directory with resource-purpose filters, local search, safe external website/source links, administrator-only add shortcut and distinct loading/error/empty states. Only published manual Infrastructure records are included; individual relationship labels do not imply automatic ownership verification. Resource cards use separate selectors to avoid application voting/card scripts. No production resource records are seeded.
Administrator forms now generate resource IDs and select resource types through existing tags while preserving other tags on edit. Save events refresh the public catalog without rerendering an active editor. Backend schema/code is unchanged. Local 26 regression tests and the frontend build pass; isolated desktop/mobile resource and administrator browser flows plus native tag persistence are validated before cutover. Real owner authentication is not replaced by test fixtures.

Initial cloud UI validation 41237543697 passed unit/backend checks but exposed an ambiguous accessible name on the new resource-type select. Added explicit accessible names for resource type, relationship and status. Also reset the editor when its Add a resource navigation is used, preventing an existing ID from being reused for a new entry. Browser tests cover that reset.

The next UI run passed native tests, read-only admin checks and public directory interactions, then detected decorative sidebar symbols in exact accessible button names. Marked those symbols aria-hidden so resource navigation has clear accessible names. Isolated create/publish assertions had passed before that navigation step.

Run 41237905280 reached the administrator create/edit checks and caught a real reset issue: hidden input values reflect their default value, so a normal form reset retained the edited ID. Reset now explicitly clears that hidden ID before a new resource can be created. No production records were used by these tests.

Production verification: validation run 41238055102 passed all 26 unit checks, native persistence/upgrade checks, frontend build, isolated desktop/mobile administrator and resource-directory browser checks. The frontend was deployed to the existing canister; certified v2 responses for root, entry HTML, JS and CSS were independently verified. The live public Infrastructure page displays the new directory and its honest empty state, with no administrator shortcut for anonymous visitors. No production resources were seeded and the backend module/state was unchanged.

## 2026-10-31 — Resource card classification
Kept the administrator workspace inside the existing site, per the latest user instruction. Manual Infrastructure records use the resource card renderer across discovery grids, with human-readable purpose labels and #Infrastructure. Reserved resource-type tags are removed from public tags; stored metadata is preserved. Renamed the administrator selector to Resource category. The independent admin entry was withdrawn before any deployment. Unit checks and the frontend build passed; browser validation is pending.

Validation complete: run 41243882690 passed 27 unit checks, frontend build, read-only administrator checks and isolated desktop/mobile create/edit/publish/filter tests. Production frontend deployment passed certified v2 verification for root, HTML, CSS and JS. Live OpenCloud displays Network & data and #Infrastructure, with no internal metadata tag. In-site administrator routing is retained. No backend module or catalog data was changed.

## 2026-10-31 — Automatic Infrastructure website icons
Resource cards derive /favicon.ico from the HTTPS website origin and request it directly in the visitor browser without a referrer. Failed icons reveal the existing initial. Removed the administrator logo URL input; saves send an empty legacy logo field, never a derived URL or image bytes. No backend schema change or data migration. Validation pending.
