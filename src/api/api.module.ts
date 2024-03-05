import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CompaniesController } from './companies/companies.controller';

@Module({
  imports: [CqrsModule],
  controllers: [CompaniesController],
})
export class ApiModule {}
