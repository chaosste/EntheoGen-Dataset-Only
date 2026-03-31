export type EvalPromptInput = {
  id: string;
  pair_key: string;
  substance_a_id: string;
  substance_b_id: string;
  prompt_type: string;
  prompt: string;
  expected_interaction_code?: string;
  expected_origin?: string;
  expected_mechanism_category?: string;
  expected_risk_scale?: number;
  slice_tags: string[];
};

export type PredictionRecord = {
  id: string;
  predicted_interaction_code?: string;
  predicted_origin?: string;
  predicted_mechanism_category?: string;
  predicted_risk_scale?: number;
  raw_response?: string;
  provider_name?: string;
  model_name?: string;
  latency_ms?: number;
};

export type ProviderAdapter = {
  name: string;
  run(
    fixtures: EvalPromptInput[],
    options?: Record<string, unknown>,
  ): Promise<PredictionRecord[]>;
};
