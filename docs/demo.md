# Running a demo (with data)

The package is metadata-only, so a fresh install shows **"No data available"**. To show it *working* — populated dashboards, like the DHIS2 demo — load sample data and run analytics.

## Quick demo

After installing (see the [README](../README.md)):

```bash
python3 tools/seed_demo_data.py \
  --base-url https://YOUR-DHIS2 --username admin --password ***** --analytics
```

This fills the 14 NTD datasets with **random demo values** across districts and years, then kicks off analytics. ~15 min later (analytics is the slow part), open the dashboards and they're populated.

> The data is **random and fake** — good for "does it render / how does it look", not for any real figure. Never run this against a production instance.

## What the seeder does

1. Adds the current user to the **NTD Data Entry** group (so it can write data).
2. Generates a value for every data element × district × period × category option combo, respecting each data element's value type and option sets.
3. Imports in batches (resilient — it de-duplicates and continues past a failed batch).
4. With `--analytics`, triggers an aggregate-only analytics run (`skipEvents`, recent years).

## Tips

- **Analytics is the bottleneck**, not the install or seed. On a small/under-resourced host it can be slow; `seed_demo_data.py --analytics` already scopes it down. To go faster for a quick look, trigger a current-year-only run yourself: `POST /api/resourceTables/analytics?skipEvents=true&lastYears=1`.
- **Charts went blank after a restart?** The data survives but analytics tables are cleared — just re-run analytics (Data Administration → Analytics, or the curl above). No re-seed needed.
- **Real demo data** (not random) — load an actual country's figures per [data-sources.md](./data-sources.md) instead.
