# Data Sources

This document lists every dataset in the SL NTD Metadata Repository, where its data comes from, who in a typical NTD programme owns that data, and how to get it into DHIS2. Use this when you have metadata imported (per [setup.md](./setup.md)) but need to actually populate it with real country data.

Datasets fall into two categories: those sourced from **ESPEN** (the WHO AFRO Expanded Special Project for Elimination of NTDs portal), and those that are **manually reported** through country-specific planning and logistics documents that do not flow through ESPEN.

## ESPEN-sourced datasets

ESPEN aggregates PC-NTD MDA results across endemic countries and exposes them via a documented API (`admin.espen.afro.who.int/docs/api/data`). If your country already reports to ESPEN — which is true for essentially all PC-NTD-endemic countries, since ESPEN reporting is the standard WHO AFRO mechanism — this is the fastest path to populating historical data.

| Dataset | Disease | Source | Typical owner | Format |
|---|---|---|---|---|
| MDA1 - LF Treatment | LF | ESPEN | NTD Programme M&E Officer | District-level annual treatment, refusal, and adverse event counts |
| MDA3 - Oncho Treatment | Oncho | ESPEN | NTD Programme M&E Officer | District-level annual treatment (round 1, round 2), refusal, adverse events |
| T2 - SCH Treatment | SCH | ESPEN | NTD Programme M&E Officer | District-level annual treatment, refusal, adverse events |
| T3 - STH Treatment | STH | ESPEN | NTD Programme M&E Officer | District-level annual treatment (round 1, round 2), refusal, adverse events |

**How to populate:** This repository includes an ESPEN Connector DHIS2 app for submitting country data to ESPEN. A complementary **pull** direction (ESPEN → DHIS2) is a planned addition — see the project roadmap — and would use the same documented ESPEN API to fetch a country's existing historical submissions and convert them into a DHIS2 `dataValueSets` import payload. Until that pull tool exists, historical ESPEN data needs to be exported from ESPEN's own reporting interface and reshaped into DHIS2's import format manually or via a one-off script, matching ESPEN's district names/codes to your DHIS2 org unit UIDs.

**What ESPEN does not cover:** ESPEN focuses on treatment coverage outcomes. It does not include drug logistics (quantities received, distributed, wasted), procurement planning, or population targeting calculations — those come from the manually-reported sources below.

## Manually-reported datasets

These datasets reflect national planning and logistics documents specific to each country's NTD programme operations. They are not centralized anywhere globally — each country's programme generates and holds these directly.

### Drugs Management (4 datasets — one per PC-NTD)

| Dataset | Source document | Typical owner | Reporting frequency |
|---|---|---|---|
| LF Drugs Management | National drug logistics/pharmacy tracking sheet | NTD Programme Supply Chain / Pharmacy Officer | Monthly, around MDA month |
| Oncho Drugs Management | Same | Same | Same |
| SCH Drugs Management | Same | Same | Same |
| STH Drugs Management | Same | Same | Same |

**Fields covered:** tablets received, quantity provided to clients, theoretical balance, actual remaining stock after MDA, drugs wasted, drugs lost, drugs near expiry, expiry dates.

**How to populate:** These come from your country's existing drug logistics tracking — typically an Excel sheet maintained by the supply chain officer during and after each MDA round. There is no standard external API for this data; it must be transcribed into DHIS2 either via manual data entry per district, or via a CSV import prepared from the existing Excel tracking sheet. If your country's logistics sheet has a consistent column structure across years, a one-time CSV mapping script is worth building rather than re-entering historical years by hand.

### JRSM (Joint Request for Selected Medicines)

| Dataset | Source document | Typical owner | Reporting frequency |
|---|---|---|---|
| JRSM | Annual WHO/ITI drug donation request form | NTD Programme Manager, submitted to WHO AFRO | Yearly |

**Fields covered:** population requiring preventive chemotherapy (PC) per disease, population targeted, drug quantities to procure and remaining in stock per commodity (ALB, MBD, IVM, PZQ, plus Trachoma-specific Azithromycin variants), endemicity classification per district.

**How to populate:** The JRSM is a real annual document your NTD programme already prepares and submits to WHO for drug donation requests — it is not invented for this repository. Transcribe your country's most recent JRSM submission(s) into the corresponding DHIS2 data elements. If your programme has multiple years of past JRSM submissions on file, prioritize transcribing those for historical trend charts.

### Microplanning

| Dataset | Source document | Typical owner | Reporting frequency |
|---|---|---|---|
| NTD Microplanning | National/district MDA microplan | NTD Programme Manager + District Health Management Teams | Yearly, before each MDA round |

**Fields covered:** population treated, endemicity, population requiring PC, population targeted, population not treated — at both national and district level.

**How to populate:** Microplans are typically developed jointly between the national NTD programme and district health teams ahead of each year's MDA. If district-level microplans exist as separate documents per district, this is the most labor-intensive dataset to transcribe — budget time accordingly, or prioritize the most recent 2-3 years if historical depth is less important than current-year accuracy for your launch.

### Trachoma datasets (4 datasets)

| Dataset | Source document | Typical owner | Reporting frequency |
|---|---|---|---|
| TEMF - Trachoma MDA and Trichiasis Management | Trachoma Epidemiological Monitoring Form (TEMF) | NTD Programme M&E Officer, Trachoma-specific | Monthly, around April MDA |
| TEMF - Child MDA | Same TEMF, child-specific section | Same | Monthly, around May |
| TEMF - Drugs Management | Same TEMF, logistics section | NTD Programme Supply Chain Officer | Monthly, around April |
| Trachoma Survey | Population-based prevalence survey report (TF/TT prevalence, WASH) | National Trachoma survey team / WHO-supported survey partners | Yearly |

**Fields covered:** treatment by drug type (Azithromycin tablets, pediatric suspension, eye drops, eye ointment, syrup), refusals, referrals, adverse events, trichiasis management (epilation, surgery, other), TF/TT prevalence (surveillance and impact survey), WASH indicators (water access, sanitation, handwashing).

**How to populate:** TEMF reporting is the standard WHO trachoma monitoring form — if your country runs a trachoma elimination programme, this form already exists in some format. The Trachoma Survey data specifically comes from population-based prevalence surveys, which are periodic (not necessarily annual) and conducted by trained survey teams, often with WHO or partner organization support (e.g. Sightsavers, RTI International, depending on region). If a survey hasn't been conducted in a given year, that year will correctly show no data for TF/TT prevalence and WASH indicators — do not interpolate or estimate values to fill gaps.

## Data not currently sourced from anywhere

Two categories of data referenced in [setup.md](./setup.md)'s known limitations are not sourced from any document because the underlying data doesn't exist in a usable form yet:

- **Sex-disaggregated treatment outcomes** — would require facility-level or tracker-based data collection, not the current district-aggregate reporting model. No existing national document in a typical NTD programme captures this at district-aggregate level.
- **Trachoma targeted population** — no JRSM-equivalent procurement planning document exists for Trachoma in the way it does for the four PC-NTDs, since Trachoma drug donation runs through the International Trachoma Initiative (ITI) on a separate process from the PC-NTD JRSM mechanism. If your country's trachoma programme has an equivalent targeting document through ITI, it could be added as a new dataset following the same pattern as JRSM.

## Recommended population order

If you are starting from zero data and need to prioritize, populate in this order for fastest path to a working demo dashboard:

1. **One PC-NTD's treatment data from ESPEN** (e.g. LF) — fastest to get real numbers showing on a dashboard, since ESPEN data is likely already in a clean, exportable format
2. **That same disease's most recent year of Drugs Management data** — completes the LF dashboard's Module 4
3. **Microplanning for the same disease/year** — completes Module 3's population requiring PC vs targeted chart
4. **Repeat steps 1-3 for Oncho, SCH, STH**
5. **JRSM for the most recent year** — populates the cross-cutting Drug Management & Programme Planning dashboard
6. **Trachoma TEMF data** — separate effort, can run in parallel with steps 1-5 since it doesn't depend on the same data elements
7. **Historical years** for all of the above, prioritized by your programme's reporting and analysis needs rather than attempted exhaustively from the start
