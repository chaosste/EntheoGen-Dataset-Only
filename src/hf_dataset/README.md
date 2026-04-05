# EntheoGen Interaction Dataset

<!-- markdownlint-disable-next-line MD013 -->
**Export bundle:** dataset version `v2.1.0` · generated `2026-04-05T03:26:53.833Z` · schema version `1`

The line above is refreshed when you run `npm run export:interactions` from `src/`
(see `src/datasetVersion.ts` for the canonical version).

Repository: [chaosste/EntheoGen](https://github.com/chaosste/EntheoGen) (change
if you mirror elsewhere).

---

## Dataset Description

This is a **rule-based pharmacological interaction classification** dataset for
psychoactive substances. Each row is an **unordered substance pair** represented
with stable IDs (`substance_a_id`, `substance_b_id`, `pair_key`); treat
`(A, B)` as equivalent to `(B, A)` for modelling unless your protocol defines a
canonical ordering.

Labels are **provenance-aware**: the exporter records whether a row came from an
explicit curated rule, a fallback path, an abstention-style unknown, or a
diagonal self-pair. The **UNKNOWN** interaction class means **insufficient
evidence in the current rule set**, not a claim that a combination is safe.

---

## Label Definitions

### `interaction_code`

Short code for the interaction category (e.g. low risk, caution,
contraindicated, unknown). Maps to human-readable text in the parent
application’s legend; in this bundle see `interaction_label` on each row.

### `origin`

How the label was produced:

- **`explicit`** — matched a specific curated rule
- **`fallback`** — derived from class-level or default logic
- **`unknown`** — abstention / insufficient rule coverage
- **`self`** — diagonal pair (same substance twice); not a combination

### `mechanism_category`

A **normalized mechanistic bucket** inferred from free-text mechanism notes
(e.g. serotonergic, MAOI-related, cardiovascular load). Used for analysis and
multi-task benchmarks—not a substitute for full pharmacology review.

### `risk_scale`

**Ordinal** integer scale aligned with the rule engine’s risk rubric (including
sentinel values for unknown/self where applicable). It is **not** a calibrated
clinical probability, population incidence, or continuous pharmacodynamic
measure.

**Important:** **`UNKNOWN` / high `UNK` prevalence means “no dedicated rule,”
not “safe.”** Do not invert abstention as a benign class without explicit
protocol design.

### `sources`, `source_refs`, `source_fingerprint`, `evidence_tier`, `field_notes`

`sources` is raw curation traceability text (working labels, filenames,
annotated slide references). Export generation resolves these labels into
canonical IDs in `source_refs` and emits a deterministic
`source_fingerprint` hash.

Canonical mapping metadata is published in `src/exports/source_registry.json`
for reproducibility and deduplication checks.

`evidence_tier` and `field_notes` remain **internal curation qualifiers**, not
bibliographic metadata.

For citing **this dataset release**, use [`CITATION.cff`](../../CITATION.cff) at
the repository root—not row-level `sources` text.

---

## Dataset Splits

JSONL files mirror `src/exports/` slices:

| File | Contents |
| --- | --- |
| `train.jsonl` | Full pairwise grid (all rows) |
| `explicit.jsonl` | Rows with `origin === "explicit"` |
| `fallback.jsonl` | Rows with `origin === "fallback"` |
| `unknown.jsonl` | Rows with `origin === "unknown"` |
| `self.jsonl` | Rows with `origin === "self"` |

Row schema matches `exports/interaction_pairs.jsonl`. A JSON Schema for core
fields lives at `schemas/interaction_pair.schema.json` in the repository root.

---

## Intended Use

**Allowed (research / ML):**

- Benchmarking **structured reasoning** and tabular classification under clear
  provenance constraints
- **Abstention-aware** learning (explicit unknown / fallback handling)
- **Mechanism-oriented** prediction tasks using `mechanism_category`
- **Provenance prediction** (e.g. explicit vs fallback vs unknown)

**Not intended:**

- Dosing, timing, or administration advice
- Medical decision support or clinical workflows
- “Risk optimisation” or harm-reduction engineering for real-world use

---

## Limitations

- **Coverage is rule-defined**, not exhaustive of real-world polysubstance use.
- Labels reflect **deterministic pharmacology-style logic** and curation, not
  outcome incidence from trials or registries.
- **Do not** treat the dataset as complete toxicology or contraindication
  reference material.

To cite **this dataset** (the release), use `CITATION.cff` at the repository
root and the **Citation** section in the main `README.md`. That is separate
from per-row `sources` strings above.
