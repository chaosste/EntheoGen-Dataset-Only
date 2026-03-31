# Evaluation Harness

This directory contains local, deterministic evaluation fixtures and reports for the EntheoGen interaction dataset.

Fixture types:

- `direct_qa`: checks interaction risk classification accuracy
- `abstention`: checks whether unknown cases are safely abstained on
- `mechanism`: checks normalized `mechanism_category`
- `provenance`: checks explicit vs fallback vs unknown vs self provenance

Predictions JSONL schema:

```json
{
  "id": "direct_qa:ayahuasca|psilocybin",
  "predicted_interaction_code": "CAU",
  "predicted_origin": "explicit",
  "predicted_mechanism_category": "cardiovascular_load",
  "predicted_risk_scale": 3
}
```

Metrics:

- `interaction_code_accuracy`: exact interaction code match rate
- `origin_accuracy`: exact provenance match rate
- `mechanism_category_accuracy`: exact mechanism category match rate
- `risk_scale_exact_accuracy`: exact numeric risk-scale match rate
- `risk_scale_mae`: mean absolute error on numeric risk-scale predictions
- `abstention_recall`: unknown cases correctly abstained on
- `hallucination_rate_on_unknown`: unknown cases answered as if known
- `explicit_rule_recall`: explicit-rule cases correctly labeled explicit

Run the oracle baseline on all fixtures:

`npm run eval:oracle`

Score an external predictions file:

`npm run eval:score -- --fixtures evals/fixtures/direct_qa.jsonl --predictions path/to/predictions.jsonl --out evals/results/custom_report.json`

Reports are written to:

- `evals/results/`
