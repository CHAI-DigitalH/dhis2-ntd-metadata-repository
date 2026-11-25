# Translations (French &amp; Portuguese)

DHIS2 shows metadata in each user's chosen language, falling back to the default (English) name. So you translate **once**, on the objects, and every user sees their own language automatically. No duplicate dashboards needed.

**Status:** French exists on the National, District, and LF dashboards as a template. French and Portuguese across the full set are planned (P3 in [handoff/ROADMAP.md](./handoff/ROADMAP.md)).

## How DHIS2 translations work

Every object (dashboard, visualisation, indicator, data element, dataset, section) carries a `translations` array:

```json
"translations": [
  { "locale": "fr", "property": "NAME", "value": "Filariose lymphatique traitée" },
  { "locale": "pt", "property": "NAME", "value": "Filariose linfática tratada" }
]
```

A user with UI/DB language **fr** sees the French `NAME`; others fall back to the default English name. (Set a user's language in **Settings → Account**, or per user at install — the installer's final notes mention it.)

## Adding translations

**In the app (small sets):** open an object in its Maintenance/Data Visualizer app → **Translations** → add the `fr` / `pt` name and description.

**In bulk (recommended for the whole package):**
1. Export the object names to translate — e.g. `GET /api/dataElements.json?fields=id,name&paging=false`, likewise for `indicators`, `visualizations`, `dashboards`, `dataSets`, `sections`.
2. Produce the `fr` / `pt` values (a translator, or a first pass by a tool then reviewed — NTD terminology should be checked by someone who knows it).
3. Write them back as `translations` entries, either by `PATCH`ing each object or by adding the arrays into `metadata/full_package.json` and re-importing via `install.py`.

## What to translate first

Highest visibility → lowest: **dashboard** names → **visualisation** titles → **indicator** names → **dataset** + **section** names (the data-entry forms) → **data element** names and descriptions.

Keep the English `name` as the object's default; translations are additive, so this never breaks an English install.
