# Data Strategy

## 1. Minimum viable empirical setting

An empirical setting is viable only if it links four layers:

1. **Algorithm:** raw score, model version, cutoff, and recommendation timestamp.
2. **Human response:** review, override, outreach, referral, enrollment, or treatment.
3. **Resources:** staffing, caseload, treatment intensity, and operational constraints.
4. **Outcomes:** health, utilization, costs, behavior, and prespecified equity measures.

A dataset containing only features and predicted outcomes can benchmark a model but cannot estimate the causal effect of deployment.

## 2. Candidate settings

| Setting | Decision structure | Outcomes | Access | Current priority |
|---|---|---|---|---|
| UC Davis Health BE-FAIR | Risk-percentile threshold followed by human review and care-management outreach | ED visits, hospitalizations, utilization, potentially costs | Internal partnership and governance approval | 1 |
| VA REACH VET | Top 0.1% predicted-risk threshold followed by dashboard review and outreach | Mortality, suicide-related outcomes, visits, care processes | Restricted VA environment | 2 |
| Allegheny Family Screening Tool | Risk score, mandatory screen-in at high levels, human discretion elsewhere | Investigation, placement, service use, child-welfare outcomes | County partnership; highly sensitive | 3 |
| UCLA population-risk model | AI-based targeting with stepped-wedge care-management rollout | Preventable admissions and ED visits | Published analysis; new collaboration required | 4 |
| MIMIC-IV-Ext CDS | LLM-supported triage, referral, and diagnosis benchmark | Recorded clinical decisions and diagnoses | Public credentialed access | Pilot only |

## 3. Leading option: UC Davis Health BE-FAIR

### Known institutional features

The published retrospective cohort contains 114,311 primary-care or payer-attributed patients. The model predicts future emergency-department visits and unplanned hospitalizations. Patients at or above a risk-percentile threshold are identified for human review and possible enrollment in care management. The published paper reports a 60th-percentile threshold motivated by outreach capacity.

The model was built from EHR and claims data, selected 31 features from 215 candidates, and produced predicted probabilities of hospitalization or ED use over the next 12 months. The published evaluation uses baseline data from September 30, 2020 through October 1, 2021 and outcomes through October 1, 2022. The implementation description confirms a registry-based workflow, clinician-guided review, outreach, needs assessment, and care-management enrollment rather than automatic treatment assignment.

### Availability assessment (verified August 11, 2026)

| Data component | Publicly available? | Likely available inside UC Davis Health? | Assessment |
|---|---:|---:|---|
| Article and model documentation | Yes | Yes | The article and a 16-page supplementary appendix are downloadable. |
| Patient-level model-development data | No public release found | Yes, subject to approval | The paper states that the analysis used UCDH EHR and claims data. |
| Model features and 12-month utilization outcomes | No public release found | Likely | Standard EHR and claims elements should be accessible through UCDH research data services. |
| Raw predicted score or percentile for every scoring event | No | Unknown | Must be confirmed with the model owner or Data Center of Excellence. |
| Model version, score timestamp, and active cutoff | No | Unknown | Essential for defining the running variable and treatment rule. |
| Registry or work-queue exposure | No | Plausible but unconfirmed | More likely to reside in operational Epic, registry, or population-health tables than in standardized OMOP. |
| Chart review, outreach attempts, contact, and enrollment | No | Plausible but unconfirmed | Workflow records may exist in Clarity, Caboodle, a registry, or a program-specific system. |
| Staffing, caseload, and treatment intensity | No | Unknown | May require operational records maintained outside the core EHR. |

**Bottom line:** the data are not available as a public research dataset. A UC Davis Health pathway exists for obtaining the EHR and outcome layer, but empirical feasibility remains conditional on retention and linkage of the score and workflow layers. The single decisive question is whether scores were saved for patients on both sides of the 60th-percentile cutoff. If only the selected list was retained, the proposed regression-discontinuity design is not feasible in its current form.

### What the public supplement contains

The supplementary appendix provides metric definitions, feature definitions, calibration regressions, performance tables, and one figure. It identifies candidate covariates including age, insurance/ACO status, diagnoses, medications, laboratory values, prior utilization, cardiology and pulmonology encounters, HPI, and ADI. It does **not** contain patient-level records, score histories, workflow actions, outcomes after outreach, analytic code, or a repository link.

### Internal access route

UC Davis Health documents two complementary data routes:

1. **DataPATH for cohort and outcome prototyping.** DataPATH is a legally de-identified OMOP extract available to UC Davis Health system researchers in a secure environment without IRB approval. Code developed there can, after IRB approval, be run against identified EHR data. This is the natural route for testing cohort definitions, features, and utilization outcomes.
2. **Clarity, Caboodle, or a curated extract for operational workflow data.** UC Davis describes Clarity as granular and tightly coupled to EHR operations and workflows, and Caboodle as suited to operational analysis. The Data Provisioning Core can curate project-specific assets spanning clinical, financial, and operational data.

DataPATH alone should not be assumed to contain the BE-FAIR score, model version, recommendation display, registry entry, or outreach history. The efficient sequence is therefore to confirm the existence and storage location of these fields with the BE-FAIR team before submitting a generic data request.

### Recommended first contacts and sequence

The public author affiliations suggest beginning with the operational and technical owners rather than with a general warehouse request:

1. **Reshma Gupta / Office of Population Health and Accountable Care:** program ownership, threshold policy, and outreach workflow.
2. **Jason Adams / IT Data Center of Excellence:** score generation, model versions, and storage or logging architecture.
3. **Jeffrey Hoch / Center for Healthcare Policy and Research:** health-economics collaboration and navigation of the internal research process.
4. If the data objects exist, request a consultation through **DataCOE@ucdavis.edu** or the Data Provisioning Core and develop the IRB and data-extract plan.

Because some access mechanisms are explicitly limited to UC Davis Health personnel, a campus-based investigator may need a UC Davis Health collaborator or local project champion. This is an inference from the public access descriptions and should be confirmed during the initial consultation.

### Source links

- BE-FAIR article: <https://link.springer.com/article/10.1007/s11606-025-09462-1>
- Public supplementary appendix: <https://media.springernature.com/original/springer-static/esm/art%3A10.1007%2Fs11606-025-09462-1/MediaObjects/11606_2025_9462_MOESM1_ESM.docx>
- UC Davis Health clinical data sources: <https://health.ucdavis.edu/data/sources.html>
- UC Davis Health data tools and DataPATH: <https://health.ucdavis.edu/data/tools.html>
- Data Provisioning Core: <https://health.ucdavis.edu/data/dpc.html>
- Biomedical Informatics and DataCOE contact: <https://health.ucdavis.edu/ctsc/area/informatics/>
- Health Data Oversight Committee: <https://health.ucdavis.edu/data/HDOC/hdoc.html>

### Identification map

| Model object | Candidate BE-FAIR variable |
|---|---|
| \(S_i\) | Raw predicted probability and/or risk percentile |
| \(c\) | Operational percentile threshold active on the scoring date |
| \(Z_i\) | Eligibility flag or appearance on the review registry |
| \(D_i\) | Chart review, outreach, successful contact, enrollment, or care received |
| \(Y_i\) | ED visits, unplanned hospitalizations, mortality, utilization, and cost |
| \(C_i\) | Staff time, outreach attempts, care-management intensity |
| \(G_i\) | Race and ethnicity, gender, Healthy Places Index, insurance, language |

### Questions for the feasibility meeting

1. Is the raw score saved for all scored patients, including those below the operational cutoff?
2. Are model version, scoring timestamp, and active cutoff retained?
3. Does the system record whether the recommendation was displayed or entered a work queue?
4. Are chart review, override, outreach, contact, enrollment, and service intensity separately recorded?
5. Can outcomes be measured using common follow-up windows on both sides of the cutoff?
6. Can patients enter care management through non-AI pathways?
7. Did the threshold or staff capacity change during deployment?
8. Are there score heaping, manual adjustments, exclusions, or routing rules near the threshold?
9. Can data be analyzed inside an approved secure environment with reproducible code exported?
10. Does an existing evaluation protocol or IRB cover causal analysis of the deployment?
11. Is “60” a percentile-rank cutoff recomputed within each scoring cohort, a fixed score threshold, or a display convention?
12. Was the same rule active throughout deployment, and are historical thresholds reconstructible?

### Go/no-go criteria

Proceed to a full protocol if:

- Scores exist on both sides of a known cutoff.
- The cutoff creates a detectable discontinuity in review, outreach, or enrollment.
- Recommendation exposure can be distinguished from score generation.
- Outcomes and model versions can be linked at the individual level.
- There is sufficient local sample size around the cutoff.

Reframe the project if:

- Only selected high-risk patients have stored scores.
- The threshold is informal or overridden so frequently that there is no first stage.
- Treatment intensity changed mechanically with caseload and cannot be measured.
- Below-threshold patients are systematically unobserved.

## 4. Secondary option: VA REACH VET

REACH VET ranks suicide risk and identifies the top 0.1% of patients at each facility for case review and outreach. The threshold, nationwide implementation, repeated monthly scoring, and administrative outcomes make it highly attractive.

Important complications include:

- Facility-specific rankings rather than a single absolute score cutoff.
- Repeated eligibility and dynamic treatment histories.
- Extremely rare primary outcomes.
- Model-version changes and other suicide-prevention programs.
- Restricted access and the need for a VA-based collaborator.

The setting is better suited to a dynamic or repeated-threshold extension than to the first baseline application.

## 5. Public-policy extension: Allegheny Family Screening Tool

The tool produces a family screening score and requires investigation at the highest levels. Below the mandatory threshold, the score informs rather than replaces human judgment.

This setting can test:

- The effect of mandatory algorithmic escalation.
- Human overrides and discretion below the threshold.
- Whether predictive fairness aligns with causal effects on families.
- How model-version changes alter decisions.

Risks include highly sensitive data, legal and ethical scrutiny, limited outcome definitions, and possible behavioral responses by staff.

## 6. Public pilot data: MIMIC-IV-Ext CDS

The PhysioNet dataset contains emergency-department cases designed for LLM evaluation in triage, specialty referral, and diagnosis. It is useful for code development and a human-AI experiment, but it does not contain real-world randomized or threshold-based deployment.

Appropriate uses:

- Simulate a score-based recommendation policy.
- Construct clinician vignettes.
- Compare risk prediction with estimated policy value under explicit assumptions.
- Test data pipelines and visualization code.

Inappropriate claim:

- It cannot establish that showing an AI recommendation changes actual clinical outcomes.

## 7. Data dictionary request

Request aggregate documentation before patient-level data:

- Score name, scale, distribution, and target.
- Feature availability and missingness.
- Training dates and model versions.
- Scoring frequency and unit of observation.
- Cutoff definitions and changes.
- Recommendation display and queue logic.
- Override categories.
- Outreach and enrollment workflow.
- Outcome definitions and observation windows.
- Staff capacity and workload measures.
- Counts by month, model version, and distance from cutoff.

The first aggregate diagnostic should be a table of counts and treatment rates in narrow score bins around the cutoff. This will reveal whether the proposed RD design has a usable first stage before substantial data-access work begins.

## 8. Ethics and governance

The project evaluates systems affecting access to consequential services. The protocol should therefore specify:

- Why protected-group analyses are necessary.
- Which group comparisons are prespecified.
- How small-cell disclosure risks will be managed.
- Whether recommendation logs contain sensitive clinician identifiers.
- How results about model limitations will be communicated to the deploying institution.
- Whether causal monitoring will be incorporated into future governance rather than treated as a one-time study.
