import { createReadStream, readFileSync } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

import Ajv from 'ajv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(__dirname, '..', '..');

const defaultJsonl = path.join(srcRoot, 'exports', 'interaction_pairs.jsonl');
const defaultSchema = path.join(repoRoot, 'schemas', 'interaction_pair.schema.json');

async function main(): Promise<void> {
  const jsonlPath = process.argv[2] ?? defaultJsonl;
  const schemaPath = process.argv[3] ?? defaultSchema;

  const schema = JSON.parse(readFileSync(schemaPath, 'utf8')) as object;

  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);

  const rl = readline.createInterface({
    input: createReadStream(jsonlPath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  });

  let lineNumber = 0;
  let rowCount = 0;
  const errors: string[] = [];

  for await (const line of rl) {
    lineNumber += 1;
    const trimmed = line.trim();
    if (!trimmed) continue;

    let row: unknown;
    try {
      row = JSON.parse(trimmed) as unknown;
    } catch {
      errors.push(`Line ${lineNumber}: invalid JSON`);
      continue;
    }

    if (typeof row !== 'object' || row === null) {
      errors.push(`Line ${lineNumber}: row is not an object`);
      continue;
    }

    const ok = validate(row);
    if (!ok && validate.errors) {
      for (const err of validate.errors) {
        const pathStr = err.instancePath || '(root)';
        errors.push(
          `Line ${lineNumber} ${pathStr}: ${err.message ?? 'validation failed'}`,
        );
      }
    }
    rowCount += 1;
  }

  if (errors.length > 0) {
    console.error('JSON Schema validation failed.');
    for (const e of errors) {
      console.error(`- ${e}`);
    }
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        jsonl: jsonlPath,
        schema: schemaPath,
        rows_validated: rowCount,
        status: 'ok',
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
