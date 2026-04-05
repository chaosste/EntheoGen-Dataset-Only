-- 003_views.sql
-- Leaderboard views (including materialized view) and readonly consumer role.

BEGIN;

CREATE OR REPLACE VIEW leaderboard_current AS
SELECT
  le.fixture_name,
  le.model_name,
  le.primary_metric_name,
  le.primary_metric_value,
  le.metrics,
  le.run_id,
  er.finished_at,
  er.created_at AS run_created_at
FROM leaderboard_entries le
JOIN eval_runs er
  ON er.run_id = le.run_id
WHERE er.status = 'succeeded';

CREATE MATERIALIZED VIEW leaderboard_current_mat AS
SELECT * FROM leaderboard_current;

CREATE UNIQUE INDEX uq_leaderboard_current_mat_fixture_model_run
  ON leaderboard_current_mat(fixture_name, model_name, run_id);

CREATE OR REPLACE FUNCTION refresh_leaderboard_current_mat()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_current_mat;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'entheogen_readonly') THEN
    CREATE ROLE entheogen_readonly NOLOGIN;
  END IF;
END;
$$;

GRANT USAGE ON SCHEMA public TO entheogen_readonly;
GRANT SELECT ON TABLE export_manifests TO entheogen_readonly;
GRANT SELECT ON TABLE substances TO entheogen_readonly;
GRANT SELECT ON TABLE interaction_pairs TO entheogen_readonly;
GRANT SELECT ON TABLE eval_runs TO entheogen_readonly;
GRANT SELECT ON TABLE eval_predictions TO entheogen_readonly;
GRANT SELECT ON TABLE leaderboard_entries TO entheogen_readonly;
GRANT SELECT ON leaderboard_current TO entheogen_readonly;
GRANT SELECT ON leaderboard_current_mat TO entheogen_readonly;

COMMIT;
