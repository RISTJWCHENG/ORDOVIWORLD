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

## 2026-10-31 — In-place management mode
The existing #/admin route now switches the site shell into management mode without a new page or tab. It preserves the original logo and account/launcher controls, hides the public navigation, introduction and footer, and expands the administrator workspace. Return-to-store links restore the normal shell. Native backend authorization is unchanged. Validation pending.

Validation complete: 28 regression checks and frontend build passed. Run 41245263785 passed desktop/mobile same-document shell switching, responsive layout, retained logo/account controls, restored public navigation/footer and existing administrator/resource editing browser checks. Production root, HTML, CSS and JS passed certified v2 verification. Live anonymous management mode correctly retains authentication enforcement; clicking the original logo restores the store in the same tab. No owner session was impersonated. Backend state and permissions are unchanged.

## 2026-10-31 — Integrated management columns
Replaced the inset management panel with edge-to-edge page columns: a 308px left navigation aligned with the store sidebar and a white content column. Removed the outer rounded border, shadow, maximum width and surrounding padding. The shared header remains. Tablet/mobile navigation reflows above the content. No backend, access or stored-data changes. Validation pending.

Validation complete: run 41245762757 passed 28 regression checks, build, same-document mode switching, read-only access and isolated desktop/mobile administrator create/edit/publish checks. Geometry assertions verify a borderless, full-width shell at x=0, desktop sidebar width 308px and alignment directly below the shared header. No mobile horizontal overflow. Frontend production deployment passed certified v2 root, HTML, CSS and JS verification. No backend or data changes.

## 2026-10-31 — Management header and status refinement
Management mode hides the existing application launcher, preserving the avatar and store logo. A header breadcrumb follows overview, resources, add and edit panels; its home button returns to the overview. Removed the duplicate content breadcrumb. Healthy writable connection status is hidden; waiting, failures and read-only restrictions remain visible. Save confirmations use a brief accessible toast. Public launcher returns when leaving management. Validation pending.

Validation complete: run 41246977890 passed 28 regression checks, frontend build, desktop/mobile store/admin launcher visibility and same-document routing, header breadcrumb navigation including add/edit and overview return, hidden healthy status, visible read-only status with disabled inputs, and existing resource create/edit/publish checks. Production root, HTML, CSS and JS passed certified v2 verification. Backend permissions and production records were unchanged.

## 2026-10-31 — Continuous management divider
Extended the desktop column divider from viewport top to bottom, including the shared header. Removed the header horizontal border and mobile breadcrumb/navigation separators; removed the duplicate sidebar edge. Single-column mobile layout has no vertical divider. Styling only; backend and data unchanged. Validation pending.

Validation complete: run 41247588403 passed the existing unit/build and desktop/mobile browser suites, including full-height desktop divider coordinates, hidden mobile divider, zero header bottom border and administrator editing/status checks. Production root, HTML, CSS and JS passed certified v2 verification. Styling only; data and permissions unchanged.

## 2026-10-31 — Management sidebar clarity
Refined sidebar hierarchy with an Administration eyebrow, Store management title and specific directory-curation description. Navigation uses consistent outlined SVG icons, readable labels and short task descriptions; active state and keyboard focus remain clear. The lower publishing note is concise and links to the public directory. Mobile navigation stays compact. Explicit accessible labels preserve the existing navigation contract. Validation pending.

Validation complete: run 41248222194 passed the build, 28 existing regression checks and desktop/mobile browser checks for sidebar navigation, same-document mode switching, layout/no overflow, breadcrumb/status behavior and isolated resource create/edit/publish. Production root, HTML, CSS and JS passed certified v2 verification. Backend code, permissions and stored data are unchanged.

## 2026-10-31 — Personal dashboard and appearance
Replaced the account-menu My Profile entry with an icon-free My Dashboard link and added Light/Dark background controls below the administrator entry (or personal entry for non-admins). Theme choice is local to the browser. Added same-document personal overview, favorites and Profile Settings using the existing shared workspace shell. Overview uses actual profile/favorite load states, not fabricated activity. Favorites support opening/removing/retrying; existing profile editing, identity copy and self-data deletion remain available. Existing #/profile links open Profile Settings. The native backend and stored formats are unchanged. Added isolated browser coverage for both accounts and failure paths. Validation pending.

Validation complete: final run 41249353235 passed 28 existing unit checks, build and all four browser suites. Isolated actual-menu/personal UI checks covered icon-free My Dashboard, admin visibility by account, Light/Dark persistence and label contrast, profile saving with expected account, favorites removal, logout, account switching without stale data, failed loads and mobile overflow. Existing administrator/status/breadcrumb/resource workflows also passed. Production root, HTML, CSS and JS passed certified v2 verification. No backend schema/module change or production user-data migration occurred; owner authentication was not impersonated.

## 2026-10-31 — Theme switch refinement
Replaced separate swatch buttons with a compact sun/moon segmented control and a shared moving selection surface. Increased target height to 36px, kept keyboard focus/pressed semantics, and applied changes on primary pointer-down with click fallback for keyboard activation. DOM state updates precede preference persistence; repeated activation of the same theme does not rewrite storage. Reduced-motion support is preserved. Validation pending.

Validation complete: run 41250129874 passed unit/build and all four browser suites. The personal browser check verifies theme/pressed state changes immediately after mouse-down, before mouse-up, keyboard Enter activation, reload persistence and existing account/profile/favorites behavior at desktop/mobile sizes. Production root, HTML, CSS and JS passed certified v2 verification. No backend/data changes.

## 2026-11-01 — Align personal workspace headings
The personal content column used a section element and inherited the public section margin-top:64px, unlike the administrator div column. Reset margin on direct workspace content columns and standardized personal heading spacing. Existing desktop/mobile browser coverage now checks overview, favorites and profile heading coordinates against column padding. Backend and data unchanged. Validation pending.

Validation complete: run 41252074319 passed unit/build and all four browser suites. Personal overview, favorites and profile heading geometry matches the content column padding at desktop and phone sizes; the inherited 64px section margin is absent. Existing theme, identity, favorites and administrator flows passed. Production root, HTML, CSS and JS passed certified v2 verification. No backend/data changes.
