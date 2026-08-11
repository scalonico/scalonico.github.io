# Aggregate Data Feasibility Request

## Purpose

This document specifies the minimum aggregate information needed to determine whether an algorithmic-threshold design is feasible. It is not a request for patient-level records.

## 1. Decision-system documentation

Please document:

1. Model name and prediction target.
2. Score scale: probability, percentile, integer score, or category.
3. Population scored and scoring frequency.
4. Model training dates and version history.
5. Operational cutoff and dates on which it changed.
6. Exclusion rules applied before or after scoring.
7. Whether the recommendation enters a registry, dashboard, message, or work queue.
8. Human-review and override procedures.
9. Other pathways through which patients enter the same program.
10. Staff-capacity rules used to set the cutoff.
11. Whether “60” denotes a percentile rank recalculated within each scoring population, a fixed score threshold, or another operational convention.
12. Whether records exist for patients below the cutoff or only for patients placed on the outreach list.

## 2. Aggregate table A: score support

For each month and model version, report counts in narrow score or percentile bins around the cutoff.

| Month | Model version | Score bin relative to cutoff | Number scored | Number eligible | Number displayed or queued |
|---|---|---:|---:|---:|---:|
| | | | | | |

Preferred bin widths are one percentile point or a comparably narrow interval on the raw-score scale. If disclosure rules require wider bins, report the narrowest permissible interval.

## 3. Aggregate table B: behavioral first stages

For the same bins, report the proportion experiencing each workflow step.

| Score bin relative to cutoff | Reviewed | Override | Outreach attempted | Successfully contacted | Enrolled | Received service |
|---|---:|---:|---:|---:|---:|---:|
| | | | | | | |

This table determines whether the cutoff creates a discontinuity in actual decisions.

## 4. Aggregate table C: outcome availability

Report whether the following outcomes are available, the observation window, and approximate missingness.

| Outcome | Definition | Follow-up window | Coverage dates | Approximate missingness |
|---|---|---|---|---:|
| ED visits | | | | |
| Unplanned hospitalizations | | | | |
| Mortality | | | | |
| Outpatient use | | | | |
| Program completion | | | | |
| Health-system cost | | | | |
| Patient-reported outcome | | | | |

## 5. Aggregate table D: capacity and treatment intensity

| Month | Eligible patients | Staff FTE | Active caseload | Outreach attempts | Mean contacts per enrollee | Mean program duration |
|---|---:|---:|---:|---:|---:|---:|
| | | | | | | |

This table is needed because expanding eligibility can dilute services if staffing does not increase.

## 6. Diagnostics around the cutoff

If feasible, produce four exploratory plots without covariate adjustment:

1. Number of scored patients by distance from the cutoff.
2. Probability of review by distance from the cutoff.
3. Probability of outreach and enrollment by distance from the cutoff.
4. Mean baseline covariates by distance from the cutoff.

These are feasibility diagnostics, not final causal estimates.

## 7. Governance questions

1. Which committee owns approval for analysis of the model and recommendation logs?
2. Is an existing IRB protocol or quality-improvement determination relevant?
3. Where can linked data be analyzed securely?
4. Which aggregate results may leave the secure environment?
5. Are clinician or staff identifiers available in deidentified form?
6. What review is required before communicating potentially adverse findings?

## 8. Decision rule

The design is promising if the score has support on both sides of a known threshold and at least one human action changes discontinuously at that threshold. If those conditions fail, alternative designs include model-version rollouts, phased implementation, randomized encouragement, or prospective threshold randomization.

## 9. Recommended request sequence

Before requesting a standard EHR extract, hold a short feasibility conversation with the population-health program owner and the technical owner of the model. The purpose is to identify whether the score and workflow objects exist and where they are stored. If confirmed, request aggregate score-bin and action-rate tables first; then use DataPATH for cohort and outcome prototyping and pursue the required approvals for linkage to identified and operational records.
