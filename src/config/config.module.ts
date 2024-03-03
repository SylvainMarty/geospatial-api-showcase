import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { OpenapiConfigService } from './openapi-config.service';
import { MikroOrmConfigFactory } from './mikro-orm/mikro-orm-config.factory';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    MikroOrmModule.forRootAsync({
      useClass: MikroOrmConfigFactory,
    }),
  ],
  providers: [OpenapiConfigService, MikroOrmConfigFactory],
})
export class ConfigModule {}
