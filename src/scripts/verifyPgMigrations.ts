import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..', '..');
const migrationsRoot = join(projectRoot, 'sql', 'migrations');

const migrationFiles = [
  '001_core.sql',
  '002_eval.sql',
  '003_views.sql',
  '004_apply_notes.sql',
  '005_import_upsert.sql',
] as const;

const readMigration = (filename: string): string =>
  readFileSync(join(migrationsRoot, filename), 'utf8');

const assertIncludes = (content: string, pattern: RegExp, message: string): string | null =>
  pattern.test(content) ? null : message;

const failures: string[] = [];

const core = readMigration('001_core.sql');
const evalSql = readMigration('002_eval.sql');
const views = readMigration('003_views.sql');
const applyNotes = readMigration('004_apply_notes.sql');
const importUpsert = readMigration('005_import_upsert.sql');

for (const file of migrationFiles) {
  const content = readMigration(file);
  if (!/BEGIN;[\s\S]*COMMIT;/m.test(content)) {
    failures.push(`${file}: migration must be wrapped in BEGIN/COMMIT`);
  }
}

const expectedCoreChecks: Array<[RegExp, string]> = [
  [/CREATE TYPE\s+interaction_code_enum\s+AS ENUM[\s\S]*'LOW_MOD'[\s\S]*'SELF'/m, '001_core.sql: missing typed interaction_code_enum'],
  [/CREATE TYPE\s+origin_enum\s+AS ENUM[\s\S]*'explicit'[\s\S]*'self'/m, '001_core.sql: missing typed origin_enum'],
  [/CREATE TYPE\s+mechanism_category_enum\s+AS ENUM[\s\S]*'cardiovascular_load'[\s\S]*'unknown'/m, '001_core.sql: missing typed mechanism_category_enum'],
  [/CREATE OR REPLACE FUNCTION\s+set_updated_at\(\)/m, '001_core.sql: missing updated_at trigger function'],
  [/CREATE TRIGGER\s+trg_interaction_pairs_updated_at/m, '001_core.sql: missing updated_at trigger on interaction_pairs'],
  [/CREATE OR REPLACE FUNCTION\s+normalize_interaction_pair_order\(\)/m, '001_core.sql: missing canonical pair normalization function'],
  [/CREATE TRIGGER\s+trg_interaction_pairs_normalize_order/m, '001_core.sql: missing canonical pair normalization trigger'],
  [/risk_scale\s+SMALLINT\s+CHECK\s*\(risk_scale BETWEEN -1 AND 5\)/m, '001_core.sql: risk_scale must allow null with bounds check'],
  [/export_version\s+TEXT\s+NOT NULL\s+REFERENCES\s+export_manifests\(export_version\)/m, '001_core.sql: missing FK interaction_pairs.export_version -> export_manifests.export_version'],
  [/CONSTRAINT\s+chk_source_gap_usage[\s\S]*origin = 'unknown'[\s\S]*interaction_code = 'UNK'/m, '001_core.sql: missing source-gap semantic guard'],
  [/CONSTRAINT\s+chk_not_available_usage[\s\S]*origin = 'self'[\s\S]*interaction_code = 'SELF'/m, '001_core.sql: missing n\/a semantic guard'],
];

for (const [pattern, message] of expectedCoreChecks) {
  const failure = assertIncludes(core, pattern, message);
  if (failure) {
    failures.push(failure);
  }
}

const expectedEvalChecks: Array<[RegExp, string]> = [
  [/CREATE TYPE\s+eval_run_status_enum\s+AS ENUM[\s\S]*'queued'[\s\S]*'cancelled'/m, '002_eval.sql: missing typed eval_run_status_enum'],
  [/CREATE INDEX\s+idx_eval_predictions_run_created\s+ON\s+eval_predictions\(run_id, created_at\)/m, '002_eval.sql: missing eval_predictions(run_id, created_at) index'],
  [/CREATE INDEX\s+idx_eval_runs_fixture_status\s+ON\s+eval_runs\(fixture_name, status\)/m, '002_eval.sql: missing eval_runs(fixture_name, status) index'],
  [/CREATE INDEX\s+idx_leaderboard_entries_fixture_primary_value_desc[\s\S]*leaderboard_entries\(fixture_name, primary_metric_value DESC\)/m, '002_eval.sql: missing leaderboard_entries fixture/metric index'],
  [/CREATE TRIGGER\s+trg_eval_runs_updated_at/m, '002_eval.sql: missing updated_at trigger on eval_runs'],
  [/CREATE TRIGGER\s+trg_eval_predictions_updated_at/m, '002_eval.sql: missing updated_at trigger on eval_predictions'],
  [/CREATE TRIGGER\s+trg_leaderboard_entries_updated_at/m, '002_eval.sql: missing updated_at trigger on leaderboard_entries'],
  [/confidence_score\s+NUMERIC\(5,4\)\s+CHECK\s*\(confidence_score BETWEEN 0\.0 AND 1\.0\)/m, '002_eval.sql: missing normalized confidence_score numeric column'],
];

for (const [pattern, message] of expectedEvalChecks) {
  const failure = assertIncludes(evalSql, pattern, message);
  if (failure) {
    failures.push(failure);
  }
}

const expectedViewChecks: Array<[RegExp, string]> = [
  [/CREATE MATERIALIZED VIEW\s+leaderboard_current_mat/m, '003_views.sql: missing materialized leaderboard view'],
  [/CREATE OR REPLACE FUNCTION\s+refresh_leaderboard_current_mat\(\)/m, '003_views.sql: missing refresh function for materialized view'],
  [/CREATE ROLE\s+entheogen_readonly\s+NOLOGIN/m, '003_views.sql: missing readonly role'],
  [/GRANT\s+SELECT\s+ON\s+TABLE\s+interaction_pairs\s+TO\s+entheogen_readonly/m, '003_views.sql: missing readonly grant on interaction_pairs'],
  [/GRANT\s+SELECT\s+ON\s+leaderboard_current_mat\s+TO\s+entheogen_readonly/m, '003_views.sql: missing readonly grant on materialized leaderboard'],
];

for (const [pattern, message] of expectedViewChecks) {
  const failure = assertIncludes(views, pattern, message);
  if (failure) {
    failures.push(failure);
  }
}

const expectedApplyChecks: Array<[RegExp, string]> = [
  [/CREATE OR REPLACE FUNCTION\s+safe_refresh_leaderboard_current_mat\(/m, '004_apply_notes.sql: missing safe materialized refresh helper'],
  [/REFRESH MATERIALIZED VIEW CONCURRENTLY\s+leaderboard_current_mat/m, '004_apply_notes.sql: missing concurrent leaderboard refresh'],
  [/CREATE OR REPLACE FUNCTION\s+finalize_eval_run\(/m, '004_apply_notes.sql: missing eval finalization helper'],
];

for (const [pattern, message] of expectedApplyChecks) {
  const failure = assertIncludes(applyNotes, pattern, message);
  if (failure) {
    failures.push(failure);
  }
}

const expectedImportChecks: Array<[RegExp, string]> = [
  [/CREATE OR REPLACE FUNCTION\s+ensure_export_manifest\(/m, '005_import_upsert.sql: missing ensure_export_manifest helper'],
  [/CREATE OR REPLACE FUNCTION\s+upsert_interaction_pair\(/m, '005_import_upsert.sql: missing upsert_interaction_pair helper'],
  [/canonical_a\s*:=\s*LEAST\(/m, '005_import_upsert.sql: missing canonical_a LEAST normalization'],
  [/canonical_b\s*:=\s*GREATEST\(/m, '005_import_upsert.sql: missing canonical_b GREATEST normalization'],
  [/ON CONFLICT\s*\(export_version, substance_a_id, substance_b_id\)/m, '005_import_upsert.sql: missing canonical unique conflict target'],
];

for (const [pattern, message] of expectedImportChecks) {
  const failure = assertIncludes(importUpsert, pattern, message);
  if (failure) {
    failures.push(failure);
  }
}

if (failures.length > 0) {
  console.error('PostgreSQL migration verification failed.');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      migration_root: migrationsRoot,
      files_checked: migrationFiles,
      status: 'ok',
    },
    null,
    2,
  ),
);
