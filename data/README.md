# Data Dictionary — `entheogens.csv`

This file describes the schema (columns) of the main dataset file `entheogens.csv`.

## Column Definitions

| Column | Type | Description |
|--------|------|-------------|
| `id` | Integer | Unique row identifier |
| `common_name` | String | Widely recognised common name(s) of the entheogen |
| `scientific_name` | String | Binomial nomenclature; multiple names separated by commas where several species are used interchangeably |
| `family` | String | Taxonomic family; multiple listed where the entry covers more than one species |
| `type` | String | Biological category: *Fungus*, *Plant*, *Cactus*, *Amphibian*, or *Synthetic compound* |
| `primary_active_compounds` | String | Principal psychoactive compound(s) responsible for entheogenic effects |
| `traditional_cultures` | String | Indigenous or traditional cultures documented as using this substance |
| `geographic_origin` | String | Region(s) of traditional or natural origin |
| `traditional_use` | String | Documented ritual, ceremonial, or spiritual contexts of use |
| `preparation_method` | String | Common traditional method(s) of preparation and administration |
| `legal_status_us` | String | Legal classification in the United States at federal level (as of dataset creation) |
| `legal_status_un` | String | Scheduling status under United Nations conventions |
| `first_documented_use_century` | String | Earliest documented or archaeologically evidenced use, with supporting context |
| `notable_research` | String | Key academic publications, clinical studies, or researchers associated with this substance |
| `notes` | String | Additional context, etymology, or clarifications |

## Notes on Coverage

- This dataset focuses on **traditionally used** entheogenic substances with documented cultural and archaeological evidence.
- Purely synthetic compounds (e.g., LSD) are excluded unless closely associated with a naturally occurring entheogen (e.g., synthetic mescaline is included as an adjunct entry to the peyote and cactus rows it relates to).
- Legal status information reflects the best available information at the time of dataset creation and **may change**. It is provided for academic context only and should not be relied upon as legal advice.
- Where traditional use is contested or uncertain, this is noted in the `notes` column.
