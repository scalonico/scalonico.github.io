# Evaluation at Learned Policy Boundaries

## 1. Central contribution

The first methods paper should develop inference for causal effects at decision boundaries produced by estimated algorithms. A conventional RD analysis conditions on the observed running variable and cutoff. An AI deployment adds a prior source of randomness: a training sample selects the score function and therefore determines which people lie at the policy margin.

The paper's central claim is:

> Standard RD inference can identify the effect at the boundary created by a fixed deployed model, but it does not automatically quantify uncertainty about the boundary created by model training, retraining, or reconstruction.

This distinction is relevant when institutions update models, researchers compare candidate algorithms, or the observed score must be reconstructed from EHR features.

## 2. Start with one patient

Consider two patients with the same true untreated risk but different treatment benefits. A risk model may rank the patient with the smaller benefit above the operational cutoff. The resulting RD can still identify the causal effect of eligibility at the model's actual margin. It does not identify the effect at an oracle risk boundary, nor does it show that risk-based eligibility maximizes health gains.

The model must therefore distinguish three objects:

1. **The deployed score:** the value that actually generated eligibility.
2. **The oracle risk index:** expected untreated risk given patient information.
3. **The net-benefit index:** expected treatment benefit minus resource cost.

Only the first object defines the observed quasi-experiment. The third object defines optimal targeting under a capacity constraint.

## 3. Two samples and a learned boundary

Let \(\mathcal T\) denote the training sample and \(\mathcal E\) the evaluation sample. Training produces

\[
S_i(\mathcal T)=g(X_i;\widehat\eta_{\mathcal T}).
\]

The institution assigns eligibility according to

\[
Z_i(\mathcal T)=\mathbf 1\{S_i(\mathcal T)\geq c(\mathcal T)\}.
\]

The cutoff may be fixed in score units or selected to treat a capacity-constrained share of the population. For example, a 60th-percentile rule sets

\[
c(\mathcal T,\mathcal P)
=Q_{0.60}\{S_i(\mathcal T):i\in\mathcal P\},
\]

where \(\mathcal P\) is the population scored in an operational cycle.

Conditional on the realized training sample and decision rule, define the deployed-boundary effect

\[
\tau_{\mathcal T}
=E[Y_i^1-Y_i^0\mid S_i(\mathcal T)=c(\mathcal T),\mathcal T].
\]

This is the effect for people made marginal by the model that the institution actually deployed.

## 4. Three targets of inference

### 4.1 Conditional deployment effect

The first target is \(\tau_{\mathcal T}\). If the model was trained before evaluation, remains frozen, and the evaluation sample is independent of training, local-polynomial RD methods can condition on the realized scoring rule. This target answers the operational question: what did eligibility do at this deployed model's cutoff?

### 4.2 Algorithm-averaged boundary effect

The second target averages over training samples or model updates:

\[
\bar\tau=E_{\mathcal T}[\tau_{\mathcal T}].
\]

This target answers a different question: what effect would the model-development procedure generate across plausible retrainings? It matters when model instability changes the identity and causal responsiveness of marginal patients.

The law of total variance separates the two sources of uncertainty:

\[
\operatorname{Var}(\widehat\tau)
=E_{\mathcal T}[\operatorname{Var}(\widehat\tau\mid\mathcal T)]
+\operatorname{Var}_{\mathcal T}(E[\widehat\tau\mid\mathcal T]).
\]

Ordinary conditional RD inference targets the first component. Inference for \(\bar\tau\) must also account for training-induced movement in the boundary effect.

### 4.3 Policy value relative to an oracle target

The third target compares risk-based allocation with net-benefit targeting. Let

\[
r(x)=E[A_i(0)\mid X_i=x]
\]

denote untreated adverse-event risk and

\[
n(x)=E[A_i(0)-A_i(1)-C_i(1)+C_i(0)\mid X_i=x]
\]

denote net treatment benefit. Ranking by \(r(x)\) is optimal only when it selects the same patients as ranking by \(n(x)\). Predictive AUC and causal policy value can therefore move in opposite directions.

## 5. Baseline identification result

### Result 1: Conditional validity

Suppose:

1. The training and evaluation samples are independent.
2. The deployed score function and cutoff are frozen during evaluation.
3. Conditional potential-outcome means are continuous in the deployed score at its realized cutoff.
4. The score density is positive and continuous at that cutoff.

Then, conditional on \(\mathcal T\), the outcome discontinuity identifies \(\tau_{\mathcal T}\).

This result clarifies what standard RD already delivers. It is the benchmark, not the methodological contribution.

## 6. Where new methods are needed

### 6.1 Training-induced boundary uncertainty

Repeated training changes both the numerical boundary and the composition of patients near it. A nested procedure can resample the training stage, rebuild the score, and estimate the conditional RD effect in an independent evaluation draw. Theoretical work must establish when this bootstrap consistently estimates both variance components.

### 6.2 Overlapping training and evaluation samples

When the same observations help train the score and estimate the boundary effect, conditioning on the fitted score is insufficient. Sample splitting provides a clean baseline. Cross-fitting may recover efficiency, but folds define different score functions and therefore different local margins. The estimand must be stated before combining fold-specific effects.

### 6.3 Reconstructed rather than logged scores

Let the score observed by the researcher be

\[
\widetilde S_i=S_i+U_i.
\]

Eligibility remains discontinuous in \(S_i\), not generally in \(\widetilde S_i\). Even classical reconstruction error can smooth the first stage around the apparent cutoff. The application should use the logged deployment score whenever possible. If only reconstructed scores exist, the project needs validation data or a measurement-error design.

### 6.4 Capacity-defined percentile cutoffs

A percentile rule makes the cutoff a function of every score in the operational cohort. With one large, fixed scoring cohort, quantile estimation may be asymptotically smaller than local-polynomial smoothing error. Repeated monthly cohorts create correlated, time-varying cutoffs and potentially changing treatment intensity. The first empirical task is to learn whether “60” is a fixed score, a within-cycle rank, or a display convention.

## 7. Proposed estimator sequence

1. Estimate the conditional deployed-boundary effect using bias-corrected local-polynomial RD.
2. Record the training sample, model version, scoring cohort, and cutoff as separate sources of variation.
3. For a frozen model, report conditional inference as the primary operational result.
4. For retrained models, use sample splitting and estimate version-specific local effects on a common policy scale.
5. Develop a nested resampling or influence-function procedure for the algorithm-averaged effect.
6. Report the recommendation effect as primary; report a fuzzy-RD treatment effect only when exclusion and monotonicity are credible.

## 8. Simulation predictions

The baseline simulation should establish four facts:

1. Standard local-linear RD recovers the eligibility effect when the logged score is fixed.
2. The outcome discontinuity shrinks when human compliance weakens.
3. Better risk prediction raises policy value when risk and treatment benefit are aligned.
4. Better risk prediction can lower policy value when high-risk patients have smaller treatment benefits.

The next simulation version should add repeated training samples. It will compare conditional RD confidence intervals with intervals that incorporate boundary instability.

## 9. Empirical requirements

The UC Davis application needs the deployed score—not merely the input features used to recreate it. For every scoring cycle, the minimum records are:

- Patient identifier and scoring timestamp.
- Raw predicted probability and percentile rank.
- Model version and applicable cutoff.
- Eligibility flag and evidence that the recommendation entered the work queue.
- Human review, outreach, contact, enrollment, and service intensity.
- Commonly defined outcomes on both sides of the cutoff.

These fields map the methodological parameter to the decision system the institution actually used.

## 10. Paper positioning

The methods paper is not “RD applied to AI.” It studies how model training determines the policy boundary at which causal effects are identified. The application then shows why this distinction matters: a model can predict utilization accurately while targeting patients with low marginal benefit, and human review can further change the policy induced by the score.

The clean working title is:

> **Causal Effects at Learned Policy Boundaries**

The title names the object rather than the estimator and remains applicable outside health care.
