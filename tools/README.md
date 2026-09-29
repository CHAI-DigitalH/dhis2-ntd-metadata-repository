# Tools

Command-line tooling for building, adapting, installing, and validating the NTD metadata
package. All scripts are plain Python 3.

```bash
pip install -r tools/requirements.txt   # requests + PyYAML
```

| Script | Purpose |
|---|---|
| [`build_metadata_package.py`](./build_metadata_package.py) | Merge DHIS2 dependency exports into one `metadata/full_package.json` (dedupe + scrub). |
| [`configure.py`](./configure.py) | Adapt the package for a country (swap national org-unit UID, scrub, relativize). |
| [`build_validation_rules.py`](./build_validation_rules.py) | Generate `metadata/validation_rules.json` from a UID table (regenerate on remap). |
| [`install.py`](./install.py) | One-command installer: preflight → adapt → dry-run → import → rules → validate. |
| [`validate_import.py`](./validate_import.py) | Post-import checks (datasets, indicators, dashboards, blank-viz spot-check). |
| [`country-config.example.yaml`](./country-config.example.yaml) | Template for the per-country config the above consume. |

---

## A. Maintainer runbook — building the package (reference instance)

Do this on the instance where the dashboards are built, to produce `full_package.json`.

1. **Relativize the dashboards** in Data Visualizer — org units → *Level: District* or
   user/root; periods → relative. This is what makes the package portable. See
   [../docs/adaptation.md](../docs/adaptation.md) §1.
2. Attach the appropriate indicators to each dataset in **Maintenance**, so they travel with
   the export.
3. **Build the package via the live API pull** (recommended). Do **not** rely on the
   Import/Export app's *"Metadata dependency export"* alone — that endpoint returns
   visualizations as shells and **drops their periods, legend blocks, and map internals**
   (confirmed on 2.42.5). The live pull below works around this: it uses dependency export
   only to find the object set, then **re-fetches each visualization via `/api/metadata.json`
   (which preserves `rawPeriods`)**, pulls the legendSets the charts reference, and drops the
   maps (they can't import via the metadata API — see step 6):
   ```bash
   python3 tools/build_metadata_package.py \
       --base-url https://ref-instance.org --username admin --password ... \
       --dashboards <dash-uid-1> <dash-uid-2> ... \
       --datasets  <ds-uid-1> <ds-uid-2> ... \
       --out metadata/full_package.json
   ```
   Check the printed `visualizations with a period: X/Y` — it should be ~all of them.
   (Offline `--in-dir` merge still exists but only preserves periods if the input files came
   from a period-preserving export, so prefer the live pull.)
4. Regenerate validation rules if their UIDs changed (they ship with stable UIDs so
   re-imports are idempotent):
   ```bash
   python3 tools/build_validation_rules.py --out metadata/validation_rules.json
   ```
5. **Maps:** the 2 choropleth maps are excluded from the package because DHIS2's metadata
   API cannot import a map's `mapView` nested references (legendSet / indicator) — it throws
   a Hibernate transient-instance error even when the dependency is present. **Recreate the 2
   maps manually in the Maps app** after install (a few minutes each), or investigate a
   version-specific import path. This is a known DHIS2 limitation, not a package defect.

---

## B. Adopter runbook — installing on a fresh instance

Do this on the target country's instance.

**Prerequisite:** the target instance already has its org-unit hierarchy (national +
district). The installer checks this and stops if it's missing.

1. Copy and fill in the config:
   ```bash
   cp tools/country-config.example.yaml country-config.yaml
   # edit org_units.national_uid (or let install.py auto-detect a single level-1 unit)
   ```
2. Run the installer:
   ```bash
   python3 tools/install.py \
       --base-url https://your-instance.org --username admin --password ... \
       --config country-config.yaml \
       --package metadata/full_package.json \
       --rules   metadata/validation_rules.json
   ```
   It runs the whole pipeline: verify connection/version → preflight org units (and warn
   if district geometry is missing) → resolve the national root → adapt the package with
   `configure.py` → **dry-run** each import and show a summary → ask before committing
   (`--yes` to skip) → commit atomically → import validation rules → import the access
   scaffold (roles + user groups) → **assign every dataset to national + district level**
   so data entry works out of the box → **apply sharing** so dashboards are visible → regenerate
   category option combos.

   Opt out of pieces with `--no-scaffold`, `--no-assign`, `--no-sharing` if your instance
   already has an access model or you're assigning datasets yourself.
3. Run the post-import checks:
   ```bash
   python3 tools/validate_import.py \
       --base-url https://your-instance.org --username admin --password ... \
       --config country-config.yaml
   ```
4. Load data ([../docs/data-sources.md](../docs/data-sources.md)) and run **Analytics
   Tables** before dashboards populate.

### Doing it by hand instead

Every step the installer automates is documented manually in
[../docs/setup.md](../docs/setup.md) — use that if you prefer the UI or need to debug a
partial import.

---

## Notes

- **Auth:** all instance-touching scripts accept `--username/--password` or `--token`.
- **Safety:** `install.py` always dry-runs before committing and uses `atomicMode=ALL`, so
  a failed import changes nothing.
- **The visualization constraint:** none of these scripts create or edit visualizations via
  the API — `configure.py` only edits already-exported JSON and re-imports it whole, so
  `dataDimensionItems` are preserved. See [../docs/setup.md](../docs/setup.md).
