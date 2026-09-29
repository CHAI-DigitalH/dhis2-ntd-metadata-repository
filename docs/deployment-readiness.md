# Deployment readiness

Tracks what stands between this repository and a clone-and-run Digital Public Good — a
package any PC-NTD country can use to reach ~90% of a working NTD DHIS2 instance. Grouped
by blocker severity. Update the checkboxes as items land.

## Status at a glance

The design, indicator logic, dashboards, and documentation are complete and high quality.
The tooling to *package and adapt* the metadata now exists. The one true remaining blocker
is producing the actual exported package from a real instance — which depends on the
manual dashboard-relativization pass.

---

## 🔴 Blockers — nothing ships without these

- [ ] **`metadata/full_package.json` populated.** Currently `{}`. Produce it via dependency
      export from the reference instance and `tools/build_metadata_package.py`. **Depends on**
      the relativization pass below.
- [ ] **Dashboards relativized** (org units → level/user, periods → relative) in Data
      Visualizer on the reference instance, before export. See [adaptation.md](./adaptation.md) §1.
      Manual — cannot be scripted.
- [x] **`tools/configure.py` implemented** — UID remap + scrub + optional relativize. *(built)*
- [x] **`tools/build_validation_rules.py` created** — regenerates `validation_rules.json`
      byte-for-byte; supports `--uids` for remap. *(built)*

## 🟡 Should-fix before calling it a DPG

- [x] **`adaptation.md` written** — was linked but missing. *(built)*
- [x] **Option sets added to the import sequence** in [setup.md](./setup.md). *(done)*
- [x] **Single-file / atomic API import documented** in [setup.md](./setup.md). *(done)*
- [x] **CLI installer (`tools/install.py`)** — preflight → adapt → dry-run → import → rules
      → scaffold → dataset assignment → sharing → COC regen. *(built)*
- [x] **`build_metadata_package.py`** — assemble/clean the package; excludes default objects. *(built)*
- [x] **`validate_import.py` accepts `--config`** for per-country expected values. *(done)*
- [x] **ESPEN app `DISEASES` undefined bug** fixed in `apps/espen-connector/src/App.jsx`. *(done)*
- [x] **Dataset → org-unit assignment** — installer assigns datasets to national + district
      level so data entry works out of the box; `configure.py` strips dangling SL refs. *(built)*
- [x] **Access scaffold** — generic NTD roles + user groups (`metadata/access_scaffold.json`),
      imported and sharing applied by the installer. *(built)*
- [x] **Maps-geometry preflight warning** in the installer. *(built)*
- [ ] **Verify scaffold role authorities** on the target DHIS2 version (classic `M_dhis-web-*`
      authorities may need adjustment). *(test-install)*
- [x] **Attach indicators to datasets** — done on the reference instance (all 91 attached,
      verified); they travel on dependency export. *(done 2026-09-09)*
- [x] **Access model = 3 roles (NTD Administrator / Data Entry / Viewer) + 2 groups (NTD Users,
      NTD Data Entry)** with per-user org-unit scope; shipped config static for non-superusers;
      category-option data sharing included so disaggregated entry works; ESPEN Connector app
      restricted via a separate "ESPEN Submitter" role. *(built — verify authorities on target version)*
- [ ] **ESPEN app: replace `PLACEHOLDER_*` UIDs** in `src/constants/diseases.js` and confirm
      the ESPEN submission auth/token format with WHO AFRO.
- [ ] **Governance & license** placeholders in [../README.md](../README.md) finalized.

## 🟢 Testing — after the package exists

- [ ] **End-to-end on a clean DHIS2** (Docker, target version; dev'd against 2.42.1):
      run `install.py` start to finish; dry-run each stage.
- [ ] **Mac dashboard-import bug** — test dashboard import on the field's actual OS; if it
      reproduces, document the workaround in [setup.md](./setup.md).
- [ ] **Role test** — a "final user / tester" account sees all dashboards but cannot edit
      Maintenance (role authorities, not sharing).
- [ ] **Mobile** — open datasets in the Android app; confirm section forms render coherently
      (see the section-vs-custom-form check below).
- [ ] **Data smoke test** — load one PC-NTD's ESPEN data, run Analytics, confirm a dashboard
      populates.
- [ ] **Access smoke test** — a user in NTD Data Entry can enter data at their district; a
      user in NTD Viewers sees dashboards; neither can edit Maintenance.
- [ ] **Maps** — confirm district geometry exists (or load it via GeoJSON import); maps render.

## Pre-export checklist (reference instance)

- [ ] Section forms vs. custom forms reconciled: for each dataset with a custom HTML form,
      compare against the auto-generated section form (the mobile/base layout); fix section
      layout for coherence, then restore the custom form.
- [ ] All charts relativized; list any that couldn't be (for `district_map`) — expected empty.
- [ ] Export performed with **"Skip sharing and access settings" ON**.

## Release cadence (order of pushing)

1. Forms + indicators + metadata (the package + validation rules).
2. Instructions + setup (the `/docs`).
3. Contents (real data, per [data-sources.md](./data-sources.md)).
