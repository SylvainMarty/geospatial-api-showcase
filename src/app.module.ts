import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { CompaniesModule } from './companies/companies.module';
import { ApiModule } from './api/api.module';

@Module({
  imports: [ConfigModule, CompaniesModule, ApiModule],
})
export class AppModule {}
