import { URL } from 'node:url';

/**
 * Parsed PostgreSQL connection details used to configure Prisma's PG adapter.
 */
export interface PrismaPgConnectionDetails {
  /** Connection string passed to `pg` without Prisma-specific query parameters. */
  readonly connectionString: string;
  /** Explicit schema name for the Prisma adapter, or `null` when absent. */
  readonly schema: string | null;
}

/**
 * Splits a PostgreSQL URL into the adapter connection string plus the optional Prisma schema.
 *
 * Prisma migrations still rely on `?schema=...` inside `DATABASE_URL`, while the Prisma PG
 * adapter expects the schema in its own options bag.
 *
 * @param databaseUrl - PostgreSQL connection string that may include Prisma's schema parameter.
 * @returns Parsed connection details for the adapter.
 */
export function parsePrismaPgConnectionDetails(databaseUrl: string): PrismaPgConnectionDetails {
  const url = new URL(databaseUrl);
  const schema = normalizeSchemaName(url.searchParams.get('schema'));

  url.searchParams.delete('schema');

  return {
    connectionString: url.toString(),
    schema,
  };
}

/**
 * Normalizes a schema name read from `URLSearchParams`.
 *
 * @param schema - Raw schema value from the connection string.
 * @returns Trimmed schema name or `null` when it is absent / blank.
 */
function normalizeSchemaName(schema: string | null): string | null {
  if (typeof schema !== 'string') {
    return null;
  }

  const trimmedSchema = schema.trim();
  return trimmedSchema.length > 0 ? trimmedSchema : null;
}
