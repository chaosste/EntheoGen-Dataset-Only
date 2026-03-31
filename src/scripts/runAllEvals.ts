import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

import { buildEvalFixtures } from './buildEvalFixtures.ts';
import { ensureDir, writeJsonFile } from './lib/evalUtils.ts';
import { runOracleBaseline } from './runOracleBaseline.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const fixturesDir = join(projectRoot, 'evals', 'fixtures');
const resultsDir = join(projectRoot, 'evals', 'results');
const fixtureFileNames = ['direct_qa', 'abstention', 'mechanism', 'provenance'];

const main = (): void => {
  buildEvalFixtures();
  ensureDir(resultsDir);

  const fixtures = fixtureFileNames.map((fixtureName) => {
    const fixturePath = join(fixturesDir, `${fixtureName}.jsonl`);
    const result = runOracleBaseline(
      relative(projectRoot, fixturePath),
      `evals/results/oracle_${fixtureName}_report.json`,
    );

    return {
      fixture_name: fixtureName,
      case_count: result.caseCount,
      predictions_path: relative(projectRoot, result.predictionsPath),
      report_path: relative(projectRoot, result.reportPath),
    };
  });

  const indexPath = join(resultsDir, 'index.json');
  writeJsonFile(indexPath, {
    generated_at: new Date().toISOString(),
    fixtures,
  });

  console.log(
    JSON.stringify(
      {
        index_path: relative(projectRoot, indexPath),
        fixture_count: fixtures.length,
      },
      null,
      2,
    ),
  );
};

if (process.argv[1] && resolve(process.argv[1]) === __filename) {
  main();
}
