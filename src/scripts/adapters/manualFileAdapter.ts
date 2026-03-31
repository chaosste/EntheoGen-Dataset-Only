import { resolve } from 'node:path';

import {
  readJsonlFile,
  type PredictionRow,
} from '../lib/evalUtils.ts';
import type { PredictionRecord, ProviderAdapter } from '../lib/providerTypes.ts';

export const manualFileAdapter: ProviderAdapter = {
  name: 'manual-file',
  async run(_fixtures, options = {}) {
    const predictionsPath = options.predictions_path;

    if (typeof predictionsPath !== 'string' || predictionsPath.length === 0) {
      throw new Error('manual-file adapter requires adapter_options.predictions_path');
    }

    const predictions = readJsonlFile<PredictionRow>(resolve(predictionsPath));

    return predictions.map((prediction): PredictionRecord => ({
      ...prediction,
      provider_name: prediction.provider_name ?? 'manual-file',
      model_name: prediction.model_name ?? 'external',
    }));
  },
};
