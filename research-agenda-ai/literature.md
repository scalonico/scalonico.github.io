# Literature Map

This file is a working map, not a complete literature review. Each source has a defined role in the project. Links below were verified against publisher, institutional, government, or official data-repository pages.

## 1. Why AI requires causal evaluation

### Joshi et al. (2025), “AI as an intervention: improving clinical outcomes relies on a causal approach to AI development and validation”

- **Source:** *Journal of the American Medical Informatics Association*, 32(3), 589–594.
- **Link:** <https://doi.org/10.1093/jamia/ocae301>
- **Role:** Establishes the central distinction between retrospective predictive performance and the causal effect of deploying an AI system.
- **Gap for this project:** It motivates causal evaluation but does not supply the full algorithmic-threshold identification and inference framework proposed here.

## 2. Algorithms as quasi-experiments

### Narita and Yata (2024), “Algorithm as Experiment: Machine Learning, Market Design, and Policy Eligibility Rules”

- **Source:** Cowles Foundation Discussion Paper 2391.
- **Link:** <https://cowles.yale.edu/sites/default/files/2024-05/d2391.pdf>
- **Role:** Shows how stochastic and deterministic algorithms can generate instruments; includes multidimensional RD designs with complex boundaries.
- **Gap for this project:** The proposed agenda emphasizes learned and updated clinical scores, human implementation, capacity, marginal welfare, and post-deployment monitoring.

## 3. Leading empirical setting

### “Developing and Applying the BE-FAIR Equity Framework to a Population Health Predictive Model” (2025)

- **Source:** *Journal of General Internal Medicine*.
- **Link:** <https://pmc.ncbi.nlm.nih.gov/articles/PMC12405130/>
- **DOI:** <https://doi.org/10.1007/s11606-025-09462-1>
- **Role:** Documents the UC Davis Health model, cohort, risk-percentile threshold, human review, care-management workflow, and predictive-equity evaluation.
- **Gap for this project:** The published analysis focuses on prediction, calibration, and implementation. The proposed work asks whether algorithm-induced eligibility and care change downstream outcomes.
- **Data availability finding (checked August 11, 2026):** The publisher provides a supplementary appendix with definitions and model-performance results, but no patient-level dataset, operational logs, analytic code, or linked public repository was found. The paper reports that the underlying model used UC Davis Health EHR and claims data.
- **Supplement:** <https://media.springernature.com/original/springer-static/esm/art%3A10.1007%2Fs11606-025-09462-1/MediaObjects/11606_2025_9462_MOESM1_ESM.docx>

### UC Davis Health data infrastructure

- **Clinical data sources:** <https://health.ucdavis.edu/data/sources.html>
- **Data tools and DataPATH:** <https://health.ucdavis.edu/data/tools.html>
- **Data Provisioning Core:** <https://health.ucdavis.edu/data/dpc.html>
- **Biomedical Informatics:** <https://health.ucdavis.edu/ctsc/area/informatics/>
- **Role:** Establishes that UC Davis Health has a de-identified OMOP environment for preliminary research, an identified-EHR route after IRB approval, operational Clarity/Caboodle data, and a provisioning service capable of curating clinical, financial, and operational extracts.
- **Remaining uncertainty:** None of the public pages establishes that historical BE-FAIR scores, recommendation exposure, or outreach actions are retained and linkable. This must be verified with the model and program owners.

### UC Davis Health Analytics Oversight Committee

- **Source:** UC Davis Health.
- **Link:** <https://health.ucdavis.edu/data/HDOC/aoc.html>
- **Role:** Documents institutional governance for AI and advanced analytical models used in real-time or near-real-time clinical decisions.

## 4. Other operational algorithmic settings

### VA REACH VET

- **Source:** U.S. Department of Veterans Affairs, Health Systems Research project description.
- **Link:** <https://www.hsrd.research.va.gov/research/abstracts.cfm?Project_ID=2141704596>
- **Role:** Predictive model with a top-0.1% risk threshold, dashboard review, clinician outreach, repeated scoring, and administrative outcomes.
- **Use:** Candidate dynamic-threshold application and a model for national-scale deployment evaluation.

### Allegheny Family Screening Tool

- **Source:** Allegheny County Department of Human Services.
- **Link:** <https://www.alleghenycounty.us/Services/Human-Services-DHS/DHS-News-and-Events/Accomplishments-and-Innovations/Allegheny-Family-Screening-Tool>
- **Role:** Public-sector predictive-risk model with human discretion and mandatory escalation at high scores.
- **Use:** Candidate extension outside health care.

### UCLA proactive care management

- **Source:** “Proactive Care Management of AI-Identified At-Risk Patients Decreases Preventable Admissions.”
- **Link:** <https://pmc.ncbi.nlm.nih.gov/articles/PMC12038862/>
- **Role:** Stepped-wedge implementation of AI-targeted care management, with preventable admissions and ED visits as outcomes.
- **Use:** Closest applied comparison for an AI-targeted population-health intervention.

## 5. Public datasets

### MIMIC-IV-Ext clinical decision support for referral, triage, and diagnosis

- **Source:** PhysioNet, version 1.0.2.
- **Link:** <https://physionet.org/content/mimic-iv-ext-cds/1.0.2/>
- **Role:** Public credentialed dataset for LLM-based clinical decision-support workflows.
- **Use:** Simulation, software development, and experimental-vignette construction—not causal deployment evaluation.

### MIMIC-IV

- **Source:** PhysioNet, version 3.1.
- **Link:** <https://physionet.org/content/mimiciv/3.1/>
- **Role:** Large deidentified hospital and ICU database containing admissions, orders, medications, labs, diagnoses, and provider-linked events.
- **Use:** Outcome construction and simulated policies, subject to credentialing and data-use requirements.

## 6. Regulation and post-deployment monitoring

### FDA request for comment on real-world AI-enabled medical-device performance

- **Source:** U.S. Food and Drug Administration.
- **Link:** <https://www.fda.gov/medical-devices/digital-health-center-excellence/request-public-comment-measuring-and-evaluating-artificial-intelligence-enabled-medical-device>
- **Role:** Identifies real-world performance, drift, human–AI interaction, outcomes, monitoring infrastructure, and response protocols as active policy questions.

### NIST ARIA pilot evaluation report

- **Source:** National Institute of Standards and Technology, NIST AI 700-2 (2025).
- **Link:** <https://www.nist.gov/publications/assessing-risks-and-impacts-ai-aria-pilot-evaluation-report>
- **Role:** Separates model testing, red teaming, and field testing and provides an institutional connection to AI measurement and evaluation.

## 7. Literature searches still required

Before drafting a paper introduction, complete targeted searches in:

1. Treatment-benefit versus risk-based targeting.
2. Policy learning and empirical welfare maximization.
3. Regression discontinuity with generated or estimated running variables.
4. Regression discontinuity with multidimensional decision boundaries.
5. Human compliance with algorithmic recommendations.
6. Selective labels and decision-induced missing outcomes.
7. Sequential inference and post-deployment monitoring.
8. Causal and allocational definitions of algorithmic fairness.

For each area, record the five closest papers, their exact estimands, assumptions, and remaining gap. Do not turn the final introduction into an annotated bibliography.
