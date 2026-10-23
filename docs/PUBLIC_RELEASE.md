# Public GitHub release preparation

This folder originally had no Git repository. Publication preparation includes a current README, documentation index, privacy exclusions, portable public tests, reproducible Vega configuration generators and a staged-file audit. No GitHub repository has been created and nothing has been pushed by this task.

## Included

Application source, source artwork used at runtime, lockfiles, root tooling, native Vega/Android source, configuration generators, public/private test source, architecture/feature/research guides, project/decision history and all markdown validation reports.

## Excluded, preserved locally

- node_modules, builds, packaged SDK/automation tools and generated probe bundles.
- artifacts (including controller authorization), environment files, keys and generated hosted/local target settings.
- participant camera videos, local drafts, screenshots containing QR/session links, pose/body exports, local diagnostic logs and machine output maps.
- raw validation attachments. Markdown references to private evidence remain as historical provenance and may not resolve in public clones.

## Public test scope

`npm test` runs software checks that do not depend on private participant data. `npm run test:private` runs the original full suite when the original local fixtures are available. `scripts/private-fixture-tests.json` lists the30excluded files; some are mixed files, so public coverage is narrower than simply removing physical replay assertions. Assertions and detector/gameplay thresholds are preserved. The public build still typechecks all test source.

## Before publishing

1. Run `npm ci`, `npm test`, `npm run build`, and `npm run release:check`.
2. Review `git diff --cached --stat`, `git diff --cached`, and `git ls-files`; inspect the candidate file list before pushing.
3. MIT has been selected for original code and documentation; see LICENSE. The owner has confirmed authorization to publish the project-generated Atlas artwork; see THIRD_PARTY_NOTICES.md and ARTWORK_PROVENANCE.md.
4. Create an empty public GitHub repository, add its actual URL, commit the reviewed files and push. If the repository already contains commits, fetch/reconcile it first; do not force-push.

```sh
# Run after reviewing the staged changes and choosing your repository:
git commit -m "Prepare FireRoom prototype for public release"
git branch -M main
git remote add origin https://github.com/YOUR-ACCOUNT/YOUR-REPOSITORY.git
git push -u origin main
```

If origin already exists, inspect `git remote -v` before changing it. No actual account/repository URL is assumed. Do not include a credential in a remote URL. If a real secret ever enters a commit, revoke/rotate it and remove it from history before publication; ignoring it afterward does not remove history.

## Validation results

Software results are recorded below. Historical749/749full-suite results are not a public-suite result. The full live hands-free phone/Vega walkthrough is now user-confirmed PASS; native hardware validation remains a separate requirement; artwork publication authorization is now confirmed.

### Release preparation evidence — 23 October 2026

- Public suite:565/565tests across61files PASS.
- Production TypeScript/Vite build:PASS, existing large-chunk warning.
- Clean staged export under a temporary directory, without private fixtures or generated Vega targets: npm ci PASS, public565/565PASS, build PASS, Vega default generation PASS. Initial offline-only install lacked one cached package; normal registry installation succeeded with zero reported npm audit vulnerabilities for the root package at that time.
- Target generators: local Coach and hosted configuration generation PASS in the temporary tree; no running app target was changed by these smoke checks.
- Initial index audit:351files,8.23MiB; no prohibited private/generated paths or configured credential signatures. This is a bounded pattern scan, not a guarantee against every possible secret.
- Independent review checked setup order, lockfile origins, generated imports and exclusions. Author-specific Android SDK fallback and optional replay paths were made portable.
- Full live automatic Coach graduation through Enter Arcade: user-confirmed PASS on23October2026. Physical TV remote, actual FireTVhardware, asset licensing confirmation and production hosting remain unverified by these release checks.

- Full original local regression suite after portability changes:749/749tests across91files PASS.
- Included one reviewed simulator welcome screenshot under docs/images/ with no participant camera image or session QR. Raw pairing/participant screenshots remain excluded.

### Clean native dependency verification

Fresh exported wrapper `vega exec npm ci` and TypeScript check PASS. Its install reported27dependency advisories (14moderate,13high), unlike the root package's zero-advisory install result. These SDK/template transitive dependencies have not been upgraded or security-audited in this preparation. Do not run `npm audit fix --force` blindly across pinned Vega/ReactNative packages. Review advisory paths and compatible SDK updates before treating the app as a hardened public service. Full native package/test results are recorded below when complete.

Final native clean-export results: wrapper Jest2/2PASS; TypeScriptPASS; Debug package generationPASS for aarch64/armv7/x86_64. SDK emitted nonfatal asset-glob, build-number0 and missing-icon messages. This is package validation, not installation/rendering of that newly built temporary package. The root/public/software gate is PASS; production security, rights and physical acceptance are not certified. Final indexed candidate:352files,8.43MiB, including105markdown docs plus the reviewed image; final exact index audit follows any owner edits.


### License selected — 23 October 2026
User selected MIT for original code/documentation. Added standard LICENSE with copyright2026FireRoom contributors and MIT package metadata. Third-party terms are retained; Atlas artwork is explicitly outside this grant pending provenance/redistribution confirmation. No publication or remote push performed.

### Final pre-push review — 23 October 2026

Owner confirmed permission to publish project-generated Atlas images; provenance is documented in ARTWORK_PROVENANCE.md. Fixed hosted Retry to reacquire controller authorization and missing-token diagnostics to return503 without crashing. Wrapper TypeScript and3/3tests across2suitesPASS; isolated missing-token recovery checkPASS. Final public web suite565/565PASS and production buildPASS (existing bundle warning). Local Git credential verified for miyadainim without exposing it. User requested public GitHub publication; remote result is recorded after verification.
