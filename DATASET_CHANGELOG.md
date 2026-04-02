# Dataset changelog

Semantic evolution of the **interaction_pairs** exports, Hugging Face bundle,
diagnostics, and evaluation artefacts. Bump `src/datasetVersion.ts` when
releasing a new dataset version.

## v2.0.0

### Added

- `mechanism_category` enum labels on each interaction row
- Provenance-aware `origin` field (`explicit` / `fallback` / `unknown` / `self`)
- Hugging Face–style bundle under `src/hf_dataset/` (JSONL splits +
  `dataset_infos.json`)
- Diagnostics summaries and distribution exports under `src/diagnostics/`
- Pre-cut JSONL slices under `src/slices/` (mechanism, risk, origin)
- Evaluation harness fixtures, adapters, and oracle baseline outputs under
  `src/evals/`
- Canonical `dataset_version` + `schema_version` on export manifest,
  diagnostics summary, and HF metadata (`src/datasetVersion.ts`)
- Published JSON Schema for core row shape: `schemas/interaction_pair.schema.json`
- `npm run validate:schema` for third-party validation without TypeScript

### Changed

- `resolveInteraction()` exposes explicit provenance alongside evidence and
  `pair_key` (consumed by the exporter; rule definitions unchanged in this
  release track)
- Exporter writes `dataset_version`, `generated_at`, and `schema_version` into
  `exports/manifest.json`, `diagnostics/summary.json`, and
  `hf_dataset/dataset_infos.json`, and syncs the **Export bundle** line in
  `hf_dataset/README.md`

### Guidance for future entries

Record any change that affects downstream ML behaviour, including:

- Rule logic updates in `src/data/drugData.ts`
- `mechanism_category` taxonomy or inference changes
- `origin` classification behaviour
- New, removed, or retyped columns in `interaction_pairs` exports
- `SCHEMA_VERSION` or `DATASET_VERSION` bumps in `src/datasetVersion.ts`
