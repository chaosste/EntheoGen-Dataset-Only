# Experiments

Experiment manifests live in `evals/runs/` and describe one benchmark run.

Manifest fields:

- `run_name`: unique name for the run
- `adapter`: `manual-file`, `shell-command`, `openai-compatible`, or `oracle`
- `fixture_path`: fixture JSONL to score
- `predictions_path`: required for `manual-file`
- `out_dir`: result directory
- `adapter_options`: adapter-specific options

Run one manifest:

`npm run eval:run -- --manifest evals/runs/<name>.json`

Run all manifests:

`npm run eval:batch`

Manual adapter:

- point `predictions_path` at an existing predictions JSONL file
- the runner copies/scoring outputs into the configured `out_dir`

Shell command adapter:

- set `adapter_options.command_template`
- the prompt is written to the command’s stdin
- stdout may be JSON or plain text

OpenAI-compatible adapter:

- requires `OPENAI_BASE_URL`
- requires `OPENAI_API_KEY`
- requires `OPENAI_MODEL`
- no browser or interactive login is used

Leaderboard:

- run `npm run eval:leaderboard`
- outputs are written to `evals/leaderboard/`
