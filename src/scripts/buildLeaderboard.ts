import { readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  readJsonFile,
  sortLeaderboardRows,
  writeJsonFile,
  writeTextFile,
  type EvalReport,
  type ExperimentOutputManifest,
} from './lib/evalUtils.ts';

interface LeaderboardRow {
  run_name: string;
  adapter: string;
  fixture_name: string;
  total_cases: number;
  primary_metric_name: string;
  primary_metric_value: number | null;
  interaction_code_accuracy: number;
  origin_accuracy: number;
  mechanism_category_accuracy: number;
  risk_scale_exact_accuracy: number;
  risk_scale_mae: number | null;
  abstention_recall: number | null;
  hallucination_rate_on_unknown: number | null;
  explicit_rule_recall: number | null;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const resultsDir = join(projectRoot, 'evals', 'results');
const leaderboardDir = join(projectRoot, 'evals', 'leaderboard');

const walkReportFiles = (path: string): string[] => {
  const entries = readdirSync(path).sort();
  const reportFiles: string[] = [];

  for (const entry of entries) {
    const fullPath = join(path, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      reportFiles.push(...walkReportFiles(fullPath));
      continue;
    }

    if (entry === 'report.json' || entry.endsWith('_report.json')) {
      reportFiles.push(fullPath);
    }
  }

  return reportFiles;
};

const inferRunMetadata = (
  reportPath: string,
): { run_name: string; adapter: string } => {
  const manifestPath = join(dirname(reportPath), 'manifest.json');

  try {
    const manifest = readJsonFile<ExperimentOutputManifest>(manifestPath);
    return {
      run_name: manifest.run_name,
      adapter: manifest.adapter,
    };
  } catch {
    const reportFileName = reportPath.split('/').pop() ?? 'unknown_report.json';
    const baseName = reportFileName.replace(/_report\.json$/, '');

    if (baseName.startsWith('oracle_')) {
      return {
        run_name: baseName,
        adapter: 'oracle',
      };
    }

    return {
      run_name: baseName,
      adapter: 'unknown',
    };
  }
};

const toCsv = (rows: LeaderboardRow[]): string => {
  const header = [
    'run_name',
    'adapter',
    'fixture_name',
    'total_cases',
    'primary_metric_name',
    'primary_metric_value',
    'interaction_code_accuracy',
    'origin_accuracy',
    'mechanism_category_accuracy',
    'risk_scale_exact_accuracy',
    'risk_scale_mae',
    'abstention_recall',
    'hallucination_rate_on_unknown',
    'explicit_rule_recall',
  ];

  const body = rows.map((row) =>
    header
      .map((key) => {
        const value = row[key as keyof LeaderboardRow];
        return value === null || value === undefined ? '' : String(value);
      })
      .join(','),
  );

  return `${[header.join(','), ...body].join('\n')}\n`;
};

const main = (): void => {
  const reportPaths = walkReportFiles(resultsDir);
  const rows = reportPaths.map((reportPath): LeaderboardRow => {
    const report = readJsonFile<EvalReport>(reportPath);
    const metadata = inferRunMetadata(reportPath);

    return {
      run_name: metadata.run_name,
      adapter: metadata.adapter,
      fixture_name: report.fixture_name,
      total_cases: report.total_cases,
      primary_metric_name: report.primary_metric_name,
      primary_metric_value: report.primary_metric_value,
      interaction_code_accuracy: report.metrics.interaction_code_accuracy,
      origin_accuracy: report.metrics.origin_accuracy,
      mechanism_category_accuracy: report.metrics.mechanism_category_accuracy,
      risk_scale_exact_accuracy: report.metrics.risk_scale_exact_accuracy,
      risk_scale_mae: report.metrics.risk_scale_mae,
      abstention_recall: report.metrics.abstention_recall,
      hallucination_rate_on_unknown: report.metrics.hallucination_rate_on_unknown,
      explicit_rule_recall: report.metrics.explicit_rule_recall,
    };
  });

  const sortedRows = sortLeaderboardRows(rows);
  const leaderboardJsonPath = join(leaderboardDir, 'leaderboard.json');
  const leaderboardCsvPath = join(leaderboardDir, 'leaderboard.csv');
  const leaderboardReadmePath = join(leaderboardDir, 'README.md');

  writeJsonFile(leaderboardJsonPath, sortedRows);
  writeTextFile(leaderboardCsvPath, toCsv(sortedRows));
  writeTextFile(
    leaderboardReadmePath,
    `# Leaderboard

Each row represents one completed evaluation run.

Fields:

- run_name: experiment identifier
- adapter: prediction source used for the run
- fixture_name: evaluated fixture set
- total_cases: number of scored cases
- primary_metric_name / primary_metric_value: task-specific ranking metric
- interaction_code_accuracy: exact interaction label accuracy
- origin_accuracy: exact provenance accuracy
- mechanism_category_accuracy: exact mechanism class accuracy
- risk_scale_exact_accuracy: exact risk-scale accuracy
- risk_scale_mae: mean absolute error on risk scale
- abstention_recall: recall on unknown / abstention-safe cases
- hallucination_rate_on_unknown: rate of unsupported claims on unknown cases
- explicit_rule_recall: recall on explicit-rule provenance cases
`,
  );

  console.log(
    JSON.stringify(
      {
        leaderboard_json: relative(projectRoot, leaderboardJsonPath),
        leaderboard_csv: relative(projectRoot, leaderboardCsvPath),
        run_count: sortedRows.length,
      },
      null,
      2,
    ),
  );
};

if (process.argv[1] && resolve(process.argv[1]) === __filename) {
  main();
}
