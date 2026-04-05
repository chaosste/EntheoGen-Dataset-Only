import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { LEGEND } from '../data/drugData.ts';
import { resolveSources } from '../data/sourceRegistry.ts';

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

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === 'string' && entry.length > 0);

const sameStringArray = (left: string[] | null, right: string[] | null): boolean => {
  if (left === null && right === null) {
    return true;
  }

  if (!left || !right || left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
};

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

  const sources = typeof row.sources === 'string' ? row.sources : null;
  const expectedSourceResolution = resolveSources(sources);

  if (expectedSourceResolution.unresolvedLabels.length > 0) {
    errors.push(
      `Line ${index + 1}: unresolved source labels (${expectedSourceResolution.unresolvedLabels.join(', ')})`,
    );
  }

  const sourceRefs = row.source_refs;
  if (sourceRefs === null || sourceRefs === undefined) {
    if (expectedSourceResolution.sourceIds !== null) {
      errors.push(`Line ${index + 1}: missing source_refs for populated sources`);
    }
  } else if (!isStringArray(sourceRefs)) {
    errors.push(`Line ${index + 1}: source_refs must be an array of non-empty strings`);
  } else {
    const uniqueRefs = [...new Set(sourceRefs)].sort((left, right) => left.localeCompare(right));
    if (uniqueRefs.length !== sourceRefs.length) {
      errors.push(`Line ${index + 1}: source_refs contains duplicates`);
    }
    if (!sameStringArray(uniqueRefs, expectedSourceResolution.sourceIds)) {
      errors.push(`Line ${index + 1}: source_refs do not match canonical registry mapping`);
    }
  }

  const sourceFingerprint = row.source_fingerprint;
  if (sourceFingerprint === null || sourceFingerprint === undefined) {
    if (expectedSourceResolution.sourceFingerprint !== null) {
      errors.push(`Line ${index + 1}: missing source_fingerprint for populated sources`);
    }
  } else if (typeof sourceFingerprint !== 'string' || sourceFingerprint.length === 0) {
    errors.push(`Line ${index + 1}: source_fingerprint must be a non-empty string when present`);
  } else if (sourceFingerprint !== expectedSourceResolution.sourceFingerprint) {
    errors.push(`Line ${index + 1}: source_fingerprint does not match canonical source_refs hash`);
  }

  if (expectedSourceResolution.sourceIds?.includes('source_gap')) {
    if (row.origin !== 'unknown' || row.interaction_code !== 'UNK') {
      errors.push(
        `Line ${index + 1}: source-gap placeholder is only valid for unknown/UNK rows`,
      );
    }
  }

  if (expectedSourceResolution.sourceIds?.includes('not_available')) {
    if (row.origin !== 'self' || row.interaction_code !== 'SELF') {
      errors.push(
        `Line ${index + 1}: n/a placeholder is only valid for self/SELF rows`,
      );
    }
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
