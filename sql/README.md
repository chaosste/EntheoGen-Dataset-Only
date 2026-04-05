# PostgreSQL migrations

This folder contains a concrete DB migration scaffold aligned with the dataset export contract.

## Migration order

- `migrations/001_core.sql`: typed enums, canonical pair normalization trigger,
  `updated_at` automation, nullable `risk_scale` contract alignment,
  `interaction_pairs.export_version` FK to `export_manifests`, provenance
  placeholder constraints, and optional normalized `confidence_score`.
- `migrations/002_eval.sql`: eval tables, typed run status enum, and requested
  scale/ergonomic indexes.
- `migrations/003_views.sql`: standard leaderboard view, materialized leaderboard
  view + refresh function, and readonly role grants.
- `migrations/004_apply_notes.sql`: operational helper functions for
  production-safe materialized refresh and `finalize_eval_run(...)`.
- `migrations/005_import_upsert.sql`: import/upsert helpers
  `ensure_export_manifest(...)` and `upsert_interaction_pair(...)` that accept
  any pair order and persist canonical ordering.

## Contract verifier

Run from `src/`:

`npm run verify:pg:migrations`

This static verifier checks that the migration files include required safety/ergonomic guarantees.
