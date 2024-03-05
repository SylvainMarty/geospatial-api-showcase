import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from '@/api/auth/auth.controller';
import { CompaniesController } from '@/api/companies/companies.controller';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [CqrsModule, AuthModule],
  controllers: [AuthController, CompaniesController],
})
export class ApiModule {}
