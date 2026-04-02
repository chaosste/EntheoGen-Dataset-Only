# Entheogen Dataset

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

An open-source academic research dataset cataloguing entheogens — psychoactive
substances with documented traditional, ceremonial, or spiritual use. This
dataset is maintained as a standalone repository for transparency and
independent reuse.

**Live demos:**
[www.entheogen.newpsychonaut.com](https://www.entheogen.newpsychonaut.com/) ·
[www.entheogen.azurewebsites.net](https://entheogen.azurewebsites.net)

---

## EntheoGen: architecture, purpose, and goals

**Architecture.** This repository is the standalone **dataset** package for
EntheoGen: entheogen rows live in `data/`, while `src/` holds interaction rules
in `drugData.ts`, generated JSONL/CSV exports, validation, and evaluation
artefacts—see [Repository contents](#repository-contents).

**Purpose.** The material here is split out from a larger application and
published independently to:

- Support **open-source use** by researchers, educators, and developers
- Provide **project transparency** for the parent application that consumes it
- Serve as a stable, version-controlled reference for academic work

**Goals.** Keep interaction outputs **reproducible from source**, preserve clear
**provenance** (how each pair was classified), and support **open research** on
interaction safety without shipping the full application.

---

## Repository contents

```text
data/
  entheogens.csv    — Catalogue of entheogens (one row per substance)
  README.md         — Data dictionary for entheogens.csv
src/
  data/
    drugData.ts     — Source definitions used to build interaction exports
  exports/          — Generated interaction_pairs.* (JSON, JSONL, CSV) and slices
  hf_dataset/       — Hugging Face–style JSONL splits (train, explicit, …)
  diagnostics/      — Export-time distribution summaries
  slices/           — Pre-cut JSONL slices (risk, mechanism, origin)
  evals/            — Experiment fixtures, results, leaderboard, adapters
  scripts/          — export, validate, Postgres import, eval runners
  package.json      — npm scripts (see Usage below)
LICENSE             — MIT licence
README.md           — This file
```

---

## Dataset overview

### Entheogen catalogue (`data/entheogens.csv`)

The CSV currently contains **12** substance rows (and growing) covering:

| Field | Description |
| --- | --- |
| Common & scientific names | Identifying names across languages/taxonomies |
| Taxonomy | Family, type (plant / fungus / synthetic / etc.) |
| Active compounds | Primary psychoactive constituents |
| Traditional use | Cultures, geographic origins, ceremonial context |
| Preparation | Traditional methods of preparation and administration |
| Legal status | US federal and UN treaty classification |
| Historical record | Earliest documented or archaeological evidence |
| Notable research | Key peer-reviewed publications and clinical trials |

See [`data/README.md`](data/README.md) for a full column-by-column data
dictionary.

### Interaction pairs (`src/exports/`)

Pairwise **interaction classifications** between substances (codes, risk scale,
mechanism category, provenance, evidence fields) are generated from
`src/data/drugData.ts` and written under `src/exports/` (for example
`interaction_pairs.jsonl`). See
[`src/hf_dataset/README.md`](src/hf_dataset/README.md) for the Hugging Face
bundle layout.

---

## Usage

### CSV catalogue

The entheogen table is a plain CSV for maximum compatibility:

```python
import csv

with open("data/entheogens.csv", newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row["common_name"], "—", row["primary_active_compounds"])
```

```js
const fs = require("fs");
const { parse } = require("csv-parse/sync");

const records = parse(fs.readFileSync("data/entheogens.csv"), {
  columns: true,
  skip_empty_lines: true,
});
console.log(records.map((r) => r.common_name));
```

### Tooling (from `src/`)

Install dependencies once: `npm install` inside `src/`.

| Script | Purpose |
| --- | --- |
| `npm run export:interactions` | Regenerate `exports/` from `drugData.ts` |
| `npm run validate:dataset` | Validate `exports/interaction_pairs.jsonl` |
| `npm run validate:schema` | JSON Schema check (`schemas/` at repo root) |
| `npm run import:interaction-pairs` | JSONL → Postgres; set `DATABASE_URL` |

For local Postgres without TLS, set `PGSSL=false`. Other `eval:*` scripts support
benchmarking and leaderboards (see
[`src/evals/README.md`](src/evals/README.md)).

---

## Disclaimer

This dataset is compiled for **academic and educational purposes only**. Legal
status information is provided as reference context and reflects best available
information at the time of dataset creation; it **may be out of date** and should
not be relied upon as legal advice. Nothing in this dataset constitutes
encouragement to use any controlled substance.

---

## Licence

[MIT](LICENSE) — © 2026 Steve Langsford Beale

You are free to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of this data, provided the copyright notice and licence are
included.

---

## Citation

If you use this repository in academic work, cite the **dataset release** using
[`CITATION.cff`](CITATION.cff) (Citation File Format). Update the version and
date there when you cut a new public release; the canonical interaction export
version also lives in [`src/datasetVersion.ts`](src/datasetVersion.ts).

**Row-level text is not a bibliography.** Fields such as `sources`,
`evidence_tier`, and `field_notes` in `interaction_pairs` exports are
**internal traceability** (working document labels, curator notes, filenames).
They are **not** peer-reviewed citations and should not be presented or
searched as such—see [`src/hf_dataset/README.md`](src/hf_dataset/README.md).

Dataset evolution for ML and reproducibility is summarised in
[`DATASET_CHANGELOG.md`](DATASET_CHANGELOG.md).

---

## Contributing

Corrections, additional entries, and updated citations are welcome. Please open
a pull request with a clear description of the change and a reference to a
peer-reviewed source.
