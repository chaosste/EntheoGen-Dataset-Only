import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseCliArgs, scorePredictionsFile } from './lib/evalUtils.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

const main = (): void => {
  const args = parseCliArgs(process.argv.slice(2));
  const fixturesPath = args.fixtures ? resolve(projectRoot, args.fixtures) : undefined;
  const predictionsPath = args.predictions ? resolve(projectRoot, args.predictions) : undefined;
  const outPath = args.out ? resolve(projectRoot, args.out) : undefined;

  if (!fixturesPath || !predictionsPath || !outPath) {
    throw new Error(
      'Usage: tsx scripts/scorePredictions.ts --fixtures <path> --predictions <path> --out <path>',
    );
  }

  const report = scorePredictionsFile(fixturesPath, predictionsPath, outPath);

  console.log(
    JSON.stringify(
      {
        report_path: outPath,
        fixture_name: report.fixture_name,
        total_cases: report.total_cases,
        primary_metric_name: report.primary_metric_name,
        primary_metric_value: report.primary_metric_value,
      },
      null,
      2,
    ),
  );
};

if (process.argv[1] && resolve(process.argv[1]) === __filename) {
  main();
}
