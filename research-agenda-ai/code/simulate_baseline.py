#!/usr/bin/env python3
"""Baseline simulation for causal evaluation at an AI decision boundary.

The script uses synthetic data only. It compares predictive performance with
policy value and estimates the local effect of algorithmic eligibility using a
local-linear regression discontinuity design.

Outputs are written to ../results/{tables,figures}. The only non-standard
dependency is NumPy.
"""

from __future__ import annotations

import csv
from dataclasses import dataclass
from pathlib import Path

import numpy as np


ROOT = Path(__file__).resolve().parents[1]
TABLE_DIR = ROOT / "results" / "tables"
FIGURE_DIR = ROOT / "results" / "figures"
SEED = 20260811
N = 200_000
QUALITY_GRID = (2.00, 1.25, 0.75, 0.25)
CUTOFF_QUANTILE = 0.60
RD_BANDWIDTH = 8.0  # percentile points


@dataclass
class Population:
    risk_feature: np.ndarray
    benefit_feature: np.ndarray
    score_noise: np.ndarray
    untreated_risk: np.ndarray
    treatment_benefit: np.ndarray
    untreated_event: np.ndarray
    treated_event: np.ndarray
    action_if_ineligible: np.ndarray
    action_if_eligible: np.ndarray


def expit(x: np.ndarray) -> np.ndarray:
    return 1.0 / (1.0 + np.exp(-np.clip(x, -35.0, 35.0)))


def make_population(n: int, rho: float, seed: int) -> Population:
    """Generate risk, treatment benefit, potential actions, and outcomes."""
    rng = np.random.default_rng(seed)
    risk_feature = rng.normal(size=n)
    benefit_shock = rng.normal(size=n)
    benefit_feature = rho * risk_feature + np.sqrt(1.0 - rho**2) * benefit_shock
    score_noise = rng.normal(size=n)

    untreated_risk = expit(-1.50 + 0.90 * risk_feature)
    raw_benefit = 0.16 * expit(0.60 + 1.20 * benefit_feature)
    treatment_benefit = np.minimum(raw_benefit, np.maximum(untreated_risk - 0.005, 0.0))
    treated_risk = untreated_risk - treatment_benefit

    outcome_draw = rng.uniform(size=n)
    untreated_event = (outcome_draw < untreated_risk).astype(float)
    treated_event = (outcome_draw < treated_risk).astype(float)

    action_draw = rng.uniform(size=n)
    action_if_ineligible = (action_draw < 0.10).astype(float)
    action_if_eligible = (action_draw < 0.65).astype(float)

    return Population(
        risk_feature=risk_feature,
        benefit_feature=benefit_feature,
        score_noise=score_noise,
        untreated_risk=untreated_risk,
        treatment_benefit=treatment_benefit,
        untreated_event=untreated_event,
        treated_event=treated_event,
        action_if_ineligible=action_if_ineligible,
        action_if_eligible=action_if_eligible,
    )


def percentile_rank(values: np.ndarray) -> np.ndarray:
    order = np.argsort(values, kind="mergesort")
    ranks = np.empty(values.size, dtype=float)
    ranks[order] = np.arange(values.size, dtype=float)
    return (ranks + 0.5) / values.size


def auc_binary(labels: np.ndarray, scores: np.ndarray) -> float:
    """Mann-Whitney AUC; simulated scores are continuous, so ties are absent."""
    labels = labels.astype(bool)
    n_pos = int(labels.sum())
    n_neg = labels.size - n_pos
    order = np.argsort(scores, kind="mergesort")
    ranks = np.empty(labels.size, dtype=float)
    ranks[order] = np.arange(1, labels.size + 1, dtype=float)
    rank_sum = ranks[labels].sum()
    return float((rank_sum - n_pos * (n_pos + 1) / 2.0) / (n_pos * n_neg))


def deploy(pop: Population, noise_sd: float, action_cost: float = 0.025) -> dict:
    linear_score = -1.50 + 0.90 * (pop.risk_feature + noise_sd * pop.score_noise)
    predicted_risk = expit(linear_score)
    percentile = percentile_rank(predicted_risk)
    running = 100.0 * (percentile - CUTOFF_QUANTILE)
    eligible = (running >= 0.0).astype(float)

    action = np.where(
        eligible == 1.0,
        pop.action_if_eligible,
        pop.action_if_ineligible,
    )
    adverse_event = np.where(action == 1.0, pop.treated_event, pop.untreated_event)

    incremental_action = eligible * (
        pop.action_if_eligible - pop.action_if_ineligible
    )
    policy_gain = np.mean(
        incremental_action * (pop.treatment_benefit - action_cost)
    )

    return {
        "predicted_risk": predicted_risk,
        "percentile": percentile,
        "running": running,
        "eligible": eligible,
        "action": action,
        "adverse_event": adverse_event,
        "auc": auc_binary(pop.untreated_event, predicted_risk),
        "brier": float(np.mean((pop.untreated_event - predicted_risk) ** 2)),
        "policy_gain_per_100": float(100.0 * policy_gain),
        "selected_mean_benefit": float(np.mean(pop.treatment_benefit[eligible == 1.0])),
        "action_rate": float(np.mean(action)),
    }


def rd_pair(
    outcome: np.ndarray,
    action: np.ndarray,
    running: np.ndarray,
    eligible: np.ndarray,
    bandwidth: float,
) -> dict:
    """Triangular-kernel local-linear RD with joint HC1 covariance."""
    use = np.abs(running) <= bandwidth
    r = running[use]
    z = eligible[use]
    y = outcome[use]
    d = action[use]
    weights = 1.0 - np.abs(r) / bandwidth
    design = np.column_stack((np.ones(r.size), r, z, z * r))

    cross = design.T @ (weights[:, None] * design)
    bread = np.linalg.inv(cross)

    def fit(values: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
        beta = bread @ (design.T @ (weights * values))
        residual = values - design @ beta
        loading = design @ bread[2, :]
        influence = loading * weights * residual
        return beta, residual, influence

    beta_y, _, influence_y = fit(y)
    beta_d, _, influence_d = fit(d)
    hc1 = r.size / (r.size - design.shape[1])
    var_y = hc1 * float(influence_y @ influence_y)
    var_d = hc1 * float(influence_d @ influence_d)
    cov_yd = hc1 * float(influence_y @ influence_d)

    jump_y = float(beta_y[2])
    jump_d = float(beta_d[2])
    ratio = jump_y / jump_d
    ratio_var = (
        var_y / jump_d**2
        + jump_y**2 * var_d / jump_d**4
        - 2.0 * jump_y * cov_yd / jump_d**3
    )

    return {
        "bandwidth": bandwidth,
        "n_within_bandwidth": int(r.size),
        "outcome_jump": jump_y,
        "outcome_se": float(np.sqrt(max(var_y, 0.0))),
        "action_jump": jump_d,
        "action_se": float(np.sqrt(max(var_d, 0.0))),
        "fuzzy_rd": ratio,
        "fuzzy_rd_se": float(np.sqrt(max(ratio_var, 0.0))),
    }


def binned_means(
    running: np.ndarray,
    action: np.ndarray,
    outcome: np.ndarray,
    window: float = 15.0,
    width: float = 1.0,
) -> list[dict]:
    edges = np.arange(-window, window + width, width)
    rows: list[dict] = []
    for left, right in zip(edges[:-1], edges[1:]):
        use = (running >= left) & (running < right)
        if not np.any(use):
            continue
        rows.append(
            {
                "bin_center": float((left + right) / 2.0),
                "n": int(use.sum()),
                "action_rate": float(action[use].mean()),
                "adverse_event_rate": float(outcome[use].mean()),
            }
        )
    return rows


def write_csv(path: Path, rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=list(rows[0].keys()),
            lineterminator="\n",
        )
        writer.writeheader()
        writer.writerows(rows)


def svg_escape(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def tradeoff_svg(rows: list[dict], path: Path) -> None:
    width, height = 820, 540
    left, right, top, bottom = 90, 30, 55, 95
    plot_w, plot_h = width - left - right, height - top - bottom
    x_values = [row["auc"] for row in rows]
    y_values = [row["policy_gain_per_100"] for row in rows]
    x_min, x_max = min(x_values) - 0.01, max(x_values) + 0.01
    y_pad = max(0.04, 0.10 * (max(y_values) - min(y_values)))
    y_min, y_max = min(y_values) - y_pad, max(y_values) + y_pad

    def sx(x: float) -> float:
        return left + (x - x_min) / (x_max - x_min) * plot_w

    def sy(y: float) -> float:
        return top + (y_max - y) / (y_max - y_min) * plot_h

    colors = {"Aligned": "#1565C0", "Misaligned": "#C44536"}
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">',
        '<rect width="100%" height="100%" fill="white"/>',
        '<style>text{font-family:Arial,sans-serif;fill:#222}.axis{stroke:#333;stroke-width:1}.grid{stroke:#ddd;stroke-width:1}.series{fill:none;stroke-width:3}.point{stroke:white;stroke-width:1.5}</style>',
        '<text x="410" y="28" text-anchor="middle" font-size="19" font-weight="bold">Prediction quality and policy value can diverge</text>',
    ]
    for tick in np.linspace(x_min, x_max, 6):
        x = sx(float(tick))
        parts.append(f'<line class="grid" x1="{x:.1f}" y1="{top}" x2="{x:.1f}" y2="{top + plot_h}"/>')
        parts.append(f'<text x="{x:.1f}" y="{top + plot_h + 25}" text-anchor="middle" font-size="12">{tick:.2f}</text>')
    for tick in np.linspace(y_min, y_max, 6):
        y = sy(float(tick))
        parts.append(f'<line class="grid" x1="{left}" y1="{y:.1f}" x2="{left + plot_w}" y2="{y:.1f}"/>')
        parts.append(f'<text x="{left - 12}" y="{y + 4:.1f}" text-anchor="end" font-size="12">{tick:.2f}</text>')
    parts.extend(
        [
            f'<line class="axis" x1="{left}" y1="{top + plot_h}" x2="{left + plot_w}" y2="{top + plot_h}"/>',
            f'<line class="axis" x1="{left}" y1="{top}" x2="{left}" y2="{top + plot_h}"/>',
            f'<text x="{left + plot_w / 2:.1f}" y="{height - 22}" text-anchor="middle" font-size="14">AUC for untreated adverse events</text>',
            f'<text x="22" y="{top + plot_h / 2:.1f}" text-anchor="middle" font-size="14" transform="rotate(-90 22 {top + plot_h / 2:.1f})">Policy gain per 100 patients</text>',
        ]
    )
    for relation in ("Aligned", "Misaligned"):
        group = sorted(
            [row for row in rows if row["risk_benefit_relation"] == relation],
            key=lambda row: row["auc"],
        )
        coords = " ".join(f'{sx(row["auc"]):.1f},{sy(row["policy_gain_per_100"]):.1f}' for row in group)
        color = colors[relation]
        parts.append(f'<polyline class="series" stroke="{color}" points="{coords}"/>')
        for row in group:
            x, y = sx(row["auc"]), sy(row["policy_gain_per_100"])
            parts.append(f'<circle class="point" cx="{x:.1f}" cy="{y:.1f}" r="6" fill="{color}"/>')
            near_right = row["auc"] > x_min + 0.85 * (x_max - x_min)
            label_x = x - 8 if near_right else x + 8
            anchor = "end" if near_right else "start"
            parts.append(f'<text x="{label_x:.1f}" y="{y - 8:.1f}" text-anchor="{anchor}" font-size="10">σ={row["score_noise_sd"]:.2f}</text>')
        final = group[-1]
        parts.append(
            f'<text x="{sx(final["auc"]) - 8:.1f}" y="{sy(final["policy_gain_per_100"]) + 25:.1f}" text-anchor="end" font-size="13" font-weight="bold" fill="{color}">{relation} benefit</text>'
        )
    parts.append(f'<text x="410" y="{height - 10}" text-anchor="middle" font-size="10" fill="#555">Lower σ means a more accurate risk score. Synthetic data; N=200,000 per relation.</text>')
    parts.append("</svg>")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(parts), encoding="utf-8")


def rd_svg(rows: list[dict], estimates: dict, path: Path) -> None:
    width, height = 940, 530
    margin, gap, top, bottom = 68, 75, 112, 70
    panel_w = (width - 2 * margin - gap) / 2
    panel_h = height - top - bottom
    panels = [
        ("action_rate", "Human action rate", "#1565C0"),
        ("adverse_event_rate", "Adverse-event rate", "#C44536"),
    ]
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">',
        '<rect width="100%" height="100%" fill="white"/>',
        '<style>text{font-family:Arial,sans-serif;fill:#222}.axis{stroke:#333}.grid{stroke:#ddd}.cut{stroke:#111;stroke-width:1.5}.dot{stroke:white;stroke-width:1}</style>',
        '<text x="470" y="27" text-anchor="middle" font-size="19" font-weight="bold">The eligibility threshold changes action and outcomes</text>',
        f'<text x="470" y="47" text-anchor="middle" font-size="12">Local-linear bandwidth: ±{estimates["bandwidth"]:.0f} percentile points; N within bandwidth: {estimates["n_within_bandwidth"]:,}</text>',
    ]
    for panel_index, (key, title, color) in enumerate(panels):
        x0 = margin + panel_index * (panel_w + gap)
        values = [row[key] for row in rows]
        y_min = max(0.0, min(values) - 0.04)
        y_max = min(1.0, max(values) + 0.04)

        def sx(x: float) -> float:
            return x0 + (x + 15.0) / 30.0 * panel_w

        def sy(y: float) -> float:
            return top + (y_max - y) / (y_max - y_min) * panel_h

        for tick in (-15, -10, -5, 0, 5, 10, 15):
            x = sx(float(tick))
            parts.append(f'<line class="grid" x1="{x:.1f}" y1="{top}" x2="{x:.1f}" y2="{top + panel_h}"/>')
            parts.append(f'<text x="{x:.1f}" y="{top + panel_h + 22}" text-anchor="middle" font-size="11">{tick}</text>')
        for tick in np.linspace(y_min, y_max, 5):
            y = sy(float(tick))
            parts.append(f'<line class="grid" x1="{x0:.1f}" y1="{y:.1f}" x2="{x0 + panel_w:.1f}" y2="{y:.1f}"/>')
            parts.append(f'<text x="{x0 - 9:.1f}" y="{y + 4:.1f}" text-anchor="end" font-size="11">{tick:.2f}</text>')
        parts.append(f'<line class="axis" x1="{x0:.1f}" y1="{top + panel_h}" x2="{x0 + panel_w:.1f}" y2="{top + panel_h}"/>')
        parts.append(f'<line class="axis" x1="{x0:.1f}" y1="{top}" x2="{x0:.1f}" y2="{top + panel_h}"/>')
        parts.append(f'<line class="cut" x1="{sx(0):.1f}" y1="{top}" x2="{sx(0):.1f}" y2="{top + panel_h}"/>')
        parts.append(f'<text x="{x0 + panel_w / 2:.1f}" y="{top - 18}" text-anchor="middle" font-size="15" font-weight="bold">{title}</text>')
        for row in rows:
            parts.append(f'<circle class="dot" cx="{sx(row["bin_center"]):.1f}" cy="{sy(row[key]):.1f}" r="4.5" fill="{color}"/>')
        jump = estimates["action_jump"] if key == "action_rate" else estimates["outcome_jump"]
        se = estimates["action_se"] if key == "action_rate" else estimates["outcome_se"]
        parts.append(f'<text x="{x0 + panel_w - 4:.1f}" y="{top + 18}" text-anchor="end" font-size="12">Estimated jump: {jump:.3f} (SE {se:.3f})</text>')
    parts.append(f'<text x="470" y="{height - 17}" text-anchor="middle" font-size="13">Risk percentile relative to the 60th-percentile eligibility cutoff</text>')
    parts.append("</svg>")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(parts), encoding="utf-8")


def markdown_summary(rows: list[dict], rd: dict, path: Path) -> None:
    ordered = sorted(rows, key=lambda row: (row["risk_benefit_relation"], -row["score_noise_sd"]))
    lines = [
        "# Baseline Simulation Results",
        "",
        "## Prediction and policy value",
        "",
        "| Risk–benefit relation | Score noise SD | AUC | Brier score | Policy gain per 100 patients | Mean benefit among eligible |",
        "|---|---:|---:|---:|---:|---:|",
    ]
    for row in ordered:
        lines.append(
            f'| {row["risk_benefit_relation"]} | {row["score_noise_sd"]:.2f} | '
            f'{row["auc"]:.3f} | {row["brier"]:.3f} | '
            f'{row["policy_gain_per_100"]:.3f} | {row["selected_mean_benefit"]:.3f} |'
        )
    lines.extend(
        [
            "",
            "Lower score noise improves prediction. When untreated risk and treatment benefit are aligned, policy value rises with AUC. When they are misaligned, the same predictive improvement lowers policy value because eligibility concentrates on people with smaller treatment benefits.",
            "",
            "## Regression-discontinuity diagnostic",
            "",
            "The diagnostic uses the aligned, lowest-noise scenario.",
            "",
            "| Estimand | Estimate | Standard error |",
            "|---|---:|---:|",
            f'| Eligibility effect on human action | {rd["action_jump"]:.3f} | {rd["action_se"]:.3f} |',
            f'| Eligibility effect on adverse events | {rd["outcome_jump"]:.3f} | {rd["outcome_se"]:.3f} |',
            f'| Fuzzy-RD effect of action on adverse events | {rd["fuzzy_rd"]:.3f} | {rd["fuzzy_rd_se"]:.3f} |',
            "",
            "The outcome is adverse, so negative estimates indicate improvement. The fuzzy-RD ratio has a treatment-effect interpretation here because the simulation imposes exclusion and monotone compliance; the project will not assume either condition automatically in the UC Davis application.",
        ]
    )
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    TABLE_DIR.mkdir(parents=True, exist_ok=True)
    FIGURE_DIR.mkdir(parents=True, exist_ok=True)
    summary_rows: list[dict] = []
    main_deployment: dict | None = None
    main_population: Population | None = None

    relations = (("Aligned", 0.80), ("Misaligned", -0.80))
    for relation_index, (relation, rho) in enumerate(relations):
        pop = make_population(N, rho, SEED + 1000 * relation_index)
        for noise_sd in QUALITY_GRID:
            deployment = deploy(pop, noise_sd)
            summary_rows.append(
                {
                    "risk_benefit_relation": relation,
                    "rho": rho,
                    "score_noise_sd": noise_sd,
                    "auc": deployment["auc"],
                    "brier": deployment["brier"],
                    "policy_gain_per_100": deployment["policy_gain_per_100"],
                    "selected_mean_benefit": deployment["selected_mean_benefit"],
                    "action_rate": deployment["action_rate"],
                }
            )
            if relation == "Aligned" and noise_sd == min(QUALITY_GRID):
                main_deployment = deployment
                main_population = pop

    assert main_deployment is not None and main_population is not None
    rd = rd_pair(
        outcome=main_deployment["adverse_event"],
        action=main_deployment["action"],
        running=main_deployment["running"],
        eligible=main_deployment["eligible"],
        bandwidth=RD_BANDWIDTH,
    )
    local = np.abs(main_deployment["running"]) <= 0.25
    compliers = main_population.action_if_eligible > main_population.action_if_ineligible
    rd["true_local_complier_effect"] = -float(
        main_population.treatment_benefit[local & compliers].mean()
    )

    aligned = sorted(
        [row for row in summary_rows if row["risk_benefit_relation"] == "Aligned"],
        key=lambda row: row["auc"],
    )
    misaligned = sorted(
        [row for row in summary_rows if row["risk_benefit_relation"] == "Misaligned"],
        key=lambda row: row["auc"],
    )
    assert all(
        later["policy_gain_per_100"] > earlier["policy_gain_per_100"]
        for earlier, later in zip(aligned[:-1], aligned[1:])
    ), "Policy value should rise with AUC in the aligned scenario."
    assert all(
        later["policy_gain_per_100"] < earlier["policy_gain_per_100"]
        for earlier, later in zip(misaligned[:-1], misaligned[1:])
    ), "Policy value should fall with AUC in the misaligned scenario."
    assert rd["action_jump"] > 0.0, "Eligibility must generate a positive first stage."
    assert rd["outcome_jump"] < 0.0, "Eligibility should reduce adverse events."
    assert abs(rd["fuzzy_rd"] - rd["true_local_complier_effect"]) < 1.96 * rd["fuzzy_rd_se"], (
        "The estimated fuzzy-RD effect should cover the simulated local complier effect."
    )

    bins = binned_means(
        main_deployment["running"],
        main_deployment["action"],
        main_deployment["adverse_event"],
    )
    write_csv(TABLE_DIR / "simulation_summary.csv", summary_rows)
    write_csv(TABLE_DIR / "rd_estimates.csv", [rd])
    write_csv(TABLE_DIR / "rd_binned_means.csv", bins)
    markdown_summary(summary_rows, rd, TABLE_DIR / "simulation_summary.md")
    tradeoff_svg(summary_rows, FIGURE_DIR / "prediction_policy_tradeoff.svg")
    rd_svg(bins, rd, FIGURE_DIR / "rd_diagnostics.svg")

    print(f"Wrote {len(summary_rows)} scenario rows to {TABLE_DIR}")
    print(
        "RD: action jump={:.3f}, outcome jump={:.3f}, fuzzy ratio={:.3f}".format(
            rd["action_jump"], rd["outcome_jump"], rd["fuzzy_rd"]
        )
    )
    print(f"Figures written to {FIGURE_DIR}")


if __name__ == "__main__":
    main()
