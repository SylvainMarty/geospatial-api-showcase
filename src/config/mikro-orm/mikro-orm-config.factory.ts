import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { merge } from 'lodash';
import { asBoolean } from '@/shared/helpers/type.helper';
import {
  MikroOrmModuleOptions,
  MikroOrmOptionsFactory,
} from '@mikro-orm/nestjs/typings';
import config from '@/config/mikro-orm/mikro-orm.config';
import { entities } from '@/config/mikro-orm/map-entity.decorator';

@Injectable()
export class MikroOrmConfigFactory
  implements MikroOrmOptionsFactory<PostgreSqlDriver>
{
  constructor(private readonly configService: ConfigService) {}

  public createMikroOrmOptions(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    contextName?: string,
  ): MikroOrmModuleOptions<PostgreSqlDriver> {
    return merge(
      {
        dbName: this.configService.get('MIKRO_ORM_DB_NAME'),
        host: this.configService.get('MIKRO_ORM_HOST'),
        port: this.configService.get('MIKRO_ORM_PORT'),
        user: this.configService.get('MIKRO_ORM_USER'),
        password: this.configService.get('MIKRO_ORM_PASSWORD'),
        debug: asBoolean(this.configService.get<boolean>('MIKRO_ORM_LOGGING')),
        entities,
      },
      config,
    );
  }
}
