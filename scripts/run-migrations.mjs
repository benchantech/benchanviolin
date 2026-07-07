import fs from "node:fs";
import path from "node:path";
import { Client } from "@neondatabase/serverless";
import { loadLocalEnv } from "./load-local-env.mjs";

loadLocalEnv();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run migrations.");
}

const client = new Client(databaseUrl);
const migrationsDir = path.join(process.cwd(), "db", "migrations");
const files = fs.readdirSync(migrationsDir).filter((file) => file.endsWith(".sql")).sort();

function splitSqlStatements(body) {
  const statements = [];
  let current = "";
  let singleQuoted = false;
  let dollarQuoted = false;

  for (let i = 0; i < body.length; i += 1) {
    const char = body[i];
    const next = body[i + 1];

    if (!singleQuoted && !dollarQuoted && char === "-" && next === "-") {
      while (i < body.length && body[i] !== "\n") i += 1;
      current += "\n";
      continue;
    }

    if (!singleQuoted && char === "$" && next === "$") {
      dollarQuoted = !dollarQuoted;
      current += "$$";
      i += 1;
      continue;
    }

    if (!dollarQuoted && char === "'") {
      singleQuoted = !singleQuoted;
      current += char;
      continue;
    }

    if (!singleQuoted && !dollarQuoted && char === ";") {
      const statement = current.trim();
      if (statement) statements.push(statement);
      current = "";
      continue;
    }

    current += char;
  }

  const trailing = current.trim();
  if (trailing) statements.push(trailing);
  return statements;
}

await client.connect();

await client.query(`
  create table if not exists schema_migrations (
    filename text primary key,
    applied_at timestamptz not null default now()
  );
`);

try {
  for (const file of files) {
    const applied = await client.query("select 1 from schema_migrations where filename = $1", [file]);
    if (applied.rows.length > 0) {
      console.log(`skip ${file}`);
      continue;
    }

    const body = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    console.log(`apply ${file}`);
    for (const statement of splitSqlStatements(body)) {
      await client.query(statement);
    }
    await client.query("insert into schema_migrations (filename) values ($1)", [file]);
  }
} finally {
  await client.end();
}

console.log(`migrations complete: ${files.length} files checked`);
