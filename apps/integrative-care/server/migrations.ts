// Kept in the server bundle so schema setup never depends on a working directory.
export const migrations = [{ version: 1, sql: `
  CREATE TABLE IF NOT EXISTS shamba_records (
    kind TEXT NOT NULL, id TEXT NOT NULL, body JSONB NOT NULL,
    revision INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (kind,id)
  );
  CREATE INDEX IF NOT EXISTS shamba_case_owner
    ON shamba_records ((body->>'customerId')) WHERE kind='case';
  CREATE INDEX IF NOT EXISTS shamba_purchase_reference
    ON shamba_records ((body->>'referenceId')) WHERE kind='purchase';
` }];
