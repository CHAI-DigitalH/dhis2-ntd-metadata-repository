# Adaptation

This document explains what must change to adopt the SL NTD Metadata Repository for a
country other than Sierra Leone, and how the tooling reduces that to as few manual
decisions as possible.

Read this **before** producing or importing a package. Everything here happens on the
*reference/source* instance (where the dashboards are built and exported) or in the
config you hand to the tooling — not by hand-editing the exported JSON.

> **The single most important adaptation principle:** relativize the dashboards before
> you export them. Do that, and adapting for a new country collapses to "point at your
> national org unit." Skip it, and you inherit Sierra Leone's 13 districts and MDA
> calendar and have to re-point every chart by hand.

---

## 1. Relativize the visualizations (do this first, on the source instance)

Charts in this repository were originally built against Sierra Leone's specific org
units and MDA months. Two kinds of hardcoding need to become relative **in Data
Visualizer, before export** — this is manual because visualization internals cannot be
edited safely via the API (see [setup.md](./setup.md), "Critical warning").

**Org units → relative selection.** For each chart, replace fixed district/national
selections with a relative one:

| Chart shows… | Use this org-unit selection |
|---|---|
| National totals / single top-line figure | **User org unit**, or the national root |
| A per-district breakdown | **Level: District** (optionally "children of" the selected parent) |

Once every chart uses a level or the user/root org unit, there is **nothing to remap
per district** — the chart means "all districts," regardless of whether the country has
5 districts or 25. This also removes the district-count-mismatch problem entirely, and
keeps hardcoded English district names out of the reference package (which helps
translation — see §5).

If you built any chart by ticking all 13 districts individually, redo it as a
**Level: District** selection — functionally identical, portably correct.

**Periods → relative.** Replace fixed months (Sierra Leone used October for
LF/Oncho/SCH/STH, April/May for Trachoma) with **"Last 12 months"** or **"This year."**
The chart then always shows trailing data regardless of when a country's MDA runs, and
never needs updating.

**Charts that can't be fully relativized.** If a chart deliberately singles out a subset
(e.g. only endemic districts), it can't be reduced to a clean level selection. Keep a
list of any such charts as you go — for those, and only those, use the `district_map` in
your country config (§3) to remap the specific districts. In practice, if all your
charts are "all national" or "all districts," this list is empty.

---

## 2. Organisation units are a prerequisite, not shipped

The package does **not** contain org units — those are country-specific and almost
always already exist in your instance (your national HMIS hierarchy). Before importing:

- Confirm your instance has its administrative hierarchy set up (national + at least a
  district level) in **Maintenance → Organisation Unit**.
- The installer ([install.py](../tools/install.py)) runs a preflight check and **stops
  with a clear message** if org units are missing or only the national level exists.

You do not map Sierra Leone's districts onto yours. Because the charts are relativized
(§1), the only org-unit value the tooling needs is your **national root UID**, which the
installer auto-detects (the single level-1 org unit) or reads from your config.

---

## 3. The country config

Copy [`tools/country-config.example.yaml`](../tools/country-config.example.yaml), fill in
your values:

```yaml
country: "Uganda"
locale: "en"
org_units:
  national_uid: "your-level-1-uid"   # or let install.py auto-detect it
  district_map: {}                    # only for non-relativized charts (usually empty)
periods:
  relativize: false                   # true only if fixed-period charts remain
options:
  scrub_audit_and_sharing: true
```

[`configure.py`](../tools/configure.py) applies it to the reference package:

```bash
python3 tools/configure.py \
    --in metadata/full_package.json \
    --out metadata/full_package.uganda.json \
    --config country-config.yaml
```

This swaps the national root UID everywhere it appears, scrubs residual
audit/ownership/sharing fields, and (optionally) relativizes leftover fixed periods. It
edits the exported JSON and leaves it to be re-imported whole, so visualization
`dataDimensionItems` are preserved.

---

## 4. Disease endemicity and scope

The repository assumes all five diseases are present and under MDA in every district. If
that is not true for your country:

- Update the `Endemicity {Disease}` data element values per district after import, before
  relying on endemicity-based charts.
- If a disease is entirely absent, don't import its dashboard/datasets — the four PC-NTD
  dashboards are independent of each other. (You can trim the package before import, or
  hide the dashboard after.)
- For NTDs beyond the five here, build new datasets/indicators/dashboards following the
  patterns in [indicators.md](./indicators.md).

---

## 5. Language and translation

French translations are included for the National, District, and LF dashboards via
DHIS2's built-in `translations` array. For another language:

1. Add a `translations` entry with the appropriate `locale` and translated `value` for
   the `NAME` property on each dashboard and visualization object.
2. Because visualization translation-only updates are ignored by metadata import, apply
   those via a browser-console PATCH (as was done for French), or include them in the
   exported object from the source instance.
3. Relativized charts (§1) help here: with no hardcoded district names baked into chart
   titles, there is far less country-specific English text to translate.

---

## 6. Data dictionary differences

If your instance already has data elements for these concepts under different UIDs:

- **Adopt this repository's data elements wholesale** (recommended for a fresh instance) —
  accepts some duplication for guaranteed dashboard compatibility. Nothing to do; the
  package brings its own data elements with their reference UIDs.
- **Remap to your existing data elements** — edit every indicator formula and
  visualization data reference to your UIDs. Significant manual work; only worth it if you
  have existing HMIS pipeline dependencies. If you do this, also regenerate the validation
  rules with your UIDs (see [validation.md](./validation.md) and
  [`build_validation_rules.py`](../tools/build_validation_rules.py) `--uids`).

Note: dataset and indicator UIDs **do not change** during normal adaptation — they are
bundled into the package and imported with the same UIDs. Only org-unit references change.
That is why `validate_import.py`'s UID checks still pass after adaptation.

---

## 7. Maps and boundary geometry

Choropleth maps render only if your org units carry boundary **geometry** (polygons). This
is country-specific spatial data the package cannot ship (it would be Sierra Leone's
boundaries), so it's the one piece that stays partly manual.

- **Check first — it's often already there.** If your DHIS2 is a national HMIS, org units
  frequently already have geometry, and maps just work. The installer reports whether your
  district-level org units have geometry.
- **If missing:** load boundaries via **Import/Export → GeoJSON import**, which matches
  features to org units by id/code/name. Public boundary sources cover almost every
  country: **geoBoundaries**, **GADM**, **OCHA COD** (Common Operational Datasets). The
  fiddly part is matching feature names to your org units — expect to confirm a crosswalk.
- **It degrades gracefully:** without geometry, only the *map* tiles are blank; every other
  chart on the dashboards still works. So this is a day-two task, not a launch blocker.

---

## Adaptation checklist

- [ ] All charts relativized in Data Visualizer (org units → level/user; periods → relative)
- [ ] List of any charts that couldn't be relativized (for `district_map`) — often empty
- [ ] Package exported with **Skip sharing** on (see [setup.md](./setup.md))
- [ ] Org-unit hierarchy exists in the target instance (national + district)
- [ ] Country config filled in (`national_uid` at minimum)
- [ ] Endemicity / disease-scope differences noted
- [ ] Translation approach decided, if not English
