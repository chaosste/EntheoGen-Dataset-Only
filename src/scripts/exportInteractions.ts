import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  classifyMechanismCategory,
  DRUGS,
  LEGEND,
  type MechanismCategory,
  resolveInteraction,
  type RuleOrigin,
} from '../data/drugData.ts';

interface ExportRow {
  substance_a_id: string;
  substance_b_id: string;
  pair_key: string;
  origin: RuleOrigin;
  interaction_code: string;
  interaction_label: string | null;
  risk_scale: number | null;
  summary: string | null;
  confidence: string | null;
  mechanism: string | null;
  mechanism_category: MechanismCategory;
  timing: string | null;
  evidence_gaps: string | null;
  evidence_tier: string | null;
  field_notes: string | null;
  sources: string | null;
}

interface Manifest {
  generated_at: string;
  source_drug_count: number;
  pair_count: number;
  schema_version: 1;
  code_distribution: Record<string, number>;
  origin_distribution: Record<RuleOrigin, number>;
  mechanism_category_distribution: Record<MechanismCategory, number>;
  diagnostics_generated: true;
  slice_directory: 'slices/';
  validation_script: 'scripts/validateDataset.ts';
}

interface DiagnosticsSummary {
  total_rows: number;
  explicit_rows: number;
  fallback_rows: number;
  unknown_rows: number;
  self_rows: number;
  interaction_code_distribution: Record<string, number>;
  origin_distribution: Record<RuleOrigin, number>;
  mechanism_category_distribution: Record<MechanismCategory, number>;
}

interface RegressionSnapshot {
  total_rows: number;
  interaction_code_distribution: Record<string, number>;
  origin_distribution: Record<RuleOrigin, number>;
  mechanism_category_distribution: Record<MechanismCategory, number>;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const exportDir = join(projectRoot, 'exports');
const hfDatasetDir = join(projectRoot, 'hf_dataset');
const diagnosticsDir = join(projectRoot, 'diagnostics');
const slicesDir = join(projectRoot, 'slices');

const csvColumns: Array<keyof ExportRow> = [
  'substance_a_id',
  'substance_b_id',
  'pair_key',
  'origin',
  'interaction_code',
  'interaction_label',
  'risk_scale',
  'summary',
  'confidence',
  'mechanism',
  'mechanism_category',
  'timing',
  'evidence_gaps',
  'evidence_tier',
  'field_notes',
  'sources',
];

const optionalText = (value: string | undefined): string | null => value ?? null;

const buildRow = (
  drugAId: string,
  drugBId: string,
): ExportRow => {
  const { evidence, origin, pairKey } = resolveInteraction(drugAId, drugBId);
  const legend = LEGEND[evidence.code];
  const mechanismCategory = classifyMechanismCategory(evidence.mechanism);

  return {
    substance_a_id: drugAId,
    substance_b_id: drugBId,
    pair_key: pairKey,
    origin,
    interaction_code: evidence.code,
    interaction_label: legend?.label ?? null,
    risk_scale: legend?.riskScale ?? null,
    summary: optionalText(evidence.summary),
    confidence: optionalText(evidence.confidence),
    mechanism: optionalText(evidence.mechanism),
    mechanism_category: mechanismCategory,
    timing: optionalText(evidence.timing),
    evidence_gaps: optionalText(evidence.evidenceGaps),
    evidence_tier: optionalText(evidence.evidenceTier),
    field_notes: optionalText(evidence.fieldNotes),
    sources: optionalText(evidence.sources),
  };
};

const generateRows = (): ExportRow[] => {
  const rows: ExportRow[] = [];

  for (let i = 0; i < DRUGS.length; i += 1) {
    for (let j = i; j < DRUGS.length; j += 1) {
      rows.push(buildRow(DRUGS[i].id, DRUGS[j].id));
    }
  }

  return rows;
};

const toJson = (rows: ExportRow[]): string => `${JSON.stringify(rows, null, 2)}\n`;
const toJsonl = (rows: ExportRow[]): string => {
  if (rows.length === 0) {
    return '';
  }

  return `${rows.map((row) => JSON.stringify(row)).join('\n')}\n`;
};

const escapeCsvValue = (value: string | number | boolean | null): string => {
  if (value === null) {
    return '';
  }

  const stringValue = String(value);
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

const toCsv = (rows: ExportRow[]): string => {
  const header = csvColumns.join(',');
  const body = rows.map((row) =>
    csvColumns.map((column) => escapeCsvValue(row[column])).join(','),
  );

  return `${[header, ...body].join('\n')}\n`;
};

const ensureDir = (path: string): void => {
  mkdirSync(path, { recursive: true });
};

const buildHistogram = (rows: ExportRow[]): Record<string, number> => {
  const histogram = new Map<string, number>();

  for (const row of rows) {
    histogram.set(row.interaction_code, (histogram.get(row.interaction_code) ?? 0) + 1);
  }

  return Object.fromEntries([...histogram.entries()].sort(([left], [right]) => left.localeCompare(right)));
};

const buildOriginDistribution = (rows: ExportRow[]): Record<RuleOrigin, number> => {
  const distribution: Record<RuleOrigin, number> = {
    explicit: 0,
    fallback: 0,
    unknown: 0,
    self: 0,
  };

  for (const row of rows) {
    distribution[row.origin] += 1;
  }

  return distribution;
};

const buildMechanismCategoryDistribution = (
  rows: ExportRow[],
): Record<MechanismCategory, number> => {
  const distribution: Record<MechanismCategory, number> = {
    serotonergic: 0,
    maoi: 0,
    qt_prolongation: 0,
    sympathomimetic: 0,
    cns_depressant: 0,
    anticholinergic: 0,
    dopaminergic: 0,
    glutamatergic: 0,
    gabaergic: 0,
    stimulant_stack: 0,
    psychedelic_potentiation: 0,
    cardiovascular_load: 0,
    unknown: 0,
  };

  for (const row of rows) {
    distribution[row.mechanism_category] += 1;
  }

  return distribution;
};

const writeExport = (filename: string, content: string): void => {
  writeFileSync(join(exportDir, filename), content, 'utf8');
};

const writeHfDatasetFile = (filename: string, content: string): void => {
  writeFileSync(join(hfDatasetDir, filename), content, 'utf8');
};

const writeDiagnosticsFile = (filename: string, content: string): void => {
  writeFileSync(join(diagnosticsDir, filename), content, 'utf8');
};

const writeSliceFile = (filename: string, content: string): void => {
  writeFileSync(join(slicesDir, filename), content, 'utf8');
};

const buildDiagnosticsSummary = (
  rows: ExportRow[],
  explicitOnlyRows: ExportRow[],
  fallbackOnlyRows: ExportRow[],
  unknownOnlyRows: ExportRow[],
  selfOnlyRows: ExportRow[],
): DiagnosticsSummary => ({
  total_rows: rows.length,
  explicit_rows: explicitOnlyRows.length,
  fallback_rows: fallbackOnlyRows.length,
  unknown_rows: unknownOnlyRows.length,
  self_rows: selfOnlyRows.length,
  interaction_code_distribution: buildHistogram(rows),
  origin_distribution: buildOriginDistribution(rows),
  mechanism_category_distribution: buildMechanismCategoryDistribution(rows),
});

const buildRegressionSnapshot = (
  summary: DiagnosticsSummary,
): RegressionSnapshot => ({
  total_rows: summary.total_rows,
  interaction_code_distribution: summary.interaction_code_distribution,
  origin_distribution: summary.origin_distribution,
  mechanism_category_distribution: summary.mechanism_category_distribution,
});

const toDistributionCsv = (
  summary: DiagnosticsSummary,
): string => {
  const lines = ['dimension,value,count'];
  const appendDistribution = (dimension: string, distribution: Record<string, number>): void => {
    for (const [value, count] of Object.entries(distribution)) {
      lines.push(`${dimension},${value},${count}`);
    }
  };

  appendDistribution('interaction_code', summary.interaction_code_distribution);
  appendDistribution('origin', summary.origin_distribution);
  appendDistribution('mechanism_category', summary.mechanism_category_distribution);

  return `${lines.join('\n')}\n`;
};

const main = (): void => {
  ensureDir(exportDir);
  ensureDir(hfDatasetDir);
  ensureDir(diagnosticsDir);
  ensureDir(slicesDir);
  rmSync(join(exportDir, 'interaction_pairs_explicit_or_fallback.jsonl'), { force: true });

  const rows = generateRows();
  const explicitOnlyRows = rows.filter((row) => row.origin === 'explicit');
  const fallbackOnlyRows = rows.filter((row) => row.origin === 'fallback');
  const unknownOnlyRows = rows.filter((row) => row.origin === 'unknown');
  const selfOnlyRows = rows.filter((row) => row.origin === 'self');
  const mechanismSlices: Record<MechanismCategory, ExportRow[]> = {
    serotonergic: rows.filter((row) => row.mechanism_category === 'serotonergic'),
    maoi: rows.filter((row) => row.mechanism_category === 'maoi'),
    qt_prolongation: rows.filter((row) => row.mechanism_category === 'qt_prolongation'),
    sympathomimetic: rows.filter((row) => row.mechanism_category === 'sympathomimetic'),
    cns_depressant: rows.filter((row) => row.mechanism_category === 'cns_depressant'),
    anticholinergic: rows.filter((row) => row.mechanism_category === 'anticholinergic'),
    dopaminergic: rows.filter((row) => row.mechanism_category === 'dopaminergic'),
    glutamatergic: rows.filter((row) => row.mechanism_category === 'glutamatergic'),
    gabaergic: rows.filter((row) => row.mechanism_category === 'gabaergic'),
    stimulant_stack: rows.filter((row) => row.mechanism_category === 'stimulant_stack'),
    psychedelic_potentiation: rows.filter((row) => row.mechanism_category === 'psychedelic_potentiation'),
    cardiovascular_load: rows.filter((row) => row.mechanism_category === 'cardiovascular_load'),
    unknown: rows.filter((row) => row.mechanism_category === 'unknown'),
  };
  const highRiskRows = rows.filter((row) => row.risk_scale !== null && row.risk_scale >= 4);
  const moderateRiskRows = rows.filter(
    (row) => row.risk_scale !== null && row.risk_scale >= 2 && row.risk_scale <= 3,
  );
  const lowRiskRows = rows.filter((row) => row.risk_scale !== null && row.risk_scale <= 1);
  const diagnosticsSummary = buildDiagnosticsSummary(
    rows,
    explicitOnlyRows,
    fallbackOnlyRows,
    unknownOnlyRows,
    selfOnlyRows,
  );
  const regressionSnapshot = buildRegressionSnapshot(diagnosticsSummary);

  writeExport('interaction_pairs.json', toJson(rows));
  writeExport('interaction_pairs.jsonl', toJsonl(rows));
  writeExport('interaction_pairs.csv', toCsv(rows));
  writeExport('interaction_pairs_explicit_only.jsonl', toJsonl(explicitOnlyRows));
  writeExport('interaction_pairs_fallback_only.jsonl', toJsonl(fallbackOnlyRows));
  writeExport('interaction_pairs_unknown_only.jsonl', toJsonl(unknownOnlyRows));
  writeExport('interaction_pairs_self_only.jsonl', toJsonl(selfOnlyRows));

  writeHfDatasetFile('train.jsonl', toJsonl(rows));
  writeHfDatasetFile('explicit.jsonl', toJsonl(explicitOnlyRows));
  writeHfDatasetFile('fallback.jsonl', toJsonl(fallbackOnlyRows));
  writeHfDatasetFile('unknown.jsonl', toJsonl(unknownOnlyRows));
  writeHfDatasetFile('self.jsonl', toJsonl(selfOnlyRows));
  writeHfDatasetFile(
    'dataset_infos.json',
    `${JSON.stringify(
      {
        entheogen_interactions: {
          description: 'Pairwise psychedelic interaction safety dataset with provenance-aware rule classification',
          citation: '',
          homepage: '',
          license: 'mit',
          features: {
            substance_a_id: 'string',
            substance_b_id: 'string',
            interaction_code: 'string',
            risk_scale: 'int32',
            origin: 'string',
            mechanism_category: 'string',
            confidence: 'string',
            evidence_tier: 'string',
          },
        },
      },
      null,
      2,
    )}\n`,
  );
  writeHfDatasetFile(
    'README.md',
    `# EntheoGen Interaction Dataset

This dataset contains pairwise interaction classifications between psychoactive substances.

Features:

- deterministic rule engine
- provenance-aware labels
- abstention-safe UNKNOWN class
- mechanism_category normalized labels
- explicit vs fallback separation

Splits:

train
explicit
fallback
unknown
self

Label fields:

interaction_code
risk_scale
origin
mechanism_category

Generated automatically from EntheoGen rule engine.
`,
  );

  writeDiagnosticsFile('summary.json', `${JSON.stringify(diagnosticsSummary, null, 2)}\n`);
  writeDiagnosticsFile('distributions.csv', toDistributionCsv(diagnosticsSummary));
  writeDiagnosticsFile(
    'regression_snapshot.json',
    `${JSON.stringify(regressionSnapshot, null, 2)}\n`,
  );

  for (const [mechanismCategory, sliceRows] of Object.entries(mechanismSlices)) {
    writeSliceFile(`mechanism_${mechanismCategory}.jsonl`, toJsonl(sliceRows));
  }

  writeSliceFile('high_risk.jsonl', toJsonl(highRiskRows));
  writeSliceFile('moderate_risk.jsonl', toJsonl(moderateRiskRows));
  writeSliceFile('low_risk.jsonl', toJsonl(lowRiskRows));
  writeSliceFile('origin_explicit.jsonl', toJsonl(explicitOnlyRows));
  writeSliceFile('origin_fallback.jsonl', toJsonl(fallbackOnlyRows));
  writeSliceFile('origin_unknown.jsonl', toJsonl(unknownOnlyRows));
  writeSliceFile('origin_self.jsonl', toJsonl(selfOnlyRows));

  const manifest: Manifest = {
    generated_at: new Date().toISOString(),
    source_drug_count: DRUGS.length,
    pair_count: rows.length,
    schema_version: 1,
    code_distribution: diagnosticsSummary.interaction_code_distribution,
    origin_distribution: diagnosticsSummary.origin_distribution,
    mechanism_category_distribution: diagnosticsSummary.mechanism_category_distribution,
    diagnostics_generated: true,
    slice_directory: 'slices/',
    validation_script: 'scripts/validateDataset.ts',
  };

  writeExport('manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(
    JSON.stringify(
      {
        export_dir: exportDir,
        source_drug_count: DRUGS.length,
        pair_count: rows.length,
        explicit_only_count: explicitOnlyRows.length,
        fallback_only_count: fallbackOnlyRows.length,
        unknown_only_count: unknownOnlyRows.length,
        self_only_count: selfOnlyRows.length,
      },
      null,
      2,
    ),
  );
};

main();
