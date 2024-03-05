import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { COMPANIES_STRATEGIES_CLASSES } from '@/companies/import-strategies/constants';
import { FrenchCompaniesImportStrategy } from '@/companies/import-strategies/french-companies-import.strategy';

@Module({
  imports: [CqrsModule],
  providers: [
    {
      provide: COMPANIES_STRATEGIES_CLASSES,
      useClass: FrenchCompaniesImportStrategy,
    },
  ],
  exports: [COMPANIES_STRATEGIES_CLASSES],
})
export class ImportStrategiesModule {}
