-- 005_import_upsert.sql
-- Import/upsert helpers that accept any pair order and persist canonical ordering.

BEGIN;

CREATE OR REPLACE FUNCTION ensure_export_manifest(
  p_export_version TEXT,
  p_dataset_version TEXT,
  p_schema_version INTEGER,
  p_manifest JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO export_manifests (
    export_version,
    dataset_version,
    schema_version,
    generated_at,
    manifest
  )
  VALUES (
    p_export_version,
    p_dataset_version,
    p_schema_version,
    NOW(),
    p_manifest
  )
  ON CONFLICT (export_version)
  DO UPDATE SET
    dataset_version = EXCLUDED.dataset_version,
    schema_version = EXCLUDED.schema_version,
    manifest = COALESCE(EXCLUDED.manifest, export_manifests.manifest),
    updated_at = NOW();
END;
$$;

CREATE OR REPLACE FUNCTION upsert_interaction_pair(
  p_export_version TEXT,
  p_substance_left TEXT,
  p_substance_right TEXT,
  p_origin origin_enum,
  p_interaction_code interaction_code_enum,
  p_interaction_label TEXT DEFAULT NULL,
  p_risk_scale SMALLINT DEFAULT NULL,
  p_summary TEXT DEFAULT NULL,
  p_confidence TEXT DEFAULT NULL,
  p_confidence_score NUMERIC DEFAULT NULL,
  p_mechanism TEXT DEFAULT NULL,
  p_mechanism_category mechanism_category_enum DEFAULT 'unknown',
  p_timing TEXT DEFAULT NULL,
  p_evidence_gaps TEXT DEFAULT NULL,
  p_evidence_tier TEXT DEFAULT NULL,
  p_field_notes TEXT DEFAULT NULL,
  p_sources TEXT DEFAULT NULL,
  p_source_refs TEXT[] DEFAULT NULL,
  p_source_fingerprint TEXT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
  canonical_a TEXT;
  canonical_b TEXT;
  v_id BIGINT;
BEGIN
  canonical_a := LEAST(p_substance_left, p_substance_right);
  canonical_b := GREATEST(p_substance_left, p_substance_right);

  INSERT INTO interaction_pairs (
    export_version,
    substance_a_id,
    substance_b_id,
    origin,
    interaction_code,
    interaction_label,
    risk_scale,
    summary,
    confidence,
    confidence_score,
    mechanism,
    mechanism_category,
    timing,
    evidence_gaps,
    evidence_tier,
    field_notes,
    sources,
    source_refs,
    source_fingerprint
  )
  VALUES (
    p_export_version,
    canonical_a,
    canonical_b,
    p_origin,
    p_interaction_code,
    p_interaction_label,
    p_risk_scale,
    p_summary,
    p_confidence,
    p_confidence_score,
    p_mechanism,
    p_mechanism_category,
    p_timing,
    p_evidence_gaps,
    p_evidence_tier,
    p_field_notes,
    p_sources,
    p_source_refs,
    p_source_fingerprint
  )
  ON CONFLICT (export_version, substance_a_id, substance_b_id)
  DO UPDATE SET
    origin = EXCLUDED.origin,
    interaction_code = EXCLUDED.interaction_code,
    interaction_label = EXCLUDED.interaction_label,
    risk_scale = EXCLUDED.risk_scale,
    summary = EXCLUDED.summary,
    confidence = EXCLUDED.confidence,
    confidence_score = EXCLUDED.confidence_score,
    mechanism = EXCLUDED.mechanism,
    mechanism_category = EXCLUDED.mechanism_category,
    timing = EXCLUDED.timing,
    evidence_gaps = EXCLUDED.evidence_gaps,
    evidence_tier = EXCLUDED.evidence_tier,
    field_notes = EXCLUDED.field_notes,
    sources = EXCLUDED.sources,
    source_refs = EXCLUDED.source_refs,
    source_fingerprint = EXCLUDED.source_fingerprint,
    updated_at = NOW()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

COMMIT;
