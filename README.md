<div align="center">
# entheogen-dataset

An open-source academic research dataset cataloguing entheogens — psychoactive substances with documented traditional, ceremonial, or spiritual use. This dataset is maintained as a standalone repository for transparency and independent reuse.

---

**Live demos:** 

[www.entheogen.newpsychonaut.com](https://www.entheogen.newpsychonaut.com/) 
· 
[www.entheogen.azurewebsites.net](https://entheogen.azurewebsites.net)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

  <img src="docs/assets/entheogen-asset-beta-0.1.gif" width="600" alt="EntheoGen release demo" />
</div>

---

## Purpose

This dataset is extracted from a larger application and published here independently to:

- Support **open-source use** by researchers, educators, and developers
- Provide **project transparency** for the parent application that consumes it
- Serve as a stable, version-controlled reference for academic work

---

## Repository Contents

```
data/
  entheogens.csv   — Main dataset (one row per entheogen)
  README.md        — Data dictionary (column definitions and schema notes)
LICENSE            — MIT Licence
README.md          — This file
```

---

## Dataset Overview

`data/entheogens.csv` contains **12 entries** (and growing) covering:

| Field | Description |
|-------|-------------|
| Common & scientific names | Identifying names across languages/taxonomies |
| Taxonomy | Family, type (plant / fungus / synthetic / etc.) |
| Active compounds | Primary psychoactive constituents |
| Traditional use | Documented cultures, geographic origins, ceremonial context |
| Preparation | Traditional methods of preparation and administration |
| Legal status | US federal and UN treaty classification |
| Historical record | Earliest documented or archaeological evidence |
| Notable research | Key peer-reviewed publications and clinical trials |

See [`data/README.md`](data/README.md) for a full column-by-column data dictionary.

---

## Usage

The dataset is provided as a plain CSV file for maximum compatibility:

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

---

## Disclaimer

This dataset is compiled for **academic and educational purposes only**. Legal status information is provided as reference context and reflects best available information at the time of dataset creation; it **may be out of date** and should not be relied upon as legal advice. Nothing in this dataset constitutes encouragement to use any controlled substance.

---

## Licence

[MIT](LICENSE) — © 2026 Steve Langsford Beale

You are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of this data, provided the copyright notice and licence are included.

---

## Contributing

Corrections, additional entries, and updated citations are welcome. Please open a pull request with a clear description of the change and a reference to a peer-reviewed source.

