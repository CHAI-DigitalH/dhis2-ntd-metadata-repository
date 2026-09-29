# Indicators

This document is the single source of truth for indicator logic in the SL NTD Metadata Repository. It covers how each indicator is calculated, which diseases it applies to, and what it means for interpretation. Anyone editing dashboards, building new visualizations, or adapting this repository for another country should refer here before touching indicator formulas.

## Scope

This repository currently has indicators built for **four PC-NTDs**: Lymphatic Filariasis (LF), Onchocerciasis (Oncho), Schistosomiasis (SCH), and Soil-Transmitted Helminths (STH). These four diseases share an identical Mass Drug Administration (MDA) reporting model, so their indicator structure is fully parallel — the same three indicators exist per disease, built from the same formula pattern.

**Trachoma has no indicators in this instance.** Trachoma's metrics (TF prevalence, TT prevalence, treatment counts) are stored as raw data elements and visualized directly, without an indicator layer. This is intentional — see [Why Trachoma has no indicators](#why-trachoma-has-no-indicators) below.

## Indicator type

Every indicator in this repository uses the DHIS2 **Numeric** indicator type (UID `MxGHzKaiBSP`), with a factor of 1. This is the only indicator type present in the instance. Rate/percentage indicators are built by multiplying the numerator by 100 directly in the formula (e.g. `100*#{dataElement}`) rather than using a dedicated Percentage indicator type. This was a deliberate convention decision early in the build — if you create new indicators, follow the same pattern (`100 * numerator`, denominator without the 100 factor) for consistency.

## Core indicator set (LF / Oncho / SCH / STH)

Each of the four PC-NTDs has exactly three core indicators. The formulas below use LF as the reference; the pattern is identical for Oncho, SCH, and STH with the corresponding disease's data elements substituted.

### Coverage Rate (%)

Proportion of the targeted population that received treatment.

```
Numerator:   100 * #{population treated}
Denominator: #{population targeted for treatment}
```

| Disease | Indicator name | Numerator DE | Denominator DE |
|---|---|---|---|
| LF | `LF - Coverage Rate (%)` | Population treated for LF | Population targeted for LF treatment |
| Oncho | `Oncho - Coverage Rate (%)` | Population treated for Oncho round 1 | Population targeted for oncho treatment |
| SCH | `SCH - Coverage Rate (%)` | Population treated for SCH | Population targeted for SCH treatment |
| STH | `STH - Coverage Rate (%)` | Population treated for STH round 1 | Population targeted for STH and SCH treatment |

**Interpretation:** WHO's therapeutic coverage target for PC-NTD MDA is **80%**. Values above 100% indicate either over-treatment (more people treated than the targeted population estimate) or — more commonly in this dataset — a stale/undersized population denominator that hasn't been updated to reflect actual treatment volume. Always cross-check denominator population data before interpreting coverage above 100% as a true over-treatment finding.

### Refusal Rate (%)

Proportion of the targeted population that actively refused treatment.

```
Numerator:   100 * #{population not treated}
Denominator: #{population targeted for treatment}
```

| Disease | Indicator name | Numerator DE | Denominator DE |
|---|---|---|---|
| LF | `LF - Refusal Rate (%)` | Population not treated - LF | Population targeted for LF treatment |
| Oncho | `Oncho - Refusal Rate (%)` | Population not treated - oncho | Population targeted for oncho treatment |
| SCH | `SCH - Refusal Rate (%)` | Population not treated - SCH | Population targeted for SCH treatment |
| STH | `STH - Refusal Rate (%)` | Population not treated - STH | Population targeted for STH and SCH treatment |

**Interpretation:** This is not strictly "refusal" in the survey-response sense — the underlying data element captures everyone in the targeted population who did not receive treatment, for any reason (refusal, absence, contraindication). Rates above 10% typically warrant a community engagement review. Sustained high refusal in specific districts often signals trust or messaging issues rather than logistics.

### Coverage Gap (%)

The percentage-point gap between targeted population and treated population, expressed against the target.

```
Numerator:   100 * (#{population targeted} - #{population treated})
Denominator: #{population targeted for treatment}
```

| Disease | Indicator name | Numerator DEs | Denominator DE |
|---|---|---|---|
| LF | `LF - Coverage Gap (%)` | Population targeted for LF treatment − Population treated for LF | Population targeted for LF treatment |
| Oncho | `Oncho - Coverage Gap (%)` | Population targeted for oncho treatment − Population treated for Oncho round 1 | Population targeted for oncho treatment |
| SCH | `SCH - Coverage Gap (%)` | Population targeted for SCH treatment − Population treated for SCH | Population targeted for SCH treatment |
| STH | `STH - Coverage Gap (%)` | Population targeted for STH and SCH treatment − Population treated for STH round 1 | Population targeted for STH and SCH treatment |

**Interpretation:** Coverage Gap and Coverage Rate are mathematically complementary (`Gap ≈ 100 − Rate`, modulo rounding) when treated population doesn't exceed targeted population. When Coverage Rate exceeds 100%, Coverage Gap goes negative — this is a useful data-quality signal, since a negative gap visually flags the denominator problem described above more clearly than a rate alone. **Dashboard 1 (National) intentionally keeps only the Coverage Gap chart and drops the separate Coverage Rate chart**, since the two convey the same information and Gap surfaces data quality issues more visibly.

## Cross-cutting indicator

### NTD - Overall Coverage Rate (%)

A single indicator summing treated and targeted population across all four PC-NTDs, giving one blended national coverage figure.

```
Numerator:   100 * (LF treated + Oncho treated + SCH treated + STH treated)
Denominator: LF targeted + Oncho targeted + SCH targeted + STH targeted
```

ID: `JDickiHSkPd`

**Interpretation:** Useful as a single top-line KPI for executive dashboards, but masks disease-specific performance — a strong LF programme can offset a weak SCH programme in this blended figure. Always pair with the per-disease Coverage Rate/Gap charts, never present this number alone.

## Why Trachoma has no indicators

Trachoma uses the WHO **SAFE strategy** (Surgery, Antibiotics, Facial cleanliness, Environmental improvement), which is structurally different from the MDA-coverage model shared by the four PC-NTDs:

- Trachoma's core elimination metrics — **TF prevalence (%)** and **TT prevalence (%)** — are captured directly as percentage values from population-based prevalence surveys (surveillance and impact surveys), not derived from a treated/targeted ratio. There is nothing to calculate; the survey result *is* the metric.
- Trachoma treatment data is split across five drug types (tablets, pediatric suspension, eye drops, eye ointment, syrup) rather than one treated-population figure, making a single "Coverage Rate" indicator less meaningful without first deciding how to weight drug types.
- Trichiasis (TT) management data (epilation, surgery, other) are absolute case counts tracked for programme monitoring, not rates against a population denominator.

If a future phase adds a Trachoma coverage indicator, follow the same Numeric-type, `100 * numerator / denominator` convention used for the four PC-NTDs, using `Population treated for trachoma with Azithromycin Tablets` as the numerator and an appropriate targeted-population data element as denominator. As of this writing no targeted-population data element exists for Trachoma in this instance — see [data-sources.md](./data-sources.md) for what would need to be added.

## Indicators in the instance not yet visualized

The instance contains a substantially larger indicator set than what's currently built into dashboards. These were identified during the indicator audit and are documented here so adopting countries know they exist, even though they are not yet wired into any visualization in this repository:

**Drug logistics, per commodity** (ALB, AZ Tablets, AZ Eye Drops, AZ POS, IVM, MBD, PZQ, TEO):
- `(C) Quantity available for current MDA - {commodity}` — sum of carried-over stock, newly received stock, and donated stock
- `(G) Theoretical Balance - {commodity}` — quantity available minus all outflows (distributed, lost, wasted, expired)
- `(I) Gap - {commodity}` — theoretical balance minus actual counted stock; a non-zero gap flags inventory data-quality issues (miscounting, undocumented loss, pilferage)

These are more granular than the disease-level drug management charts currently built (which use raw received/provided/wasted data elements directly). They would be useful for a dedicated drug audit or supply-chain quality dashboard, but were judged too granular for the general-purpose dashboards in this proof of concept.

**JRSM procurement indicators** — independently recalculate procurement need from population and stock data (e.g. `JRSM- Total IVM to be procured`, `JRSM- Total PZQ to be procured`, `JRSM- ALB tablets to be procured (LF)`). These differ from the `JRSM - Tablets to be procured` data elements used in the Drug Management & Programme Planning dashboard, which reflect what was manually entered on the JRSM form. Charting the indicator-calculated figure next to the manually-entered figure would serve as a procurement data-quality check — flagging discrepancies between what the form says and what the underlying population/stock data implies.

**Population demographic breakdowns** — a full age/sex pyramid (< 6 months, 6 months–7 years, 7–15 years, Pre-SAC, SAC, Adult, ≥15 years, Women of Reproductive Age) computed from one population data element and a set of percentage-split data elements, each available by sex and combined. These are disease-agnostic and would support a general "Target Population Demographics" dashboard module, independent of any single NTD programme.

**STH Round 1 / Round 2 combined indicators** (`Total treated for STH Round 1`, `Total treated for STH Round 2`, `Total NOT treated for STH`, `Total adverse events for STH`) — each sums two underlying data elements. **If you build or modify STH dashboards, verify whether the current STH visualizations pull from both underlying data elements or only one** — using only one would under-count actuals against these indicators.

**TT Surgery targeting** (`TT- Number of Persons Targeted for TT Surgery`) — sums two category option combinations. Candidate addition to the Trachoma TT Management module alongside backlog and managed-case charts.

## Conventions for adding new indicators

If you extend this repository with new indicators:

1. Use the **Numeric** indicator type (`MxGHzKaiBSP`) for consistency — do not introduce the Percentage type even though DHIS2 offers it.
2. For rate/percentage indicators, multiply the numerator by 100 and leave the denominator as a plain count — do not divide by 100 in the denominator.
3. Name indicators with the pattern `{Disease} - {Metric} (%)` for rates, or a plain descriptive name with no disease prefix for cross-cutting indicators (see `NTD - Overall Coverage Rate (%)`).
4. Document the new indicator in this file, in the same table format used above, before using it in a dashboard.
5. If the new indicator is disease-specific and you intend it to exist for all four PC-NTDs (LF/Oncho/SCH/STH) in parallel, build it for one disease first, confirm the formula against real data, then replicate to the other three using the same UID-swap approach used for dashboard replication — see [setup.md](./setup.md).
