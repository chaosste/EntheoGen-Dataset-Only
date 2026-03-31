import { spawn } from 'node:child_process';

import type { PredictionRecord, ProviderAdapter } from '../lib/providerTypes.ts';

const KNOWN_INTERACTION_CODES = ['LOW', 'LOW_MOD', 'CAU', 'UNS', 'DAN', 'UNK', 'SELF'];
const KNOWN_ORIGINS = ['explicit', 'fallback', 'unknown', 'self'];
const KNOWN_MECHANISM_CATEGORIES = [
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
];

const runShellCommand = (commandTemplate: string, prompt: string): Promise<string> => {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(commandTemplate, {
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      rejectPromise(error);
    });

    child.on('close', (code) => {
      if (code !== 0) {
        rejectPromise(
          new Error(`shell-command adapter failed with code ${code}: ${stderr.trim()}`),
        );
        return;
      }

      resolvePromise(stdout.trim());
    });

    child.stdin.write(prompt);
    child.stdin.end();
  });
};

const parseHeuristicPrediction = (
  id: string,
  stdout: string,
  providerName: string,
  modelName: string,
  latencyMs: number,
): PredictionRecord => {
  const normalized = stdout.toLowerCase();
  const prediction: PredictionRecord = {
    id,
    raw_response: stdout,
    provider_name: providerName,
    model_name: modelName,
    latency_ms: latencyMs,
  };

  for (const interactionCode of KNOWN_INTERACTION_CODES) {
    if (normalized.includes(interactionCode.toLowerCase())) {
      prediction.predicted_interaction_code = interactionCode;
      break;
    }
  }

  for (const origin of KNOWN_ORIGINS) {
    if (normalized.includes(origin)) {
      prediction.predicted_origin = origin;
      break;
    }
  }

  for (const mechanismCategory of KNOWN_MECHANISM_CATEGORIES) {
    if (normalized.includes(mechanismCategory)) {
      prediction.predicted_mechanism_category = mechanismCategory;
      break;
    }
  }

  const riskMatch = normalized.match(/\b-?\d+\b/);
  if (riskMatch) {
    const parsedRisk = Number.parseInt(riskMatch[0], 10);
    if (!Number.isNaN(parsedRisk)) {
      prediction.predicted_risk_scale = parsedRisk;
    }
  }

  return prediction;
};

const parseCommandOutput = (
  id: string,
  stdout: string,
  providerName: string,
  modelName: string,
  latencyMs: number,
): PredictionRecord => {
  try {
    const parsed = JSON.parse(stdout) as Record<string, unknown>;

    return {
      id,
      predicted_interaction_code:
        typeof parsed.predicted_interaction_code === 'string'
          ? parsed.predicted_interaction_code
          : undefined,
      predicted_origin:
        typeof parsed.predicted_origin === 'string' ? parsed.predicted_origin : undefined,
      predicted_mechanism_category:
        typeof parsed.predicted_mechanism_category === 'string'
          ? parsed.predicted_mechanism_category
          : undefined,
      predicted_risk_scale:
        typeof parsed.predicted_risk_scale === 'number'
          ? parsed.predicted_risk_scale
          : undefined,
      raw_response: typeof parsed.raw_response === 'string' ? parsed.raw_response : stdout,
      provider_name: providerName,
      model_name: modelName,
      latency_ms: latencyMs,
    };
  } catch {
    return parseHeuristicPrediction(id, stdout, providerName, modelName, latencyMs);
  }
};

export const shellCommandAdapter: ProviderAdapter = {
  name: 'shell-command',
  async run(fixtures, options = {}) {
    const commandTemplate = options.command_template;
    const providerName =
      typeof options.provider_name === 'string' ? options.provider_name : 'shell-command';
    const modelName =
      typeof options.model_name === 'string' ? options.model_name : 'local-shell';

    if (typeof commandTemplate !== 'string' || commandTemplate.length === 0) {
      throw new Error('shell-command adapter requires adapter_options.command_template');
    }

    const predictions: PredictionRecord[] = [];

    for (const fixture of fixtures) {
      const startedAt = Date.now();
      const stdout = await runShellCommand(commandTemplate, fixture.prompt);
      predictions.push(
        parseCommandOutput(
          fixture.id,
          stdout,
          providerName,
          modelName,
          Date.now() - startedAt,
        ),
      );
    }

    return predictions;
  },
};
