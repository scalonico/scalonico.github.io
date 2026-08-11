# UC Davis BE-FAIR Outreach Package

## Objective

Secure a 30-minute feasibility conversation with the operational and technical owners of the BE-FAIR population-health model. The first conversation should establish whether the logged score and workflow data exist. It is not yet a request for patient-level records.

## Suggested recipients

- Reshma Gupta, Office of Population Health and Accountable Care — operational lead and corresponding author.
- Jason Y. Adams, IT Data Center of Excellence — model and data architecture.
- Jeffrey S. Hoch, Center for Healthcare Policy and Research — health-economics collaborator and institutional bridge.

These roles come from the public affiliations in the BE-FAIR article. Confirm current titles and contact details before sending.

## Draft email

**Subject:** Feasibility conversation: causal evaluation of the BE-FAIR care-management model

Dear Drs. Gupta, Adams, and Hoch,

I am developing a research agenda on the causal evaluation of AI-assisted decisions, with an initial focus on health-care allocation. The BE-FAIR population-health model is an unusually strong setting because it combines an individual risk score, a capacity-based outreach threshold, clinical review, and downstream care-management actions.

I would like to ask for a 30-minute feasibility conversation. The immediate question is narrow: does UC Davis Health retain historical scores and workflow records for patients on both sides of the operational threshold? If so, aggregate counts and action rates in narrow score bins could determine whether the threshold supports a credible causal design before anyone undertakes a patient-level data request.

The project would estimate how algorithmic eligibility changes review, outreach, enrollment, utilization, costs, and disparities. It would complement the published BE-FAIR evaluation by moving from predictive performance to the causal effects and marginal value of deployment.

I have attached a one-page concept note and a short aggregate feasibility template. I would be grateful for your advice on whether the relevant data objects exist and who should join an initial discussion.

Best,

Sebastian

## Five decisive questions

1. Is the raw predicted probability or percentile saved for every scored patient, including patients below the outreach threshold?
2. Are scoring timestamp, model version, and the cutoff active in each scoring cycle retained?
3. Can the score be linked to registry or work-queue exposure, chart review, outreach attempts, successful contact, and enrollment?
4. Does “60” represent a within-cycle percentile rank, a fixed numerical threshold, or another operational rule?
5. What internal route would permit an approved research team to link these records to common follow-up measures of ED use, hospitalization, mortality, and cost?

## Proposed 30-minute agenda

1. Five minutes: research question and why the threshold matters.
2. Ten minutes: how scoring, ranking, and outreach operated in practice.
3. Ten minutes: what fields were retained and where they reside.
4. Five minutes: smallest aggregate diagnostic and appropriate next contact.

## Attachments

Send only two short documents initially:

1. `concept-note.md`, converted to PDF or Word if needed.
2. `data-feasibility-request.md`, emphasizing aggregate tables rather than patient-level data.

Do not attach the full formal model or literature map to the first message.

## Success criterion

The meeting succeeds if it identifies:

- The owner and storage location of historical scores.
- Whether below-threshold records exist.
- The exact operational meaning of the threshold.
- At least one logged human-action variable.
- The correct consultation, IRB, and provisioning route.

If the score layer does not exist, ask about model-version changes, rollout dates, staffing changes, and the possibility of a prospective randomized encouragement or threshold experiment.
