# Simulation Replication Guide

## Purpose

`simulate_baseline.py` creates the synthetic results used to discipline the model. It is not an analysis of UC Davis Health records.

The simulation varies:

- Accuracy of the AI score for untreated adverse events.
- Alignment between untreated risk and treatment benefit.
- Human compliance with algorithmic eligibility.
- A capacity-based eligibility threshold.

It reports predictive AUC and Brier score, policy value, local eligibility effects, and the fuzzy-RD ratio under a data-generating process in which exclusion and monotonicity hold.

## Requirements

- Python 3.10 or newer.
- NumPy 2.0 or newer.

No external data or network connection is required.

## Run

From the `research-agenda-ai` directory:

```bash
python3 code/simulate_baseline.py
```

The script uses seed `20260811` and writes deterministic outputs to:

- `results/tables/simulation_summary.csv`
- `results/tables/rd_estimates.csv`
- `results/tables/rd_binned_means.csv`
- `results/tables/simulation_summary.md`
- `results/figures/prediction_policy_tradeoff.svg`
- `results/figures/rd_diagnostics.svg`

## Interpretation

The central comparison holds the treatment technology fixed while changing risk-score accuracy. When risk and treatment benefit are aligned, predictive improvement raises policy value. When they are negatively related, predictive improvement can lower policy value. This is a targeting result, not evidence that inaccurate prediction is generally desirable.

The RD diagnostic uses a percentile running variable centered at the 60th-percentile cutoff. The outcome is an adverse event, so negative effects represent health improvements. The fuzzy-RD estimate has a treatment-effect interpretation only because this simulation imposes exclusion and monotone compliance.

## Computational requirements

The default run simulates 200,000 observations for each of two risk–benefit relationships. Expected runtime is under one minute on a modern laptop, with less than 1 GB of memory.
