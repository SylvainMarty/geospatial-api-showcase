import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Company } from '@/companies/entities/company.entity';
import { NafCode } from '@/companies/entities/naf-code.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Company, NafCode])],
})
export class CompaniesModule {}
