import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import type { EvalPromptInput, PredictionRecord } from './providerTypes.ts';

export interface FixtureRow extends EvalPromptInput {
  id: string;
  pair_key: string;
  substance_a_id: string;
  substance_b_id: string;
  prompt_type: string;
  prompt: string;
  expected_interaction_code: string;
  expected_origin: string;
  expected_mechanism_category: string;
  expected_risk_scale: number;
  slice_tags: string[];
}

export type PredictionRow = PredictionRecord;

export interface EvalMetrics {
  total_cases: number;
  interaction_code_accuracy: number;
  origin_accuracy: number;
  mechanism_category_accuracy: number;
  risk_scale_exact_accuracy: number;
  risk_scale_mae: number | null;
  abstention_recall: number | null;
  hallucination_rate_on_unknown: number | null;
  explicit_rule_recall: number | null;
}

export interface EvalReport {
  fixture_name: string;
  total_cases: number;
  primary_metric_name: string;
  primary_metric_value: number | null;
  metrics: EvalMetrics;
  per_slice: Record<string, EvalMetrics>;
}

export interface ExperimentManifest {
  run_name: string;
  adapter: 'manual-file' | 'shell-command' | 'openai-compatible' | 'oracle';
  fixture_path: string;
  predictions_path?: string;
  out_dir: string;
  adapter_options?: Record<string, unknown>;
}

export interface ExperimentOutputManifest {
  generated_at: string;
  run_name: string;
  adapter: string;
  fixture_path: string;
  total_cases: number;
  predictions_path: string;
  report_path: string;
}

type ScoredCase = {
  fixture: FixtureRow;
  prediction?: PredictionRow;
};

const PRIMARY_METRIC_BY_FIXTURE: Record<string, string> = {
  direct_qa: 'interaction_code_accuracy',
  abstention: 'abstention_recall',
  mechanism: 'mechanism_category_accuracy',
  provenance: 'origin_accuracy',
};

export const ensureDir = (path: string): void => {
  mkdirSync(path, { recursive: true });
};

export const readJsonlFile = <T>(path: string): T[] => {
  const content = readFileSync(path, 'utf8');

  if (content.trim().length === 0) {
    return [];
  }

  return content
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as T);
};

export const writeJsonlFile = <T>(path: string, rows: T[]): void => {
  ensureDir(dirname(path));
  const content =
    rows.length === 0 ? '' : `${rows.map((row) => JSON.stringify(row)).join('\n')}\n`;
  writeFileSync(path, content, 'utf8');
};

export const writeJsonFile = (path: string, value: unknown): void => {
  ensureDir(dirname(path));
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};

export const writeTextFile = (path: string, value: string): void => {
  ensureDir(dirname(path));
  writeFileSync(path, value, 'utf8');
};

export const readJsonFile = <T>(path: string): T => {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
};

export const parseCliArgs = (argv: string[]): Record<string, string> => {
  const args: Record<string, string> = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (!arg.startsWith('--')) {
      continue;
    }

    const key = arg.slice(2);
    const value = argv[index + 1];

    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for argument --${key}`);
    }

    args[key] = value;
    index += 1;
  }

  return args;
};

export const getFixtureNameFromPath = (path: string): string => basename(path, '.jsonl');

export const sortLeaderboardRows = <
  T extends {
    primary_metric_value: number | null;
    interaction_code_accuracy: number | null;
    origin_accuracy: number | null;
  },
>(
  rows: T[],
): T[] => {
  return [...rows].sort((left, right) => {
    const primaryDelta = (right.primary_metric_value ?? -Infinity) - (left.primary_metric_value ?? -Infinity);
    if (primaryDelta !== 0) {
      return primaryDelta;
    }

    const interactionDelta =
      (right.interaction_code_accuracy ?? -Infinity) - (left.interaction_code_accuracy ?? -Infinity);
    if (interactionDelta !== 0) {
      return interactionDelta;
    }

    return (right.origin_accuracy ?? -Infinity) - (left.origin_accuracy ?? -Infinity);
  });
};

const safeRate = (numerator: number, denominator: number): number | null => {
  if (denominator === 0) {
    return null;
  }

  return numerator / denominator;
};

const computeRiskMae = (cases: ScoredCase[]): number | null => {
  let totalError = 0;
  let comparisons = 0;

  for (const { fixture, prediction } of cases) {
    if (typeof prediction?.predicted_risk_scale !== 'number') {
      continue;
    }

    totalError += Math.abs(prediction.predicted_risk_scale - fixture.expected_risk_scale);
    comparisons += 1;
  }

  if (comparisons === 0) {
    return null;
  }

  return totalError / comparisons;
};

const computeMetrics = (cases: ScoredCase[]): EvalMetrics => {
  const totalCases = cases.length;

  let interactionCodeCorrect = 0;
  let originCorrect = 0;
  let mechanismCorrect = 0;
  let riskExactCorrect = 0;

  let unknownCases = 0;
  let abstentionHits = 0;
  let hallucinationsOnUnknown = 0;

  let explicitCases = 0;
  let explicitHits = 0;

  for (const { fixture, prediction } of cases) {
    if (prediction?.predicted_interaction_code === fixture.expected_interaction_code) {
      interactionCodeCorrect += 1;
    }

    if (prediction?.predicted_origin === fixture.expected_origin) {
      originCorrect += 1;
    }

    if (
      prediction?.predicted_mechanism_category === fixture.expected_mechanism_category
    ) {
      mechanismCorrect += 1;
    }

    if (prediction?.predicted_risk_scale === fixture.expected_risk_scale) {
      riskExactCorrect += 1;
    }

    if (fixture.expected_origin === 'unknown') {
      unknownCases += 1;

      if (
        prediction?.predicted_origin === 'unknown' ||
        prediction?.predicted_interaction_code === 'UNK'
      ) {
        abstentionHits += 1;
      }

      if (
        (prediction?.predicted_origin !== undefined &&
          prediction.predicted_origin !== 'unknown') ||
        (prediction?.predicted_interaction_code !== undefined &&
          prediction.predicted_interaction_code !== 'UNK')
      ) {
        hallucinationsOnUnknown += 1;
      }
    }

    if (fixture.expected_origin === 'explicit') {
      explicitCases += 1;

      if (prediction?.predicted_origin === 'explicit') {
        explicitHits += 1;
      }
    }
  }

  return {
    total_cases: totalCases,
    interaction_code_accuracy: safeRate(interactionCodeCorrect, totalCases) ?? 0,
    origin_accuracy: safeRate(originCorrect, totalCases) ?? 0,
    mechanism_category_accuracy: safeRate(mechanismCorrect, totalCases) ?? 0,
    risk_scale_exact_accuracy: safeRate(riskExactCorrect, totalCases) ?? 0,
    risk_scale_mae: computeRiskMae(cases),
    abstention_recall: safeRate(abstentionHits, unknownCases),
    hallucination_rate_on_unknown: safeRate(hallucinationsOnUnknown, unknownCases),
    explicit_rule_recall: safeRate(explicitHits, explicitCases),
  };
};

const groupCasesBySlice = (cases: ScoredCase[]): Record<string, ScoredCase[]> => {
  const grouped = new Map<string, ScoredCase[]>();

  for (const scoredCase of cases) {
    for (const sliceTag of scoredCase.fixture.slice_tags) {
      const existingCases = grouped.get(sliceTag) ?? [];
      existingCases.push(scoredCase);
      grouped.set(sliceTag, existingCases);
    }
  }

  return Object.fromEntries(
    [...grouped.entries()].sort(([left], [right]) => left.localeCompare(right)),
  );
};

export const buildEvalReport = (
  fixtureName: string,
  fixtures: FixtureRow[],
  predictions: PredictionRow[],
): EvalReport => {
  const predictionsById = new Map(predictions.map((prediction) => [prediction.id, prediction]));
  const scoredCases: ScoredCase[] = fixtures.map((fixture) => ({
    fixture,
    prediction: predictionsById.get(fixture.id),
  }));
  const metrics = computeMetrics(scoredCases);
  const primaryMetricName =
    PRIMARY_METRIC_BY_FIXTURE[fixtureName] ?? 'interaction_code_accuracy';
  const perSlice = groupCasesBySlice(scoredCases);

  return {
    fixture_name: fixtureName,
    total_cases: fixtures.length,
    primary_metric_name: primaryMetricName,
    primary_metric_value: (metrics as Record<string, number | null>)[primaryMetricName] ?? null,
    metrics,
    per_slice: Object.fromEntries(
      Object.entries(perSlice).map(([sliceTag, sliceCases]) => [sliceTag, computeMetrics(sliceCases)]),
    ),
  };
};

export const scorePredictionsFile = (
  fixturesPath: string,
  predictionsPath: string,
  outPath: string,
): EvalReport => {
  const fixtures = readJsonlFile<FixtureRow>(fixturesPath);
  const predictions = readJsonlFile<PredictionRow>(predictionsPath);
  const report = buildEvalReport(getFixtureNameFromPath(fixturesPath), fixtures, predictions);

  writeJsonFile(outPath, report);

  return report;
};
