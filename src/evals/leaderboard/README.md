# Leaderboard

Each row represents one completed evaluation run.

Fields:

- run_name: experiment identifier
- adapter: prediction source used for the run
- fixture_name: evaluated fixture set
- total_cases: number of scored cases
- primary_metric_name / primary_metric_value: task-specific ranking metric
- interaction_code_accuracy: exact interaction label accuracy
- origin_accuracy: exact provenance accuracy
- mechanism_category_accuracy: exact mechanism class accuracy
- risk_scale_exact_accuracy: exact risk-scale accuracy
- risk_scale_mae: mean absolute error on risk scale
- abstention_recall: recall on unknown / abstention-safe cases
- hallucination_rate_on_unknown: rate of unsupported claims on unknown cases
- explicit_rule_recall: recall on explicit-rule provenance cases
