# Maps &amp; district boundaries

Some dashboards include **choropleth maps** (shaded district maps — e.g. coverage by district). A map only draws if your organisation units carry **boundary geometry** — the district shapes, as GeoJSON. Boundaries aren't shipped in the package because they belong to your country, but loading them is quick, and the installer tells you whether you need to.

> **Everything else works without this.** If boundaries are missing, only the *map* tiles are blank — every chart, table, and number is unaffected.

## 1. Does the installer say you need this?

When you run `install.py`, the org-unit preflight checks your district level and prints one of:

- `Maps: all level-2 org units carry boundary geometry — maps will render.` → you're done, skip the rest.
- `⚠ MAPS: X/Y district org units have no boundary geometry…` → follow the steps below.

You can re-check any time in the **Maintenance** app → Organisation Unit → open a district → it shows a map if geometry exists.

## 2. Get your district boundaries (GeoJSON)

Download administrative boundaries for your country from any public source — these are free and cover almost every country:

- **geoBoundaries** — https://www.geoboundaries.org (pick country + admin level, download GeoJSON)
- **GADM** — https://gadm.org
- **OCHA Common Operational Datasets** (on HDX) — https://data.humdata.org

Pick the admin level that matches your DHIS2 **district** level (often ADM1 or ADM2).

## 3. Import the boundaries into DHIS2

1. Open the **Import/Export** app → **GeoJSON import**.
2. Upload your GeoJSON file.
3. Choose how features match your org units — by **id**, **code**, or **name**. Code-matching is most reliable; name-matching is easiest if the district names line up.
4. Run the import. DHIS2 attaches each boundary to its matching org unit.

## 4. Verify

Open the **Maps** app and add a district-level layer — you should see shaded districts. The dashboard map tiles then render the same way.

## Note on the dashboard map tiles

Loading your boundaries (above) is the prerequisite for **any** map. The map *visualisations* on the dashboards are being finalised in the package — DHIS2's metadata importer handles maps differently from charts — so until they ship, you can build a coverage map in the **Maps** app in a couple of minutes once boundaries are loaded. Status is tracked in [CONTRIBUTING.md](./CONTRIBUTING.md).
