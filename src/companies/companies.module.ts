import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Company } from '@/companies/entities/company.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Company])],
})
export class CompaniesModule {}
