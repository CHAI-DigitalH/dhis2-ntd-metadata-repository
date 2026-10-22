# NTD DHIS2 Metadata Package

Ready-to-install DHIS2 dashboards, indicators, and data-entry forms for monitoring the five preventive-chemotherapy NTDs — **Lymphatic Filariasis, Onchocerciasis, Schistosomiasis, Soil-Transmitted Helminths, and Trachoma.**

An open Digital Public Good by **CHAI Digital Health**, with Sierra Leone's NTD programme as the model. Install it on any country's DHIS2 and adapt it.

### → [Contents &amp; Data Dictionary](./docs/contents.md)  ·  [Install Guide](./docs/setup.md)  ·  [Adapt for Your Country](./docs/adaptation.md)

---

## Install

You need a running DHIS2 (tested on **v2.42**) with your districts already set up, and Python 3.

```bash
git clone git@github.com:CHAI-DigitalH/dhis2-ntd-metadata-repository.git
cd dhis2-ntd-metadata-repository
pip install -r tools/requirements.txt
cp tools/country-config.example.yaml country-config.yaml   # set your national org-unit ID

python3 tools/install.py \
  --base-url https://YOUR-DHIS2 --username admin --password ***** \
  --config country-config.yaml \
  --package metadata/full_package.json \
  --rules metadata/validation_rules.json
```

> ⚠️ **Install with `install.py`, not a plain DHIS2 import** — a manual import silently breaks the charts.

Dashboards install empty and fill in once you enter data and run Analytics → [How to load your data](./docs/data-sources.md).
Only want one part? → [Import individual pieces](./metadata/individual/).

## What's inside

**9 dashboards · 91 indicators · 14 data-entry forms · 136 data elements** — all five diseases, at national and district level.

See the full list in the **[Contents &amp; Data Dictionary](./docs/contents.md)**.

## Docs

[Contents &amp; data dictionary](./docs/contents.md) · [Install](./docs/setup.md) · [Adapt](./docs/adaptation.md) · [Load data](./docs/data-sources.md) · [Indicators](./docs/indicators.md) · [Validation](./docs/validation.md) · [Tools](./tools/README.md)

## License

Open Digital Public Good by CHAI Digital Health. License to be finalised — see [CONTRIBUTING](./docs/CONTRIBUTING.md).
