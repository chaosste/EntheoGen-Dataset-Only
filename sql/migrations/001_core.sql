-- 001_core.sql
-- Core dataset schema with strong enums, canonical pair normalization,
-- updated_at automation, and export manifest referential integrity.

BEGIN;

CREATE TYPE interaction_code_enum AS ENUM (
  'LOW',
  'LOW_MOD',
  'CAU',
  'UNS',
  'DAN',
  'UNK',
  'SELF'
);

CREATE TYPE origin_enum AS ENUM (
  'explicit',
  'fallback',
  'unknown',
  'self'
);

CREATE TYPE mechanism_category_enum AS ENUM (
  'serotonergic',
  'maoi',
  'qt_prolongation',
  'sympathomimetic',
  'cns_depressant',
  'anticholinergic',
  'dopaminergic',
  'glutamatergic',
  'gabaergic',
  'stimulant_stack',
  'psychedelic_potentiation',
  'cardiovascular_load',
  'unknown'
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION normalize_interaction_pair_order()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  left_id TEXT;
  right_id TEXT;
BEGIN
  IF NEW.substance_a_id IS NULL OR NEW.substance_b_id IS NULL THEN
    RETURN NEW;
  END IF;

  left_id := LEAST(NEW.substance_a_id, NEW.substance_b_id);
  right_id := GREATEST(NEW.substance_a_id, NEW.substance_b_id);
  NEW.substance_a_id := left_id;
  NEW.substance_b_id := right_id;

  RETURN NEW;
END;
$$;

CREATE TABLE export_manifests (
  export_version TEXT PRIMARY KEY,
  dataset_version TEXT NOT NULL,
  schema_version INTEGER NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  manifest JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_export_manifests_updated_at
BEFORE UPDATE ON export_manifests
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE substances (
  id TEXT PRIMARY KEY,
  display_name TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_substances_updated_at
BEFORE UPDATE ON substances
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE interaction_pairs (
  id BIGSERIAL PRIMARY KEY,
  export_version TEXT NOT NULL REFERENCES export_manifests(export_version),
  substance_a_id TEXT NOT NULL,
  substance_b_id TEXT NOT NULL,
  pair_key TEXT GENERATED ALWAYS AS (substance_a_id || '|' || substance_b_id) STORED,

  origin origin_enum NOT NULL,
  interaction_code interaction_code_enum NOT NULL,
  interaction_label TEXT,
  risk_scale SMALLINT CHECK (risk_scale BETWEEN -1 AND 5),

  summary TEXT,
  confidence TEXT,
  confidence_score NUMERIC(5,4) CHECK (confidence_score BETWEEN 0.0 AND 1.0),
  mechanism TEXT,
  mechanism_category mechanism_category_enum NOT NULL,
  timing TEXT,
  evidence_gaps TEXT,
  evidence_tier TEXT,
  field_notes TEXT,

  sources TEXT,
  source_refs TEXT[],
  source_fingerprint TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_interaction_pairs_export_pair UNIQUE (export_version, substance_a_id, substance_b_id),
  CONSTRAINT chk_not_self_pair CHECK (substance_a_id <= substance_b_id),
  CONSTRAINT chk_source_gap_usage CHECK (
    source_refs IS NULL
    OR NOT ('source_gap' = ANY(source_refs))
    OR (origin = 'unknown' AND interaction_code = 'UNK')
  ),
  CONSTRAINT chk_not_available_usage CHECK (
    source_refs IS NULL
    OR NOT ('not_available' = ANY(source_refs))
    OR (origin = 'self' AND interaction_code = 'SELF')
  )
);

CREATE TRIGGER trg_interaction_pairs_normalize_order
BEFORE INSERT OR UPDATE ON interaction_pairs
FOR EACH ROW
EXECUTE FUNCTION normalize_interaction_pair_order();

CREATE TRIGGER trg_interaction_pairs_updated_at
BEFORE UPDATE ON interaction_pairs
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_interaction_pairs_export_version ON interaction_pairs(export_version);
CREATE INDEX idx_interaction_pairs_source_refs_gin ON interaction_pairs USING GIN (source_refs);
CREATE INDEX idx_interaction_pairs_created_at ON interaction_pairs(created_at);

COMMIT;
