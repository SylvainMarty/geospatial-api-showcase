import { LoadStrategy, Options } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';

const config: Options = {
  driver: PostgreSqlDriver,
  loadStrategy: LoadStrategy.JOINED, // Doc: https://mikro-orm.io/docs/loading-strategies
  migrations: {
    snapshot: false,
  },
};

export default config;
