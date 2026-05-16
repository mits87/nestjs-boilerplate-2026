import { describe, expect, it } from 'vitest';

import { parsePrismaPgConnectionDetails } from './prisma-pg-connection.helper';

describe('parsePrismaPgConnectionDetails', () => {
  it('extracts the schema from the Prisma connection string', () => {
    expect(parsePrismaPgConnectionDetails('postgresql://postgres:postgres@localhost:5433/db?schema=tenant_1')).toEqual({
      connectionString: 'postgresql://postgres:postgres@localhost:5433/db',
      schema: 'tenant_1',
    });
  });

  it('returns null when the schema query param is absent', () => {
    expect(parsePrismaPgConnectionDetails('postgresql://postgres:postgres@localhost:5433/db')).toEqual({
      connectionString: 'postgresql://postgres:postgres@localhost:5433/db',
      schema: null,
    });
  });
});
