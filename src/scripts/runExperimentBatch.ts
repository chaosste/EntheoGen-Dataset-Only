import { readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { writeJsonFile } from './lib/evalUtils.ts';
import { runExperimentManifest } from './runExperiment.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const runsDir = join(projectRoot, 'evals', 'runs');
const resultsDir = join(projectRoot, 'evals', 'results');

const main = async (): Promise<void> => {
  const manifests = readdirSync(runsDir)
    .filter((filename) => filename.endsWith('.json'))
    .sort();

  const runs: Array<{
    run_name: string;
    status: 'ok' | 'error';
    manifest_path: string;
    report_path?: string;
    error?: string;
  }> = [];

  for (const manifestFilename of manifests) {
    const manifestPath = join(runsDir, manifestFilename);

    try {
      const result = await runExperimentManifest(relative(projectRoot, manifestPath));
      runs.push({
        run_name: result.run_name,
        status: 'ok',
        manifest_path: relative(projectRoot, manifestPath),
        report_path: result.report_path,
      });
    } catch (error) {
      runs.push({
        run_name: manifestFilename.replace(/\.json$/, ''),
        status: 'error',
        manifest_path: relative(projectRoot, manifestPath),
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const indexPath = join(resultsDir, 'batch_index.json');
  writeJsonFile(indexPath, {
    generated_at: new Date().toISOString(),
    runs,
  });

  console.log(
    JSON.stringify(
      {
        batch_index: relative(projectRoot, indexPath),
        run_count: runs.length,
      },
      null,
      2,
    ),
  );
};

if (process.argv[1] && resolve(process.argv[1]) === __filename) {
  await main();
}
