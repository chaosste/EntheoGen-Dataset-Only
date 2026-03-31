import {
  classifyMechanismCategory,
  LEGEND,
  resolveInteraction,
} from '../../data/drugData.ts';
import type { PredictionRecord, ProviderAdapter } from '../lib/providerTypes.ts';

export const oracleAdapter: ProviderAdapter = {
  name: 'oracle',
  async run(fixtures) {
    return fixtures.map((fixture): PredictionRecord => {
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
        raw_response: 'oracle rule engine',
        provider_name: 'oracle',
        model_name: 'entheogen-rule-engine',
        latency_ms: 0,
      };
    });
  },
};
