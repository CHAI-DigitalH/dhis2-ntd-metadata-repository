# Contributing

This repository is a proof-of-concept Digital Public Good, developed by CHAI Digital Health with Sierra Leone's NTD programme as the model implementation. It is intended to grow through real-world adoption and feedback from other NTD programmes, DHIS2 implementers, and the broader CHAI/WHO/HISP community.

## Before you contribute

Read [README.md](../README.md), [setup.md](./setup.md), and [adaptation.md](./adaptation.md) first. Most issues you might want to raise are already addressed in one of these — in particular, **the DHIS2 visualization API limitation documented in setup.md is a platform constraint, not a bug in this repository**, and issues filed expecting a programmatic fix to that will be closed with a pointer back to that section.

## How to report a problem

Open an issue describing:

1. What you were trying to do (e.g. "adapting this repository for [country]," "importing the metadata package," "interpreting an indicator")
2. What happened versus what you expected
3. Which document you were following, if any, and at which step it diverged from reality
4. Your DHIS2 version, if the issue is import or visualization-related

Issues that turn out to be "the documentation didn't anticipate this" are exactly as valuable as issues that are "something is factually wrong" — this repository has only been validated by its original builder against one country (Sierra Leone), so gaps in [adaptation.md](./adaptation.md) specifically are expected and reporting them is genuinely useful, not a sign you did something wrong.

## How to propose a change

**Documentation changes** (the four docs in `/docs`, this file, the README): open a pull request directly. Keep the existing structure and tone — these documents are written to be honest about limitations rather than aspirational, and new content should match that.

**New indicators or visualizations**: follow the conventions in [indicators.md](./indicators.md) (Numeric indicator type, `100 * numerator` pattern for rates) before proposing. Since visualizations cannot be created via metadata import (see [setup.md](./setup.md)), any new visualization needs to be built manually in Data Visualizer on a real instance, exported, and the exported JSON included in your contribution — not just described.

**New disease coverage** (beyond the five currently in this repository): this is a substantial addition. Open an issue first to discuss scope before building, since the existing four-PC-NTD pattern (Coverage Rate/Refusal Rate/Coverage Gap) may not transfer cleanly — see [indicators.md](./indicators.md)'s explanation of why Trachoma doesn't follow that pattern, as a worked example of when it doesn't.

**Tooling** (the ESPEN Connector app, the validation script, future additions): standard pull request process. Tooling changes should update the relevant README/addendum documentation in the same PR, not as a follow-up — this repository has already accumulated enough cases where code and docs drifted apart mid-build, and new contributions should not add to that.

## Adopting countries: please report back

If you adapt this repository for your country, even partially, please open an issue or discussion describing what you changed and what you encountered, win or lose. This repository's [adaptation.md](./adaptation.md) was written from a single implementation and has not been validated by a second adopter — your experience is the single most useful contribution you can make right now, more useful than a code change.

## Governance

**[Placeholder — pending finalization alongside the license decision in README.md.]** Until a maintaining organization or working group is formally established, treat the CHAI Digital Health NTD team as the de facto point of contact via this repository's issue tracker.

## Code of conduct

Engage in good faith, assume good intent, and remember this tooling supports real public health programmes — disagreements about technical approach should stay focused on what serves NTD elimination programmes best, not on the contributors.
