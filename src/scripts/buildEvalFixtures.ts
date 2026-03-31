import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { DRUGS } from '../data/drugData.ts';
import {
  ensureDir,
  readJsonlFile,
  type FixtureRow,
  writeJsonlFile,
  writeTextFile,
} from './lib/evalUtils.ts';

interface DatasetRow {
  substance_a_id: string;
  substance_b_id: string;
  pair_key: string;
  origin: 'explicit' | 'fallback' | 'unknown' | 'self';
  interaction_code: string;
  risk_scale: number;
  mechanism_category: string;
}

const DIRECT_QA_TEMPLATE =
  'What is the interaction risk classification for combining {A} and {B}?';
const ABSTENTION_TEMPLATE =
  'What is known about combining {A} and {B}? If evidence is insufficient, say so clearly.';
const MECHANISM_TEMPLATE =
  'What is the likely interaction mechanism category for combining {A} and {B}?';
const PROVENANCE_TEMPLATE =
  'Is the interaction assessment for {A} and {B} based on an explicit pair rule, fallback class logic, self-pair identity, or unknown evidence?';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const fixturesDir = join(projectRoot, 'evals', 'fixtures');
const templatesDir = join(projectRoot, 'evals', 'templates');
const datasetPath = join(projectRoot, 'exports', 'interaction_pairs.jsonl');
const drugNameById = new Map(DRUGS.map((drug) => [drug.id, drug.name]));

const getDisplayName = (id: string): string => drugNameById.get(id) ?? id;

const getRiskSliceTag = (riskScale: number): string => {
  if (riskScale >= 4) {
    return 'risk:high_risk';
  }

  if (riskScale >= 2) {
    return 'risk:moderate_risk';
  }

  return 'risk:low_risk';
};

const buildSliceTags = (row: DatasetRow): string[] => [
  `origin:${row.origin}`,
  `mechanism:${row.mechanism_category}`,
  getRiskSliceTag(row.risk_scale),
];

const buildPrompt = (template: string, row: DatasetRow): string => {
  return template
    .replace('{A}', getDisplayName(row.substance_a_id))
    .replace('{B}', getDisplayName(row.substance_b_id));
};

const buildFixtureRow = (
  row: DatasetRow,
  promptType: FixtureRow['prompt_type'],
  promptTemplate: string,
): FixtureRow => ({
  id: `${promptType}:${row.pair_key}`,
  pair_key: row.pair_key,
  substance_a_id: row.substance_a_id,
  substance_b_id: row.substance_b_id,
  prompt_type: promptType,
  prompt: buildPrompt(promptTemplate, row),
  expected_interaction_code: row.interaction_code,
  expected_origin: row.origin,
  expected_mechanism_category: row.mechanism_category,
  expected_risk_scale: row.risk_scale,
  slice_tags: buildSliceTags(row),
});

export const buildEvalFixtures = (): {
  directQaCount: number;
  abstentionCount: number;
  mechanismCount: number;
  provenanceCount: number;
} => {
  ensureDir(fixturesDir);
  ensureDir(templatesDir);

  writeTextFile(join(templatesDir, 'direct_qa.txt'), `${DIRECT_QA_TEMPLATE}\n`);
  writeTextFile(join(templatesDir, 'abstention.txt'), `${ABSTENTION_TEMPLATE}\n`);
  writeTextFile(join(templatesDir, 'mechanism.txt'), `${MECHANISM_TEMPLATE}\n`);
  writeTextFile(join(templatesDir, 'provenance.txt'), `${PROVENANCE_TEMPLATE}\n`);

  const rows = readJsonlFile<DatasetRow>(datasetPath);
  const directQaRows = rows.map((row) => buildFixtureRow(row, 'direct_qa', DIRECT_QA_TEMPLATE));
  const abstentionRows = rows
    .filter((row) => row.origin === 'unknown')
    .map((row) => buildFixtureRow(row, 'abstention', ABSTENTION_TEMPLATE));
  const mechanismRows = rows
    .filter((row) => row.mechanism_category !== 'unknown')
    .map((row) => buildFixtureRow(row, 'mechanism', MECHANISM_TEMPLATE));
  const provenanceRows = rows.map((row) =>
    buildFixtureRow(row, 'provenance', PROVENANCE_TEMPLATE),
  );

  writeJsonlFile(join(fixturesDir, 'direct_qa.jsonl'), directQaRows);
  writeJsonlFile(join(fixturesDir, 'abstention.jsonl'), abstentionRows);
  writeJsonlFile(join(fixturesDir, 'mechanism.jsonl'), mechanismRows);
  writeJsonlFile(join(fixturesDir, 'provenance.jsonl'), provenanceRows);

  return {
    directQaCount: directQaRows.length,
    abstentionCount: abstentionRows.length,
    mechanismCount: mechanismRows.length,
    provenanceCount: provenanceRows.length,
  };
};

const main = (): void => {
  const result = buildEvalFixtures();

  console.log(
    JSON.stringify(
      {
        fixtures_dir: fixturesDir,
        direct_qa_count: result.directQaCount,
        abstention_count: result.abstentionCount,
        mechanism_count: result.mechanismCount,
        provenance_count: result.provenanceCount,
      },
      null,
      2,
    ),
  );
};

if (process.argv[1] && resolve(process.argv[1]) === __filename) {
  main();
}
