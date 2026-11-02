# Contents & Metadata Reference

What's inside the package — dashboards, data-entry forms, and every data element. Install steps are in the [README](../README.md); indicator formulas in [indicators.md](./indicators.md).

**At a glance:** 9 dashboards · 113 visualisations · 91 indicators · 136 data elements · 14 datasets · 14 validation rules

> 📊 **[Download the full data dictionary (Excel)](./data-dictionary.xlsx)** — every data element (code, type, disaggregation, description), every indicator with its formula, and the coded option sets.

## Dashboards

| Dashboard | What it shows |
|---|---|
| **NTD — 1. National** | Cross-disease national overview — treatment totals, coverage %, and treatment gaps across all five NTDs. |
| **NTD — 2. District** | District-level performance and coverage scorecards, comparing districts across diseases. |
| **NTD — 3. Lymphatic Filariasis (LF)** | LF programme — population treated/targeted/required, coverage and treatment gap, endemicity by district, adverse events, and drug pipeline. |
| **NTD — 4. Onchocerciasis (Oncho)** | Oncho programme — treatment, coverage, endemicity, adverse events. |
| **NTD — 5. Schistosomiasis (SCH)** | SCH programme — treatment, coverage, endemicity, adverse events. |
| **NTD — 6. Soil Transmitted Helminths (STH)** | STH programme — treatment, coverage, endemicity, adverse events. |
| **NTD — 7. Trachoma** | Trachoma — MDA treatment by drug type, TF/TT prevalence trends, and trichiasis (TT) case management. |
| **NTD — 8. Trachoma WaSH** | Water, sanitation and hygiene indicators that support trachoma elimination. |
| **NTD — 9. Drug Management & Programme Planning** | Cross-disease commodity accounting, procurement planning (JRSM), and MDA round planning. |

## Datasets (data-entry forms)

| Dataset | Period | Data elements | What it collects |
|---|---|---|---|
| **0. NTD Microplanning** | Yearly | 39 | Annual population targets and microplanning figures per disease and age group. |
| **0. Trachoma Survey** | Yearly | 23 | TF/TT prevalence survey results and elimination-progress indicators. |
| **JRSM- Joint Request for Select Medicines** | Yearly | 39 | Tablet quantities to procure and remaining in stock, per drug. |
| **MDA1- LF Drugs Management** | Monthly | 14 | LF drug accountability — tablets received, distributed, remaining, wasted, lost. |
| **MDA1- Lymphatic Filariasis Treatment** | Yearly | 4 | LF treatment outcomes — population targeted, treated, and not treated. |
| **MDA3 - Oncho Drugs Management** | Monthly | 14 | Oncho drug accountability. |
| **MDA3- ONCHO Treatment** | Yearly | 5 | Oncho treatment outcomes. |
| **T2- Schistosomiasis Drugs Management** | Monthly | 14 | SCH drug accountability. |
| **T2- Schistosomiasis Treatment** | Yearly | 4 | SCH treatment outcomes. |
| **T3- STH Drugs Management** | Monthly | 14 | STH drug accountability. |
| **T3- Soil Transmitted Helminths Treatment** | Yearly | 5 | STH treatment outcomes. |
| **TEMF - Child MDA** | Monthly | 5 | Trachoma child MDA treatment. |
| **TEMF - Drugs Management** | Monthly | 13 | Trachoma drug accountability. |
| **TEMF - Trachoma MDA and Trichasis Management** | Monthly | 14 | Trachoma MDA treatment by drug type and trichiasis (TT) case management. |

## Data elements

Listed by the dataset they belong to. `code` is the machine identifier, `type` the value type. Full descriptions are in the [Excel dictionary](./data-dictionary.xlsx).


### 0. NTD Microplanning

| Data element | Code | Type |
|---|---|---|
| Endemicity LF | `ntd-endemicity-lf` | INTEGER_ZERO_OR_POSITIVE |
| Endemicity Oncho | `ntd-endemicity-oncho` | INTEGER_ZERO_OR_POSITIVE |
| Endemicity SCH | `ntd-endemicity-sch` | INTEGER_ZERO_OR_POSITIVE |
| Endemicity STH | `ntd-endemicity-sth` | INTEGER_ZERO_OR_POSITIVE |
| Geoconnect ID | `ntd-geoconnect-id` | INTEGER_POSITIVE |
| Intervention Status | `trch-intervention-status` | INTEGER_POSITIVE |
| NTD Population | `ntd-ntd-population` | NUMBER |
| Number of Persons Targeted for TT Management | `trch-persons-operated-target` | INTEGER |
| Number of children target for Child MDA | `trch-persons-operated-target-chld` | INTEGER |
| Number of treatment rounds planned for the year | `ntd-number-of-treatment-rounds-planned-for-the-yea` | INTEGER_ZERO_OR_POSITIVE |
| PC implemented - Round 1 | `pcn-int-implemented-r1` | INTEGER_POSITIVE |
| PC implemented - Round 2 | `pcn-int-implemented-r2` | INTEGER_POSITIVE |
| Population Targeted for MDA1 | `ntd-population-targeted-for-mda1` | NUMBER |
| Population Targeted for MDA3 | `ntd-population-targeted-for-mda3` | NUMBER |
| Population Targeted for T1-ALB | `ntd-population-targeted-for-t1-alb` | NUMBER |
| Population Targeted for T1-PZQ | `ntd-population-targeted-for-t1-pzq` | NUMBER |
| Population Targeted for T2 | `ntd-population-targeted-for-t2` | NUMBER |
| Population Targeted for T3/STH Round 1 | `ntd-population-targeted-for-t3-sth-round-1` | NUMBER |
| Population Targeted for T3/STH Round 2 | `ntd-population-targeted-for-t3-sth-round-2` | NUMBER |
| Population requiring PC - LF | `pcn-pop-require-pc-lf` | INTEGER |
| Population requiring PC - SCH | `pcn-pop-require-pc-sch` | INTEGER |
| Population requiring PC - STH | `pcn-pop-require-pc-sth` | INTEGER |
| Population requiring PC - oncho | `pcn-pop-require-pc-ov` | INTEGER |
| Population requiring PC - trachoma | `pcn-pop-require-pc-tr` | INTEGER |
| Population targeted for LF treatment | `pcn-pop-trgt-lf` | INTEGER |
| Population targeted for SCH treatment | `pcn-pop-trgt-sch` | INTEGER |
| Population targeted for STH and SCH treatment | `pcn-pop-trgt-sth` | INTEGER |
| Population targeted for oncho treatment | `pcn-pop-trgt-ov` | INTEGER |
| Population targeted for trachoma MDA | `pcn-pop-trgt-tr` | INTEGER |
| Remaining rounds of MDA after the recent survey | `pcn-pop-trgt-rem-round` | INTEGER |
| TF category | `ntd-tf-category` | INTEGER_POSITIVE |
| TT cases managed since last survey | `trc-pop-treat-prv-surv` | INTEGER |
| TT cases unkown to the health system | `trc-elem-trg` | INTEGER_ZERO_OR_POSITIVE |
| Total number of TT backlog | `trch-tt-backlog` | INTEGER_ZERO_OR_POSITIVE |
| Trachoma - Remaining MDA rounds | `ntd-trachoma-remaining-mda-rounds` | INTEGER_ZERO_OR_POSITIVE |
| Trachoma treatment strategy | `trc-treatment-strategy` | INTEGER_POSITIVE |
| Treatment request | `trch-treatment-request` | NUMBER |
| Treatment request approved | `trch-treatment-request-approved` | NUMBER |
| Treatment request conditionally approved | `trch-treatment-request-conditionally-approved` | NUMBER |

### 0. Trachoma Survey

| Data element | Code | Type |
|---|---|---|
| Full geographic coverage status | `ntd-fgc-status` | NUMBER |
| Percent of household with NO soap available in handwashing facility | `ntd-hh-with-no-soap-available-in-handwashingf` | NUMBER |
| Percent of household with NO water in handwashing facility | `ntd-hh-with-with-no-water-in-handwashing-facility` | NUMBER |
| Percent of household with soap available in handwashing facility | `ntd-hh-with-soap-available-in-handwashingf` | NUMBER |
| Percent of household with water in handwashing facility | `ntd-hh-with-with-water-in-handwashing-facility` | NUMBER |
| Percent of households Not able to access toilet | `ntd-household-not-able-to-access-toilet` | NUMBER |
| Percent of households where defecation is No structure, outside somewhere | `ntd-of-households-where-defecation-no-structure` | NUMBER |
| Percent of households where defecation is Private latrine | `ntd-of-households-where-defecation-is-p-latrine` | NUMBER |
| Percent of households where defecation is Shared or public latrine | `ntd-of-households-where-defecation-shared-p-latrin` | NUMBER |
| Percent of households with NO handwashing facility in the yard/plot/premises | `ntd-hh-no-handwashing-facility-yard-plot-premises` | NUMBER |
| Percent of households with No facilities or bush or field or surface water | `ntd-hh-with-no-facilities-bush-field-surface-water` | NUMBER |
| Percent of households with Pit latrine with slab | `ntd-household-with-pit-latrine-with-slab` | NUMBER |
| Percent of households with Pit latrine without slab/open pit as toilet facility | `ntd-household-with-pit-latrine-without-slab-open-p` | NUMBER |
| Percent of households with handwashing facility in the yard/plot/premises | `ntd-hh-with-handwashing-facility-yard-plot-premise` | NUMBER |
| Percent of households with water distance Less than 30 minutes | `ntd-of-households-with-water-distance-30m` | NUMBER |
| Percent of households with water distance More than 1 hour | `ntd-of-households-with-water-distance-1h` | NUMBER |
| Percent of households with water distance Unknown | `ntd-of-households-with-water-distanceunknown` | NUMBER |
| Percent of households with water source in the Yard | `ntd-of-households-with-water-source-in-the-yard` | NUMBER |
| Proportion of HH with drinking water source collection time is less than 30 minutes for round trip | `ntd-of-households-with-water-distance-between-30m` | NUMBER |
| TF1-9 % impact survey | `trch-tf-pct-impact` | NUMBER |
| TF1-9 % surveillance survey | `trch-tf-pct-surveillance` | NUMBER |
| TT % impact survey | `trch-tt-pct` | NUMBER |
| TT % surveillance survey | `trch-tt-pct-surveillance` | NUMBER |

### JRSM- Joint Request for Select Medicines

| Data element | Code | Type |
|---|---|---|
| Epidemiological surveys planned for the year  | `ntd-epidemiological-surveys-planned-for-the-year` | NUMBER |
| JRSM - Adults (PZQ) | `ntd-jrsm-adults-pzq` | INTEGER_ZERO_OR_POSITIVE |
| JRSM - All SAC targeted | `ntd-jrsm-all-sac-targeted` | BOOLEAN |
| JRSM - Bottle (400 mg) 200 tablets (LF) | `ntd-jrsm-bottle-400-mg-200-tablets-lf` | INTEGER_ZERO_OR_POSITIVE |
| JRSM - Bottle (400 mg) 200 tablets (STH) | `ntd-jrsm-bottle-400-mg-200-tablets-sth` | INTEGER_ZERO_OR_POSITIVE |
| JRSM - Bottles (3mg) 500 tablets (IVM) | `ntd-jrsm-bottles-3mg-500-tablets-ivm` | INTEGER_ZERO_OR_POSITIVE |
| JRSM - Bottles (500 mg) 150 tablets (MBD) | `ntd-jrsm-bottles-500-mg-150-tablets-mbd` | INTEGER_ZERO_OR_POSITIVE |
| JRSM - LF only | `ntd-jrsm-lf-only` | INTEGER_ZERO_OR_POSITIVE |
| JRSM - LF+Oncho | `ntd-jrsm-lf-oncho` | INTEGER_ZERO_OR_POSITIVE |
| JRSM - Oncho only | `ntd-jrsm-oncho-only` | INTEGER_ZERO_OR_POSITIVE |
| JRSM - Remaining in stock (IVM) | `ntd-jrsm-remaining-in-stock-ivm` | INTEGER_ZERO_OR_POSITIVE |
| JRSM - Remaining in stock (LF) | `ntd-jrsm-remaining-in-stock-lf` | INTEGER_ZERO_OR_POSITIVE |
| JRSM - Remaining in stock (MBD) | `ntd-jrsm-remaining-in-stock-mbd` | INTEGER_ZERO_OR_POSITIVE |
| JRSM - Remaining in stock (PZQ) | `ntd-jrsm-remaining-in-stock-pzq` | INTEGER_ZERO_OR_POSITIVE |
| JRSM - Remaining in stock (STH) | `ntd-jrsm-remaining-in-stock-sth` | INTEGER_ZERO_OR_POSITIVE |
| JRSM - SAC (PZQ) | `ntd-jrsm-sac-pzq` | INTEGER_ZERO_OR_POSITIVE |
| JRSM - Select medicine for treatment of STH | `ntd-jrsm-select-medicine-for-treatment-of-sth` | INTEGER_POSITIVE |
| JRSM - Tablets to be procured (IVM) | `ntd-jrsm-tablets-to-be-procured-ivm` | INTEGER_ZERO_OR_POSITIVE |
| JRSM - Tablets to be procured (LF) | `ntd-jrsm-tablets-to-be-procured-lf` | INTEGER_ZERO_OR_POSITIVE |
| JRSM - Tablets to be procured for SAC (MBD) | `ntd-jrsm-tablets-to-be-procured-for-sac-mbd` | INTEGER_ZERO_OR_POSITIVE |
| JRSM - Tablets to be procured for SAC (STH) | `ntd-jrsm-tablets-to-be-procured-for-sac-sth` | INTEGER_ZERO_OR_POSITIVE |
| JRSM - Targeted Adult at lower level for SCH | `ntd-jrsm-targeted-adult-at-lower-level-for-sch` | INTEGER_ZERO_OR_POSITIVE |
| JRSM - Targeted SAC at lower level for SCH | `ntd-jrsm-targeted-sac-at-lower-level-for-sch` | INTEGER_ZERO_OR_POSITIVE |

### MDA1- LF Drugs Management

| Data element | Code | Type |
|---|---|---|
| (A) Number of tablets remain from previous MDA | `pcn-drugs-available` | INTEGER_ZERO_OR_POSITIVE |
| (B) Number of tablets received | `pcn-drugs-issued` | INTEGER_ZERO_OR_POSITIVE |
| (C) Quantity available to for current MDA | `pcn-drugs-available-current-mda` | INTEGER |
| (E) Quantity provided to clients | `pcn-drugs-distributed` | INTEGER |
| (G) Theoretical Balance | `pcn-drugs-theoretical-balance` | INTEGER |
| (H) Actual number of tablets remain after MDA | `pcn-drugs-remaining` | INTEGER_ZERO_OR_POSITIVE |
| (J) Nearest expiry date | `pcn-drugs-expire-date` | DATE |
| (K) Number of drugs near expiry | `pcn-drugs-near-expiry` | INTEGER_ZERO_OR_POSITIVE |
| Expire dates of remaining medicine from previous MDA | `pcn-drugs-expire-date-prev` | DATE |
| Number drugs expired | `pcn-drugs-expired` | INTEGER |
| Number drugs lost | `pcn-drugs-lost` | INTEGER |
| Number drugs transferred-IN | `pcn-drugs-transferred-in` | INTEGER |
| Number drugs transferred-OUT | `pcn-drugs-transferred-OUT` | INTEGER |
| Number drugs wasted | `pcn-drugs-wasted` | INTEGER |

### MDA1- Lymphatic Filariasis Treatment

| Data element | Code | Type |
|---|---|---|
| LF - Number of serious adverse events | `pcn-sae-lf` | INTEGER_ZERO_OR_POSITIVE |
| LF- Number of serious adverse events referred | `pcn-sae-referred-lf` | INTEGER_ZERO_OR_POSITIVE |
| Population not treated - LF | `pcn-pop-nottrt-lf` | INTEGER |
| Population treated for LF | `pcn-pop-trt-lf` | INTEGER |

### MDA3- ONCHO Treatment

| Data element | Code | Type |
|---|---|---|
| ONCHO - Number of serious adverse events | `pcn-sae-oncho` | INTEGER_ZERO_OR_POSITIVE |
| ONCHO - Number of serious adverse events referred | `pcn-sae-referred-oncho` | INTEGER_ZERO_OR_POSITIVE |
| Population not treated - oncho | `pcn-pop-nottrt-ov` | INTEGER |
| Population treated for Oncho round 1 | `pcn-pop-trt-ov-r1` | INTEGER |
| Population treated for Oncho round 2 | `pcn-pop-trt-ov-r2` | INTEGER |

### T2- Schistosomiasis Treatment

| Data element | Code | Type |
|---|---|---|
| Population not treated - SCH | `pcn-pop-nottrt-sch` | INTEGER |
| Population treated for SCH | `pcn-pop-trt-sch` | INTEGER |
| SCH - Number of serious adverse events referred | `pcn-sae-referred-sch` | INTEGER_ZERO_OR_POSITIVE |
| SCH- Number of seriousadverse events | `pcn-sae-sch` | INTEGER_ZERO_OR_POSITIVE |

### T3- Soil Transmitted Helminths Treatment

| Data element | Code | Type |
|---|---|---|
| Population not treated - STH | `pcn-pop-nottrt-sth` | INTEGER |
| Population treated for STH round 1 | `pcn-pop-trt-sth-r1` | INTEGER |
| Population treated for STH round 2 | `pcn-pop-trt-sth-r2` | INTEGER |
| STH - Number of serious adverse events | `pcn-sae-sth` | INTEGER_ZERO_OR_POSITIVE |
| STH- Number of serious adverse events referred | `pcn-sae-referred-sth` | INTEGER_ZERO_OR_POSITIVE |

### TEMF - Child MDA

| Data element | Code | Type |
|---|---|---|
| Number of children NOT treated for Trachoma during Child MDA | `trch-persons-not-treated-chld` | INTEGER_ZERO_OR_POSITIVE |
| Number of children treated for Trachoma during Child MDA | `trch-persons-treated-chld` | INTEGER_ZERO_OR_POSITIVE |
| Trachoma - Child MDA round number | `ntd-trachoma-child-mda-round-number` | INTEGER_ZERO_OR_POSITIVE |
| Trachoma - Severe adverse events (Child MDA) | `pcn-sae-tt-chld` | INTEGER_ZERO_OR_POSITIVE |
| Trachoma - Severe adverse events referred (Child MDA) | `pcn-saer-tt-chld` | INTEGER_ZERO_OR_POSITIVE |

### TEMF - Trachoma MDA and Trichasis Management

| Data element | Code | Type |
|---|---|---|
| Number of persons managed for TT (other) | `trch-persons-operated-other` | INTEGER |
| Number of persons managed for TT by Epilation | `trch-persons-operated-epilation` | INTEGER |
| Number of persons managed for TT by Surgery | `trch-persons-operated` | INTEGER |
| Number of persons referred | `trch-persons-referred` | INTEGER |
| Number of persons refused | `trch-persons-refused` | INTEGER |
| Population not treated - trachoma | `pcn-pop-nottrt-tr` | INTEGER |
| Population treated for trachoma with Azithromycin Pediatric Oral Suspension | `ntd-population-treated-for-trac-w-az-ped-oral-susp` | INTEGER |
| Population treated for trachoma with Azithromycin Tablets | `ntd-population-treated-for-trachoma-with-az-tablet` | INTEGER |
| Population treated for trachoma with Azythromycin Eye Drops | `ntd-population-treated-for-trachoma-with-az-eye-dr` | INTEGER |
| Population treated for trachoma with tetracycline eye ointment | `pcn-pop-trt-tr-teo` | INTEGER |
| Population treated for trachoma with zithromax syrup | `pcn-pop-trt-tr-zsyrup` | INTEGER |
| Trachoma - MDA round number | `ntd-trachoma-mda-round-number` | INTEGER_ZERO_OR_POSITIVE |
| Trachoma - Severe adverse events | `pcn-sae-tt` | INTEGER_ZERO_OR_POSITIVE |
| Trachoma - Severe adverse events referred | `pcn-sae-referred-tt` | INTEGER_ZERO_OR_POSITIVE |