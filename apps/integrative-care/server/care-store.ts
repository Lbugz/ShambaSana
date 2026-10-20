import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";
import { migrations } from "./migrations";

export class ConflictError extends Error {
  constructor() {
    super("This case changed. Refresh before saving.");
  }
}
export interface CareStore {
  get<T>(kind: string, id: string): Promise<T | undefined>;
  list<T>(kind: string, customerId?: string): Promise<T[]>;
  put<T>(
    kind: string,
    id: string,
    value: T,
    expectedRevision?: number,
  ): Promise<void>;
  remove(kind: string, id: string): Promise<void>;
  close(): Promise<void>;
}
// Development only: atomic writes survive restarts. Production requires PostgreSQL.
export class FileStore implements CareStore {
  private tail: Promise<unknown> = Promise.resolve();
  constructor(private filename: string) {}
  private async read(): Promise<Record<string, unknown>> {
    try {
      return JSON.parse(await readFile(this.filename, "utf8"));
    } catch (e: any) {
      if (e.code === "ENOENT") return {};
      throw e;
    }
  }
  async get<T>(kind: string, id: string) {
    await this.tail;
    return (await this.read())[`${kind}:${id}`] as T | undefined;
  }
  async list<T>(kind: string, customerId?: string) {
    await this.tail;
    return Object.entries(await this.read())
      .filter(([k]) => k.startsWith(`${kind}:`))
      .map(([, v]) => v as T)
      .filter(
        (v) =>
          customerId === undefined ||
          (v as { customerId?: string }).customerId === customerId,
      );
  }
  private write(fn: (data: Record<string, unknown>) => void) {
    const work = this.tail.then(async () => {
      const data = await this.read();
      fn(data);
      await mkdir(path.dirname(this.filename), {
        recursive: true,
        mode: 0o700,
      });
      const temporary = `${this.filename}.tmp`;
      await writeFile(temporary, JSON.stringify(data), { mode: 0o600 });
      await rename(temporary, this.filename);
    });
    this.tail = work.catch(() => {});
    return work;
  }
  async put<T>(kind: string, id: string, value: T, expectedRevision?: number) {
    await this.write((data) => {
      const old = data[`${kind}:${id}`] as { revision?: number } | undefined;
      if (expectedRevision !== undefined && old?.revision !== expectedRevision)
        throw new ConflictError();
      if (expectedRevision === undefined && old !== undefined)
        throw new ConflictError();
      data[`${kind}:${id}`] = value;
    });
  }
  async remove(kind: string, id: string) {
    await this.write((data) => {
      delete data[`${kind}:${id}`];
    });
  }
  async close() {
    await this.tail;
  }
}
export class PostgresStore implements CareStore {
  private pool: Pool;
  constructor(url: string) {
    this.pool = new Pool({ connectionString: url });
  }
  async init() {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(735221)");
      await client.query("CREATE TABLE IF NOT EXISTS shamba_schema_migrations (version INTEGER PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())");
      for (const migration of migrations) {
        const existing = await client.query("SELECT version FROM shamba_schema_migrations WHERE version=$1", [migration.version]);
        if (!existing.rowCount) {
          await client.query(migration.sql);
          await client.query("INSERT INTO shamba_schema_migrations(version) VALUES($1)", [migration.version]);
        }
      }
      await client.query("COMMIT");
    } catch (error) { await client.query("ROLLBACK"); throw error; }
    finally { client.release(); }
  }
  async get<T>(kind: string, id: string) {
    return (
      await this.pool.query(
        "SELECT body FROM shamba_records WHERE kind=$1 AND id=$2",
        [kind, id],
      )
    ).rows[0]?.body as T | undefined;
  }
  async list<T>(kind: string, customerId?: string) {
    const result =
      customerId === undefined
        ? await this.pool.query(
            "SELECT body FROM shamba_records WHERE kind=$1",
            [kind],
          )
        : await this.pool.query(
            "SELECT body FROM shamba_records WHERE kind=$1 AND body->>'customerId'=$2",
            [kind, customerId],
          );
    return result.rows.map((r) => r.body as T);
  }
  async put<T>(kind: string, id: string, value: T, expectedRevision?: number) {
    const revision = (value as { revision?: number }).revision ?? 0;
    const result =
      expectedRevision === undefined
        ? await this.pool.query(
            "INSERT INTO shamba_records(kind,id,body,revision) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING",
            [kind, id, value, revision],
          )
        : await this.pool.query(
            "UPDATE shamba_records SET body=$3,revision=$4 WHERE kind=$1 AND id=$2 AND revision=$5",
            [kind, id, value, revision, expectedRevision],
          );
    if (!result.rowCount) throw new ConflictError();
  }
  async remove(kind: string, id: string) {
    await this.pool.query(
      "DELETE FROM shamba_records WHERE kind=$1 AND id=$2",
      [kind, id],
    );
  }
  async close() {
    await this.pool.end();
  }
}
export async function createCareStore(): Promise<CareStore> {
  if (process.env.DATABASE_URL) {
    const store = new PostgresStore(process.env.DATABASE_URL);
    await store.init();
    return store;
  }
  if (process.env.NODE_ENV === "production")
    throw new Error("DATABASE_URL is required for production care records.");
  return new FileStore(
    path.resolve(process.env.SHAMBA_DATA_FILE || ".data/care.json"),
  );
}
