# NTD Metadata Repository — Review Overview

*A one-document orientation to the SL NTD Metadata Repository for review. Summarizes the
core features, what adopting it looks like, the supporting tools, current status, and next
steps. For detail, follow the links into the full docs.*

**What it is in one line:** a DHIS2 metadata package + dashboards + tooling that gets any
PC-NTD-endemic country ~90% of the way to a working NTD monitoring instance, built by CHAI
Sierra Leone as a proof-of-concept Digital Public Good.

**Status in one line:** the design, dashboards, indicators, validation rules, documentation,
and installation tooling are complete; the remaining work is producing the actual metadata
export (a manual dashboard pass + export) and a first clean-instance test.

---

## 1. Core features

Covers five Neglected Tropical Diseases — **Lymphatic Filariasis (LF), Onchocerciasis
(Oncho), Schistosomiasis (SCH), Soil-Transmitted Helminths (STH), and Trachoma** — at
district-aggregate level, optimized for dashboard-first programme monitoring.

| Feature | What it provides |
|---|---|
| **13 datasets** | Treatment reporting, drugs management, procurement (JRSM), microplanning, and Trachoma-specific forms (TEMF, prevalence surveys). |
| **9 dashboards** | National overview, District performance, four PC-NTD disease dashboards, Trachoma, Trachoma WASH, and a cross-cutting Drug Management & Programme Planning dashboard. |
| **Indicator logic** | Coverage Rate, Refusal Rate, and Coverage Gap computed consistently across all four PC-NTDs, plus a blended NTD Overall Coverage Rate. See [indicators.md](./indicators.md). |
| **14 validation rules** | Native DHIS2 data-plausibility checks (coverage over 110%, impossible drug balances, out-of-range prevalence). See [validation.md](./validation.md). |
| **ESPEN Connector app** | A DHIS2 app that submits country treatment data to the WHO AFRO ESPEN portal. |
| **Translation template** | French translations of the National, District, and LF dashboards, as a pattern for other languages. |

**What it is not:** a replacement for the official WHO NTD Overarching Module (which covers
30+ NTDs with case-level detail); a tool that generates DHIS2 visualizations programmatically
(a platform limitation — see below); or pre-loaded with real data beyond Sierra Leone's
proof-of-concept.

**One important platform constraint:** DHIS2 visualizations cannot be created or reliably
edited via the API — the data references inside a chart only survive a genuine export/import
round-trip. This is why the dashboards ship as a pre-built export and are cloned by hand
rather than scripted. It shapes the whole packaging approach. See [setup.md](./setup.md).

---

## 2. What implementing it looks like (for an adopting country)

The target experience is close to "clone and run," with one genuinely local prerequisite.

**Prerequisites the country provides:**
- A DHIS2 instance (developed against 2.42.1).
- Their own organisation-unit hierarchy (national + district) — this is country-specific and
  never shipped in the package.

**The install itself** — one command via the CLI installer (or, later, a wizard inside the
ESPEN app). The installer runs the full sequence:

1. Verify connection & DHIS2 version
2. Preflight org units (stop if missing; warn if map geometry absent)
3. Detect/confirm the national org unit
4. Adapt the package to the country (swap the national UID, clean up)
5. Dry-run the import, show a summary, then commit atomically
6. Import validation rules
7. Import a generic access scaffold (roles + user groups)
8. Assign datasets to national + district org units — so data entry works immediately
9. Apply sharing — so dashboards are visible
10. Regenerate category option combos

**After install, the country does two local things:** create their user accounts (assigning
each a shipped role — NTD Administrator / Data Entry / Viewer — plus group membership and
org-unit scope), and load their data. Then dashboards populate once analytics run.

**Adaptation is deliberately minimal.** Because the dashboards are *relativized* (charts use
"all districts at this level" and relative time periods rather than Sierra Leone's specific
districts and MDA months), adopting for a new country collapses to "point at your national org
unit" — no per-district remapping, and it works regardless of how many districts a country has.
See [adaptation.md](./adaptation.md).

---

## 3. Supporting tools

### CLI installer & scripts (`/tools`)
A small Python toolchain, documented in [tools/README.md](../tools/README.md):

| Tool | Role |
|---|---|
| `build_metadata_package.py` | Assembles the single importable package from DHIS2 dependency exports (dedupe, clean, exclude default objects). |
| `configure.py` | Adapts the package for a country (national UID swap, scrub, strip dataset org-unit refs). |
| `build_validation_rules.py` | Generates the validation rules from a UID table (regenerate on remap). |
| `install.py` | The one-command installer (the 10 steps above). |
| `validate_import.py` | Post-import checks — confirms datasets, indicators, and dashboards landed and aren't blank. |

Design choices worth noting for review: the installer **never handles the visualization
internals via API** (it edits exported JSON and re-imports it whole, preserving the charts);
it **always dry-runs before committing** and imports atomically, so a failed install changes
nothing; and org units, users, and boundary geometry are treated as country-provided
prerequisites rather than shipped content.

### ESPEN Connector app (`/apps/espen-connector`)
A DHIS2 web app (React, DHIS2 app platform) that pulls a country's NTD treatment data from
DHIS2, validates it per district, and submits it to the WHO AFRO ESPEN portal. It has a
working setup/review/validate/submit flow. **Outstanding before production use:** confirm the
data-element UIDs (currently placeholders) against the final metadata, and confirm the ESPEN
submission token format with WHO AFRO.

### Planned: in-app installer (Phase 2)
The same install sequence, surfaced as a wizard inside the ESPEN app. The advantage is that it
runs in the logged-in admin's authenticated DHIS2 session — no credentials to handle — with
dropdowns instead of a config file. The CLI is being built first as the testable reference; the
in-app version is a GUI over the identical API operations.

---

## 4. Current status

| Area | Status |
|---|---|
| Indicator logic, dashboards, validation rules (design) | Complete |
| Documentation (setup, adaptation, indicators, data sources, validation) | Complete |
| Installation tooling (CLI + scripts + access scaffold) | Built and tested against synthetic fixtures; not yet run against a live DHIS2 |
| The metadata package (`full_package.json`) | **Not yet produced** — requires the manual relativization pass + dependency export |
| ESPEN Connector app | Functional; needs real UIDs + confirmed ESPEN auth |
| Governance & license | To be finalized |

See [deployment-readiness.md](./deployment-readiness.md) for the itemized checklist.

---

## 5. Next steps

**Immediate — to a first testable package (the critical path):**
1. Relativize all dashboard charts in Data Visualizer (org units → level; periods → relative).
2. Attach indicators to each of the 13 datasets in Maintenance.
3. Reconcile custom HTML forms against their section-form (mobile) equivalents.
4. Dependency-export each dashboard with "Skip sharing" on, then run
   `build_metadata_package.py` to produce `full_package.json`.

**Then — first clean-instance test install:**
5. Run the installer end-to-end on a fresh DHIS2 at the target version; work the
   post-install verification checklist (role authorities, mobile forms, maps geometry, and a
   data smoke test), including a check for the suspected Mac dashboard-import behaviour.

**To reach a complete DPG:**
6. Finalize the ESPEN Connector (real UIDs, ESPEN token) if it ships in scope.
7. Decide license, maintaining organization, and contribution process.
8. Build the in-app installer (Phase 2) once the CLI sequence is proven.

**Open questions for reviewers:**
- License and governance model for a Digital Public Good release.
- Whether the ESPEN Connector is in scope for the first release or a follow-on.
- Target DHIS2 version(s) to formally support.
- Priority of the in-app installer vs. keeping the CLI as the only path initially.
