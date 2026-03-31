import type { PredictionRecord, ProviderAdapter } from '../lib/providerTypes.ts';

type OpenAICompatibleResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

const parseJsonContent = (
  id: string,
  content: string,
  providerName: string,
  modelName: string,
  latencyMs: number,
): PredictionRecord => {
  const parsed = JSON.parse(content) as Record<string, unknown>;

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
    raw_response: typeof parsed.raw_response === 'string' ? parsed.raw_response : content,
    provider_name: providerName,
    model_name: modelName,
    latency_ms: latencyMs,
  };
};

export const openaiCompatibleAdapter: ProviderAdapter = {
  name: 'openai-compatible',
  async run(fixtures) {
    const baseUrl = process.env.OPENAI_BASE_URL;
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL;

    if (!baseUrl || !apiKey || !model) {
      throw new Error(
        'openai-compatible adapter requires OPENAI_BASE_URL, OPENAI_API_KEY, and OPENAI_MODEL',
      );
    }

    const predictions: PredictionRecord[] = [];

    for (const fixture of fixtures) {
      const startedAt = Date.now();
      const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          temperature: 0,
          messages: [
            {
              role: 'system',
              content:
                'Return strict JSON with keys predicted_interaction_code, predicted_origin, predicted_mechanism_category, predicted_risk_scale, raw_response.',
            },
            {
              role: 'user',
              content: fixture.prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(
          `openai-compatible adapter request failed: ${response.status} ${response.statusText}`,
        );
      }

      const payload = (await response.json()) as OpenAICompatibleResponse;
      const content = payload.choices?.[0]?.message?.content;

      if (typeof content !== 'string' || content.trim().length === 0) {
        throw new Error('openai-compatible adapter returned empty message content');
      }

      predictions.push(
        parseJsonContent(
          fixture.id,
          content,
          'openai-compatible',
          model,
          Date.now() - startedAt,
        ),
      );
    }

    return predictions;
  },
};
