import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { manualFileAdapter } from './adapters/manualFileAdapter.ts';
import { openaiCompatibleAdapter } from './adapters/openaiCompatibleAdapter.ts';
import { oracleAdapter } from './adapters/oracleAdapter.ts';
import { shellCommandAdapter } from './adapters/shellCommandAdapter.ts';
import {
  ensureDir,
  parseCliArgs,
  readJsonFile,
  readJsonlFile,
  scorePredictionsFile,
  type ExperimentManifest,
  type ExperimentOutputManifest,
  type FixtureRow,
  writeJsonFile,
  writeJsonlFile,
} from './lib/evalUtils.ts';
import type { ProviderAdapter } from './lib/providerTypes.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

const getAdapter = (adapterName: ExperimentManifest['adapter']): ProviderAdapter => {
  switch (adapterName) {
    case 'manual-file':
      return manualFileAdapter;
    case 'shell-command':
      return shellCommandAdapter;
    case 'openai-compatible':
      return openaiCompatibleAdapter;
    case 'oracle':
      return oracleAdapter;
    default:
      throw new Error(`Unsupported adapter: ${adapterName}`);
  }
};

export const runExperimentManifest = async (
  manifestPathInput: string,
): Promise<ExperimentOutputManifest> => {
  const manifestPath = resolve(projectRoot, manifestPathInput);
  const manifest = readJsonFile<ExperimentManifest>(manifestPath);
  const fixturePath = resolve(projectRoot, manifest.fixture_path);
  const fixtures = readJsonlFile<FixtureRow>(fixturePath);
  const outDir = resolve(projectRoot, manifest.out_dir);
  const predictionsPath = join(outDir, 'predictions.jsonl');
  const reportPath = join(outDir, 'report.json');
  const outputManifestPath = join(outDir, 'manifest.json');
  const adapter = getAdapter(manifest.adapter);

  ensureDir(outDir);

  const predictions = await adapter.run(fixtures, {
    ...manifest.adapter_options,
    predictions_path: manifest.predictions_path
      ? resolve(projectRoot, manifest.predictions_path)
      : undefined,
  });

  writeJsonlFile(predictionsPath, predictions);
  scorePredictionsFile(fixturePath, predictionsPath, reportPath);

  const outputManifest: ExperimentOutputManifest = {
    generated_at: new Date().toISOString(),
    run_name: manifest.run_name,
    adapter: manifest.adapter,
    fixture_path: manifest.fixture_path,
    total_cases: fixtures.length,
    predictions_path: relative(projectRoot, predictionsPath),
    report_path: relative(projectRoot, reportPath),
  };

  writeJsonFile(outputManifestPath, outputManifest);

  return outputManifest;
};

const main = async (): Promise<void> => {
  const args = parseCliArgs(process.argv.slice(2));
  const manifestPath = args.manifest;

  if (!manifestPath) {
    throw new Error('Usage: tsx scripts/runExperiment.ts --manifest evals/runs/<name>.json');
  }

  const result = await runExperimentManifest(manifestPath);

  console.log(JSON.stringify(result, null, 2));
};

if (process.argv[1] && resolve(process.argv[1]) === __filename) {
  await main();
}
