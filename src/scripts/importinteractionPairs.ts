import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import type { PoolClient } from "pg";
import { Pool } from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

type InteractionRow = {
  pair_key: string;
  substance_a_id: string;
  substance_a_name?: string;
  substance_a_class?: string;
  substance_a_mechanism_tag?: string;
  substance_a_notes?: string;

  substance_b_id: string;
  substance_b_name?: string;
  substance_b_class?: string;
  substance_b_mechanism_tag?: string;
  substance_b_notes?: string;

  interaction_code: string;
  interaction_label?: string | null;
  risk_scale: number | null;
  origin: "explicit" | "fallback" | "unknown" | "self";
  mechanism_category: string;
  mechanism?: string | null;
  summary?: string | null;
  confidence?: string | null;
  timing?: string | null;
  evidence_gaps?: string | null;
  evidence_tier?: string | null;
  field_notes?: string | null;
  sources?: string | null;
  is_self_pair?: boolean;
  export_version?: string | null;
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === "false" ? false : { rejectUnauthorized: false },
});

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

async function upsertSubstance(
  client: PoolClient,
  id: string,
  name?: string,
  substanceClass?: string,
  mechanismTag?: string,
  notes?: string,
): Promise<void> {
  await client.query(
    `
    insert into substances (
      id, name, display_name, substance_class, mechanism_tag, notes
    )
    values ($1, $2, $3, $4, $5, $6)
    on conflict (id) do update set
      name = excluded.name,
      display_name = excluded.display_name,
      substance_class = excluded.substance_class,
      mechanism_tag = excluded.mechanism_tag,
      notes = excluded.notes,
      updated_at = now()
    `,
    [
      id,
      name ?? id,
      name ?? id,
      substanceClass ?? "unknown",
      mechanismTag ?? null,
      notes ?? null,
    ],
  );
}

async function upsertInteractionPair(
  client: PoolClient,
  row: InteractionRow,
): Promise<void> {
  await client.query(
    `
    insert into interaction_pairs (
      pair_key,
      substance_a_id,
      substance_b_id,
      interaction_code,
      interaction_label,
      risk_scale,
      origin,
      mechanism_category,
      mechanism,
      summary,
      confidence,
      timing,
      evidence_gaps,
      evidence_tier,
      field_notes,
      sources_text,
      is_self_pair,
      export_version
    )
    values (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18
    )
    on conflict (pair_key) do update set
      substance_a_id = excluded.substance_a_id,
      substance_b_id = excluded.substance_b_id,
      interaction_code = excluded.interaction_code,
      interaction_label = excluded.interaction_label,
      risk_scale = excluded.risk_scale,
      origin = excluded.origin,
      mechanism_category = excluded.mechanism_category,
      mechanism = excluded.mechanism,
      summary = excluded.summary,
      confidence = excluded.confidence,
      timing = excluded.timing,
      evidence_gaps = excluded.evidence_gaps,
      evidence_tier = excluded.evidence_tier,
      field_notes = excluded.field_notes,
      sources_text = excluded.sources_text,
      is_self_pair = excluded.is_self_pair,
      export_version = excluded.export_version,
      updated_at = now()
    `,
    [
      row.pair_key,
      row.substance_a_id,
      row.substance_b_id,
      row.interaction_code,
      row.interaction_label ?? null,
      row.risk_scale,
      row.origin,
      row.mechanism_category,
      row.mechanism ?? null,
      row.summary ?? null,
      row.confidence ?? null,
      row.timing ?? null,
      row.evidence_gaps ?? null,
      row.evidence_tier ?? null,
      row.field_notes ?? null,
      row.sources ?? null,
      row.is_self_pair ?? false,
      row.export_version ?? null,
    ],
  );
}

async function main(): Promise<void> {
  requiredEnv("DATABASE_URL");

  const inputPath =
    process.argv[2] ??
    path.join(projectRoot, "exports", "interaction_pairs.jsonl");

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  const client = await pool.connect();
  let rowCount = 0;

  try {
    await client.query("begin");

    const rl = readline.createInterface({
      input: fs.createReadStream(inputPath, { encoding: "utf8" }),
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      if (!line.trim()) continue;

      const row = JSON.parse(line) as InteractionRow;

      await upsertSubstance(
        client,
        row.substance_a_id,
        row.substance_a_name,
        row.substance_a_class,
        row.substance_a_mechanism_tag,
        row.substance_a_notes,
      );

      await upsertSubstance(
        client,
        row.substance_b_id,
        row.substance_b_name,
        row.substance_b_class,
        row.substance_b_mechanism_tag,
        row.substance_b_notes,
      );

      await upsertInteractionPair(client, row);
      rowCount += 1;
    }

    await client.query("commit");
    console.log(`Imported ${rowCount} interaction rows from ${inputPath}`);
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
