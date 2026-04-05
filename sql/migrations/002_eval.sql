-- 002_eval.sql
-- Evaluation tables with enum status, updated_at automation, and scale-focused indexes.

BEGIN;

CREATE TYPE eval_run_status_enum AS ENUM (
  'queued',
  'running',
  'succeeded',
  'failed',
  'cancelled'
);

CREATE TABLE eval_runs (
  id BIGSERIAL PRIMARY KEY,
  run_id TEXT NOT NULL UNIQUE,
  fixture_name TEXT NOT NULL,
  model_name TEXT NOT NULL,
  status eval_run_status_enum NOT NULL DEFAULT 'queued',
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  run_config JSONB,
  summary_metrics JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_eval_runs_updated_at
BEFORE UPDATE ON eval_runs
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE eval_predictions (
  id BIGSERIAL PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES eval_runs(run_id) ON DELETE CASCADE,
  pair_key TEXT NOT NULL,
  predicted_code interaction_code_enum,
  predicted_label TEXT,
  confidence TEXT,
  confidence_score NUMERIC(5,4) CHECK (confidence_score BETWEEN 0.0 AND 1.0),
  expected_code interaction_code_enum,
  is_correct BOOLEAN,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_eval_predictions_updated_at
BEFORE UPDATE ON eval_predictions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE leaderboard_entries (
  id BIGSERIAL PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES eval_runs(run_id) ON DELETE CASCADE,
  fixture_name TEXT NOT NULL,
  model_name TEXT NOT NULL,
  primary_metric_name TEXT NOT NULL,
  primary_metric_value NUMERIC NOT NULL,
  metrics JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_leaderboard_entries_updated_at
BEFORE UPDATE ON leaderboard_entries
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Requested ergonomics and scale indexes.
CREATE INDEX idx_eval_predictions_run_created ON eval_predictions(run_id, created_at);
CREATE INDEX idx_eval_predictions_created_at ON eval_predictions(created_at);
CREATE INDEX idx_eval_runs_fixture_status ON eval_runs(fixture_name, status);
CREATE INDEX idx_eval_runs_created_at ON eval_runs(created_at);
CREATE INDEX idx_leaderboard_entries_fixture_primary_value_desc
  ON leaderboard_entries(fixture_name, primary_metric_value DESC);
CREATE INDEX idx_leaderboard_entries_created_at ON leaderboard_entries(created_at);

COMMIT;
