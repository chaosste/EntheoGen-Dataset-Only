import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  classifyMechanismCategory,
  LEGEND,
  resolveInteraction,
} from '../data/drugData.ts';
import {
  getFixtureNameFromPath,
  parseCliArgs,
  readJsonlFile,
  scorePredictionsFile,
  type FixtureRow,
  type PredictionRow,
  writeJsonlFile,
} from './lib/evalUtils.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const resultsDir = join(projectRoot, 'evals', 'results');

export const runOracleBaseline = (
  fixturesPathInput: string,
  outPathInput?: string,
): {
  fixtureName: string;
  caseCount: number;
  predictionsPath: string;
  reportPath: string;
} => {
  const fixturesPath = resolve(projectRoot, fixturesPathInput);
  const fixtureName = getFixtureNameFromPath(fixturesPath);
  const reportPath = outPathInput
    ? resolve(projectRoot, outPathInput)
    : join(resultsDir, `oracle_${fixtureName}_report.json`);
  const predictionsPath = join(dirname(reportPath), `oracle_${fixtureName}_predictions.jsonl`);
  const fixtures = readJsonlFile<FixtureRow>(fixturesPath);
  const predictions: PredictionRow[] = fixtures.map((fixture) => {
    const { evidence, origin } = resolveInteraction(
      fixture.substance_a_id,
      fixture.substance_b_id,
    );

    return {
      id: fixture.id,
      predicted_interaction_code: evidence.code,
      predicted_origin: origin,
      predicted_mechanism_category: classifyMechanismCategory(evidence.mechanism),
      predicted_risk_scale: LEGEND[evidence.code]?.riskScale ?? undefined,
    };
  });

  writeJsonlFile(predictionsPath, predictions);
  scorePredictionsFile(fixturesPath, predictionsPath, reportPath);

  return {
    fixtureName,
    caseCount: fixtures.length,
    predictionsPath,
    reportPath,
  };
};

const main = (): void => {
  const args = parseCliArgs(process.argv.slice(2));
  const fixturesPath = args.fixtures;

  if (!fixturesPath) {
    throw new Error(
      'Usage: tsx scripts/runOracleBaseline.ts --fixtures <path> [--out <path>]',
    );
  }

  const result = runOracleBaseline(fixturesPath, args.out);

  console.log(
    JSON.stringify(
      {
        fixture_name: result.fixtureName,
        case_count: result.caseCount,
        predictions_path: relative(projectRoot, result.predictionsPath),
        report_path: relative(projectRoot, result.reportPath),
      },
      null,
      2,
    ),
  );
};

if (process.argv[1] && resolve(process.argv[1]) === __filename) {
  main();
}
