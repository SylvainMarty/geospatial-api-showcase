/*
 * This file is also used by MikroORM CLI
 */

import { defineConfig } from '@mikro-orm/core';
import { Migrator } from '@mikro-orm/migrations';
import { merge } from 'lodash';
import config from '@/config/mikro-orm/mikro-orm.config';

export default defineConfig(
  merge(
    {
      extensions: [Migrator],
    },
    config,
  ),
);
