# Roadmap — remaining work

Prioritised list of what's left after v1.0. Severity: **P1** blocks "complete out of the box", **P2** is a clean-handoff item, **P3** is an enhancement.

## P1 — complete the package

- **Maps in the package.** Add the choropleth map visualisations (removed because the metadata importer rejects them). Export them from the reference instance, add to `metadata/full_package.json` + re-add their dashboard items; the installer's stage 5c (PUT) and step 11 (boundaries) already handle install + rendering. *This is the only thing genuinely not working out of the box.*
- **Age-group chart + population indicators.** `LF - Target Population by Age Group` and a few age/sex "population" indicators reference demographic data elements (e.g. total population by age/sex) that aren't shipped. Decide: (a) add those DEs to the package, or (b) remove the affected chart/indicators. Until then they render blank.

## P2 — clean handoff

- **ESPEN Connector** — finish push + pull once WHO AFRO grants API access (token, endpoints, per-disease schema, sandbox). Design and remaining steps: [ESPEN.md](./ESPEN.md).
- **License & governance.** The root `LICENSE` and README still say "to be finalised". **Recommendation (confirm with CHAI):** release the **code** (`tools/`, `apps/`) under **MIT** or **Apache-2.0**, and the **metadata + docs** under **CC BY 4.0** — the common, DPG-registry-compatible split. Name the maintaining team and an issue/contribution process (`docs/CONTRIBUTING.md` is a start). This is a governance decision, not a code change — hence left for sign-off.
- **Version compatibility.** Validated on DHIS2 **v2.42** only. Test on the version(s) target countries actually run and note any differences; `install.py` could warn when the detected version is untested.

## P3 — enhancements

- **French & Portuguese dashboards.** French exists as a template; see [../translations.md](../translations.md) for how to add FR/PT via DHIS2 translations.
- **Installer UX** — a GUI/`.exe`/`.dmg` wrapper for non-technical installers (PyInstaller + a small form over `install.py`); unsigned is fine for internal use, code-signing for wide distribution.
- **`--dashboards-only` install mode** — for a view-only/analysis instance that doesn't need the data-entry forms.
- **Auto-derive `cumMda` baseline** in the ESPEN transform from historical DHIS2 data (replacing the manual baseline entry) — noted in `transform.js`.
