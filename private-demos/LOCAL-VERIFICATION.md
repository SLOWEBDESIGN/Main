# Private demo work, October 10, 2026

Historical local verification and current release preparation. Ben subsequently authorized publishing and approved the complete database migration. See the release preparation below; the original local checklist is retained as historical evidence.

## Checklist

| Item | Status | Executed evidence |
| --- | --- | --- |
| Header section links with smooth scrolling | Completed | Browser click changed `#queue`, initially remained at scroll position 0, then arrived at 4520.5 with the form 100 pixels below the viewport top. |
| Visit-code buttons in header, footer, form area, and beside See more work | Completed | Both added buttons opened the existing native dialog. Desktop and mobile dialog behavior checked in the running site. |
| Four permanent six-digit routes and four-digit local access codes | Completed | `node tools/verify-private-demos.mjs` passed for all four demos. Passwords are not present in public entry-page HTML. |
| Two entries, a separate one-hour limit per entry, no persistent login cookie | Completed | `node --test tools/demo-access.test.mjs` passed 8 tests, including exact expiry boundary, concurrency, reset revocation, persistence, and wrong-password behavior. HTTP unlocks set no login cookie. The browser session token stays in memory; refreshing the outer entry page requires another entry. |
| Protected demo pages, scripts, and 3D assets | Completed | All exported content pages returned 200 and noindex. Full model bytes reconstructed from authenticated ranges matched the original SHA-256 for each model. Invalid tokens returned 401; public artifact paths returned 404; third entries returned 403. |
| Desktop and mobile previews for all four demos | Completed | Real browser screenshots saved for each 3D experience and its 390-pixel iframe. The iframe uses the actual responsive site, not a resized desktop screenshot. |
| Mobile visitors get desktop-only guidance | Completed | Form-area visit button tested at a 390-pixel browser viewport. It displayed the desktop/laptop guidance rather than a code form. |
| Money company listings and access-code reset | Completed | Running Money at port 4949 displayed the four demos. Local reset POST returned 303, changed only the selected demo password, preserved its visit code, and restored two entries. Cross-origin POST returned 403. `node --test scripts/money-sections.test.mjs scripts/money-desktop.test.mjs` passed 45 tests. |
| Resume, portfolio, Street-to-Seat, and protected military-page links in Money | Completed | Studio & Personal Websites window checked in the running portal. Portfolio and resume are one source project and are listed once. Military application uses its existing protected `/resume` route, not these demo codes. |
| Website shortcut interception, excluding 3DPrintDash | Completed | 13 shortcut-behavior tests passed. Coverage audit passed for 9 Next layouts and 15 HTML pages across 13 local projects. Ctrl+S changed the running SLO site from dark to light. Copying/editing form answers remains allowed. |
| Local asset packaging and secret exclusion | Completed | All four source projects passed production build checks. SLO production build passed. `node tools/verify-private-bundle.mjs` confirmed 556 demo files, all four models, and zero traced local password/environment files. `node tools/package-private-demos.mjs` produced the ignored, local-only archive. |
| Hosted access storage | Completed | Approved migration `0173_swd_private_demo_access.sql` applied successfully. RLS enabled, anonymous and authenticated users cannot read the table. Compare-and-swap tests verify two-visit concurrency across independent server instances. |
| Hosted release | Pending | Production configuration and 575 checksum-verified private storage assets are ready. Live verification must follow the authorized Git deployment. |

## Local routes

| Demo | Permanent visit code | Local entry |
| --- | --- | --- |
| Outpost Vans | 779109 | http://127.0.0.1:3011/visit/779109 |
| The Vansmith | 820674 | http://127.0.0.1:3011/visit/820674 |
| A Mano Vans | 855578 | http://127.0.0.1:3011/visit/855578 |
| ARMES Aviation | 253308 | http://127.0.0.1:3011/visit/253308 |

Find current four-digit passwords at http://127.0.0.1:4949/#PrivateDemos.
Final HTTP verification refreshed the passwords and left two unused visits per demo.
Passwords, session hashes, and rate-limit state are in `.demo-access/`, which is gitignored and explicitly excluded from Next server-file tracing.

SLO and SD are one source project and retain hostname-dependent branding. Visit navigation uses relative URLs, so it stays on the hostname the visitor used. Hosted SD behavior was not tested or changed remotely.

## Screenshots

- `../.screenshots/private-outpost-desktop.png` and `private-outpost-mobile.png`
- `../.screenshots/private-vansmith-desktop.png` and `private-vansmith-mobile.png`
- `../.screenshots/private-amano-desktop.png` and `private-amano-mobile.png`
- `../.screenshots/private-armes-desktop.png` and `private-armes-mobile.png`
- `../.screenshots/money-studio-sites.png`
- `../.screenshots/visit-code-work-buttons.png` and `visit-code-form-button.png`

## Original release plan, now superseded by approved preparation

1. Approve and implement transactional hosted access storage. The existing shared production database must not be altered without showing the full migration and getting explicit approval.
2. Configure hosted administration securely in the site and Money. Money now passes its private `.env.money` configuration to demo management. Do not paste secrets into chat.
3. Choose an authorized private asset delivery path. `private-demos/bundles/private-preview-assets.tgz` is a local private bundle, not a public Git artifact or a published download. Keep the demo assets out of `public/`.
4. Only after Ben approves publishing: package through the existing Next adapter, deploy the same SLO/SD project, and verify hosted access and both hostnames. No release automation is enabled by these edits.

## Earlier local verification

- Ben has authorized publishing, but applying the shared production-database migration still requires the complete-SQL approval step.
- Rebuilt all four original source projects and refreshed their private exports with `node tools/prepare-private-demos.mjs`.
- `node tools/verify-private-demos.mjs` passed for all four updated exports: protected HTML, JavaScript, complete model ranges, two entries, and session revocation. It issued fresh passwords and left two unused visits per demo.
- `node --test tools/demo-access.test.mjs tools/local-demo-preview.test.mjs` passed all 12 tests. TypeScript and `git diff --check` passed.
- The local bypass remains off. All four entry pages returned 200 with no bypass session; the previous bypass token returned 401 for each demo.
- Phone previews now keep a 393 by 852 content viewport and scale proportionally to the available desktop space.
- Removed only the generated 81 MB `.next-verify` build cache and restarted the local SLO server after disk-full compilation failures. The cache can be rebuilt.
- Verified the existing Netlify project owns both SLO and SD hostnames. Its Git repository is public, so private demo artifacts must remain excluded from Git.
- No Git push, database migration, or Netlify deployment has been performed during this verification.

## Approved release preparation

- Applied the migration after Ben approved its full SQL. Verified row-level security and service-role-only access.
- Configured production server-side access storage and the private admin endpoint without publishing provider credentials.
- Uploaded and downloaded all 575 private export files through Netlify Blobs; every SHA-256 matched its local original, including all four GLB models. The storage version changes only after every file verifies.
- Production asset requests authenticate before reading private storage. Local development retains the filesystem exports. Neither local exports nor access-state/environment files are traced into the production bundle.
- `node --test tools/demo-assets.test.mjs tools/demo-access.test.mjs tools/hosted-demo-storage.test.mjs tools/local-demo-preview.test.mjs tools/studio-shortcuts.test.mjs` passed all 29 tests.
- `npm run type-check`, `NEXT_DIST_DIR=.next-release NEXT_TELEMETRY_DISABLED=1 npm run build`, `NEXT_DIST_DIR=.next-release node tools/verify-private-bundle.mjs`, and `node tools/verify-private-demos.mjs` passed. Webpack could not save its optional build cache because the disk is nearly full; compilation and the production build completed successfully.
- Removed only this run's generated `.next-release/cache` when file writes failed. No source or demo asset was removed.
- The four-digit bypass remains disabled. Mobile previews use a 393 by 852 iPhone 15 viewport.
- Money reads the local ignored hosted-admin settings to list and regenerate the hosted demo passwords. The admin provider key is never sent to the website browser.
- Deployment and live verification are pending at the time this preparation record is committed. `node tools/hosted-demo-release.mjs verify` will test both domains, expired sessions, two visits, every content page, complete model byte ranges, and admin authentication, then leave two unused visits per password.

## Limitations and exclusions

- Browser shortcut interception is a deterrent, not DRM. Browser-menu commands, disabled JavaScript, screenshots, network downloads, and external scraping cannot be reliably prevented by page JavaScript. An authorized visitor receives the assets needed to render the demo.
- No company emails were sent. No company was contacted. The demos remain independent, unapproved concepts.
- 3DPrintDash's website/app, hosted status pages, extension sources, Office add-ins, rejected versions, archives, and unavailable external-volume originals were not changed by the shortcut work.
- The available `focus-reader` and `slo-fulfillment` working copies were recovered from the existing local release snapshots. External originals were not remounted or modified.
- Existing user edits, including the larger Money changes and `.claude/launch.json`, were preserved. No broad staging, cleanup, or resets were run.
