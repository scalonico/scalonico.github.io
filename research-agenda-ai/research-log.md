# Research Decision Log

## 2026-08-10 — Agenda selection

### Decision

Center the agenda on the causal evaluation of AI-assisted decisions rather than foundational model development or generic AI regulation.

### Reason

The agenda extends existing strengths in causal inference, regression discontinuity, heterogeneous treatment effects, health policy, multiple testing, and statistical software.

### Working umbrella title

**From Prediction to Policy: Causal Evaluation of AI-Assisted Decisions**

## 2026-08-10 — Baseline unit of analysis

### Decision

Model a fixed AI score, an operational threshold, a binary recommendation, human action, and downstream outcomes.

### Reason

This is the smallest model that distinguishes prediction, recommendation, behavior, treatment, and outcomes. It maps directly to operational data and an RD design.

## 2026-08-10 — Primary estimand

### Decision

Use the local intention-to-treat effect of algorithmic eligibility as the primary estimand. Treat the fuzzy-RD treatment effect as secondary.

### Reason

Recommendations often trigger multiple actions. A single-treatment exclusion restriction may not be credible, while the total effect of the decision system remains policy-relevant.

## 2026-08-10 — Welfare interpretation

### Decision

Interpret the local effect at the cutoff as the marginal welfare value of expanding eligibility, after incorporating resource costs and preserving treatment intensity.

### Reason

This connects econometric identification to the institution's operational cutoff and capacity decision.

## 2026-08-10 — Empirical priority

### Decision

Prioritize UC Davis Health's BE-FAIR population-health model for feasibility assessment.

### Reason

The system combines a continuous risk score, a capacity-driven threshold, human review, care-management decisions, utilization outcomes, and explicit equity objectives. Institutional proximity improves the likelihood of a productive feasibility conversation.

## 2026-08-10 — Open methodological choice

The baseline fuzzy RD is not a sufficient methodological contribution. Select one primary extension after the data workflow is understood:

1. Generated or learned running variables.
2. Model and cutoff updates over time.
3. Capacity-constrained eligibility and interference.
4. Group-specific cutoffs and causal equity.
5. Sequential causal monitoring.

The selection criterion is the intersection of theoretical novelty, operational importance, and observable data.

## Next actions

1. Produce an aggregate data-feasibility request for the BE-FAIR team.
2. Draft a one-page concept note for an internal conversation.
3. Build the baseline simulation described in `model.md`.
4. Complete the targeted literature search on generated running variables and treatment-benefit targeting.
5. Decide whether the first paper is primarily econometric methods, applied health economics, or a paired methods-and-application project.

## 2026-08-11 — Documentation milestone

### Completed

- Recorded the baseline model and five propositions with proof sketches.
- Separated the total recommendation effect from the treatment LATE.
- Documented the marginal-welfare interpretation and its resource-preservation condition.
- Created a candidate-data matrix and go/no-go criteria.
- Added a short concept note and an aggregate feasibility request.

### Next decision point

Determine whether the BE-FAIR workflow retains scores and recommendation exposure for patients below and above the operational threshold. This fact determines whether the proposed RD design is empirically viable.

## 2026-08-11 — UC Davis data availability audit

### Findings

- No public patient-level BE-FAIR dataset or code repository was found.
- The public supplementary appendix contains definitions and model-performance results, but not score histories, recommendation logs, outreach records, or enrollment outcomes.
- UC Davis Health provides a de-identified OMOP environment, DataPATH, for cohort exploration without IRB approval and an identified-EHR route after IRB approval.
- UC Davis Health also maintains Clarity and Caboodle for granular operational and workflow data, plus a Data Provisioning Core for curated clinical, financial, and operational extracts.
- Therefore, the feature and outcome data appear obtainable internally in principle. Availability of the causal-design variables remains unverified.

### Decision

Do not begin with a generic DataPATH request. First ask the BE-FAIR operational and technical owners whether the system retained, for every scoring cycle and for patients on both sides of the cutoff:

1. Raw predicted probabilities and percentile ranks.
2. Model version, scoring time, and applicable cutoff.
3. Eligibility flags and work-queue or registry exposure.
4. Chart review, outreach, contact, enrollment, and treatment intensity.

If those objects exist, use DataPATH to prototype the cohort and outcomes, then pursue an IRB-approved link to the identified and operational data. If below-cutoff scores do not exist, shift to an alternative design based on rollout timing, model-version changes, capacity shocks, or a prospective intervention.
