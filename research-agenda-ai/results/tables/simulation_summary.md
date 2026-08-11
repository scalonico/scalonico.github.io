# Baseline Simulation Results

## Prediction and policy value

| Risk–benefit relation | Score noise SD | AUC | Brier score | Policy gain per 100 patients | Mean benefit among eligible |
|---|---:|---:|---:|---:|---:|
| Aligned | 2.00 | 0.599 | 0.219 | 1.867 | 0.110 |
| Aligned | 1.25 | 0.639 | 0.181 | 1.985 | 0.115 |
| Aligned | 0.75 | 0.679 | 0.162 | 2.098 | 0.120 |
| Aligned | 0.25 | 0.717 | 0.151 | 2.212 | 0.125 |
| Misaligned | 2.00 | 0.601 | 0.218 | 1.182 | 0.079 |
| Misaligned | 1.25 | 0.641 | 0.180 | 1.147 | 0.077 |
| Misaligned | 0.75 | 0.681 | 0.161 | 1.092 | 0.074 |
| Misaligned | 0.25 | 0.720 | 0.150 | 0.998 | 0.070 |

Lower score noise improves prediction. When untreated risk and treatment benefit are aligned, policy value rises with AUC. When they are misaligned, the same predictive improvement lowers policy value because eligibility concentrates on people with smaller treatment benefits.

## Regression-discontinuity diagnostic

The diagnostic uses the aligned, lowest-noise scenario.

| Estimand | Estimate | Standard error |
|---|---:|---:|
| Eligibility effect on human action | 0.552 | 0.010 |
| Eligibility effect on adverse events | -0.066 | 0.009 |
| Fuzzy-RD effect of action on adverse events | -0.120 | 0.017 |

The outcome is adverse, so negative estimates indicate improvement. The fuzzy-RD ratio has a treatment-effect interpretation here because the simulation imposes exclusion and monotone compliance; the project will not assume either condition automatically in the UC Davis application.
