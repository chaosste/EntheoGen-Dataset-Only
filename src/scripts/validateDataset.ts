import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { LEGEND } from '../data/drugData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const datasetPath = join(projectRoot, 'exports', 'interaction_pairs.jsonl');

const validOrigins = new Set(['explicit', 'fallback', 'unknown', 'self']);
const validMechanismCategories = new Set([
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
  'unknown',
]);
const validInteractionCodes = new Set(Object.keys(LEGEND));
const requiredFields = [
  'substance_a_id',
  'substance_b_id',
  'pair_key',
  'origin',
  'interaction_code',
  'risk_scale',
] as const;

const rawContent = readFileSync(datasetPath, 'utf8');
const lines = rawContent.split('\n').filter((line) => line.trim().length > 0);
const seenPairKeys = new Set<string>();
const errors: string[] = [];

for (let index = 0; index < lines.length; index += 1) {
  let row: Record<string, unknown>;

  try {
    row = JSON.parse(lines[index]) as Record<string, unknown>;
  } catch (error) {
    errors.push(`Line ${index + 1}: invalid JSON (${String(error)})`);
    continue;
  }

  for (const field of requiredFields) {
    if (
      !(field in row) ||
      row[field] === null ||
      row[field] === undefined ||
      row[field] === ''
    ) {
      errors.push(`Line ${index + 1}: missing required field "${field}"`);
    }
  }

  const pairKey = row.pair_key;
  if (typeof pairKey === 'string') {
    if (seenPairKeys.has(pairKey)) {
      errors.push(`Line ${index + 1}: duplicate pair_key "${pairKey}"`);
    } else {
      seenPairKeys.add(pairKey);
    }
  }

  if (typeof row.origin !== 'string' || !validOrigins.has(row.origin)) {
    errors.push(`Line ${index + 1}: invalid origin "${String(row.origin)}"`);
  }

  if (
    typeof row.interaction_code !== 'string' ||
    !validInteractionCodes.has(row.interaction_code)
  ) {
    errors.push(
      `Line ${index + 1}: invalid interaction_code "${String(row.interaction_code)}"`,
    );
  }

  if (
    typeof row.mechanism_category !== 'string' ||
    !validMechanismCategories.has(row.mechanism_category)
  ) {
    errors.push(
      `Line ${index + 1}: invalid mechanism_category "${String(row.mechanism_category)}"`,
    );
  }

  if (typeof row.risk_scale !== 'number' || Number.isNaN(row.risk_scale)) {
    errors.push(`Line ${index + 1}: risk_scale is not numeric`);
  }
}

if (errors.length > 0) {
  console.error('Dataset validation failed.');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      dataset: datasetPath,
      rows_validated: lines.length,
      unique_pair_keys: seenPairKeys.size,
      status: 'ok',
    },
    null,
    2,
  ),
);
