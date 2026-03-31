import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

interface RegressionSnapshot {
  total_rows: number;
  interaction_code_distribution: Record<string, number>;
  origin_distribution: Record<string, number>;
  mechanism_category_distribution: Record<string, number>;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const snapshotPath = join(projectRoot, 'diagnostics', 'regression_snapshot.json');
const summaryPath = join(projectRoot, 'diagnostics', 'summary.json');

const snapshot = JSON.parse(
  readFileSync(snapshotPath, 'utf8'),
) as RegressionSnapshot;
const summary = JSON.parse(
  readFileSync(summaryPath, 'utf8'),
) as RegressionSnapshot;

const compareDistribution = (
  label: string,
  left: Record<string, number>,
  right: Record<string, number>,
  differences: string[],
): void => {
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);

  for (const key of keys) {
    if ((left[key] ?? 0) !== (right[key] ?? 0)) {
      differences.push(
        `${label}.${key}: snapshot=${left[key] ?? 0}, summary=${right[key] ?? 0}`,
      );
    }
  }
};

const differences: string[] = [];

if (snapshot.total_rows !== summary.total_rows) {
  differences.push(`total_rows: snapshot=${snapshot.total_rows}, summary=${summary.total_rows}`);
}

compareDistribution(
  'interaction_code_distribution',
  snapshot.interaction_code_distribution,
  summary.interaction_code_distribution,
  differences,
);
compareDistribution(
  'origin_distribution',
  snapshot.origin_distribution,
  summary.origin_distribution,
  differences,
);
compareDistribution(
  'mechanism_category_distribution',
  snapshot.mechanism_category_distribution,
  summary.mechanism_category_distribution,
  differences,
);

if (differences.length > 0) {
  console.error('DATASET DISTRIBUTION DRIFT DETECTED');
  for (const difference of differences) {
    console.error(`- ${difference}`);
  }
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      snapshot: snapshotPath,
      summary: summaryPath,
      status: 'ok',
    },
    null,
    2,
  ),
);
