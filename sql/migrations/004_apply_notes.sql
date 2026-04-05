-- 004_apply_notes.sql
-- Operational helpers for safer production rollout and post-run leaderboard refresh.
--
-- Notes for operators:
-- 1) Apply migrations in order under a transaction where possible.
-- 2) Prefer low lock/statement timeouts for operational refresh operations.
-- 3) Refresh materialized leaderboard after eval runs complete.

BEGIN;

CREATE OR REPLACE FUNCTION safe_refresh_leaderboard_current_mat(
  p_lock_timeout_ms INTEGER DEFAULT 2000,
  p_statement_timeout_ms INTEGER DEFAULT 15000
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Local timeouts avoid long blocking in busy environments.
  PERFORM set_config('lock_timeout', p_lock_timeout_ms::TEXT || 'ms', true);
  PERFORM set_config('statement_timeout', p_statement_timeout_ms::TEXT || 'ms', true);

  REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_current_mat;
END;
$$;

CREATE OR REPLACE FUNCTION finalize_eval_run(
  p_run_id TEXT,
  p_status eval_run_status_enum DEFAULT 'succeeded',
  p_summary_metrics JSONB DEFAULT NULL,
  p_refresh_leaderboard BOOLEAN DEFAULT true
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE eval_runs
  SET
    status = p_status,
    summary_metrics = COALESCE(p_summary_metrics, summary_metrics),
    finished_at = NOW(),
    updated_at = NOW()
  WHERE run_id = p_run_id;

  IF p_refresh_leaderboard THEN
    PERFORM safe_refresh_leaderboard_current_mat();
  END IF;
END;
$$;

COMMIT;
