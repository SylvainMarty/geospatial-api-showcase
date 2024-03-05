import { performance } from 'perf_hooks';
import { Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@mikro-orm/nestjs';
import { ImportCompaniesCommand } from '@/companies/commands/impl/import-companies.command';
import { AbstractImportStrategy } from '@/companies/import-strategies/abstract-import.strategy';
import { COMPANIES_STRATEGIES_CLASSES } from '@/companies/constants';
import { FastJsonParser } from '@/shared/helpers/fast-json.parser';
import { FileDto } from '@/shared/dto/file.dto';
import { Company } from '@/companies/entities/company.entity';
import { CompanyRepository } from '@/companies/repositories/company.repository';
import { InvalidArgumentException } from '@/shared/exceptions/invalid-argument.exception';

const COMPANY_SAVE_BATCH_SIZE = 2500;

@CommandHandler(ImportCompaniesCommand)
export class ImportCompaniesHandler
  implements ICommandHandler<ImportCompaniesCommand>
{
  private logger = new Logger(ImportCompaniesHandler.name);

  private strategies: AbstractImportStrategy[];

  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: CompanyRepository,
    moduleRef: ModuleRef,
  ) {
    this.strategies = moduleRef.get<AbstractImportStrategy>(
      COMPANIES_STRATEGIES_CLASSES,
      { each: true },
    );
    if (
      this.strategies.find(
        (strategy) => !(strategy instanceof AbstractImportStrategy),
      )
    ) {
      throw new InvalidArgumentException(
        'A strategy must inherit from AbstractImportStrategy',
      );
    }
    const strategyNames = this.strategies.map((s) => s.constructor.name);
    this.logger.log(
      `${this.strategies.length} company import strategies found: ${strategyNames.join(', ')}`,
    );
  }

  async execute(command: ImportCompaniesCommand): Promise<any> {
    this.logger.debug('Importing companies in the database');
    const startTime = performance.now();
    const jsonParser = this.parseAndVerifyGeoJson(command.file);
    const importStrategy = this.findStategy(jsonParser);
    const iterator = importStrategy.generateCompany(jsonParser);
    const em = this.companyRepository.getEntityManager();
    await em.begin();
    let counter;
    try {
      await this.deleteOutdatedEntries(importStrategy.getImportId(jsonParser));

      counter = await this.batchInsertCompanies(iterator, startTime);
      await em.commit();
    } catch (error) {
      await em.rollback();
      throw error;
    }
    const endTime = performance.now();
    this.logger.log(
      `${counter} companies were imported and saved in ${endTime - startTime}ms`,
    );
  }

  private findStategy(json: FastJsonParser): AbstractImportStrategy {
    for (const strategy of this.strategies) {
      if (strategy.supportsImport(json)) {
        this.logger.log(`Import strategy found: ${strategy.constructor.name}`);
        return strategy;
      }
    }

    this.logger.error('No strategy found for this file');
    throw new InvalidArgumentException('No strategy found for this file');
  }

  private parseAndVerifyGeoJson(file: FileDto): FastJsonParser {
    const json = file.buffer.toString();
    if (!FastJsonParser.isValid(json)) {
      throw new InvalidArgumentException('Invalid JSON file');
    }
    return new FastJsonParser(json);
  }

  private async deleteOutdatedEntries(importId: string) {
    const startTime = performance.now();
    await this.companyRepository.nativeDelete({
      importId,
    });
    const endTime = performance.now();
    this.logger.log(
      `Outdated companies from previous import were deleted in ${endTime - startTime}ms`,
    );
  }

  private async batchInsertCompanies(
    iterator: Generator<Company> | AsyncGenerator<Company>,
    startTime: number,
  ) {
    let counter = 0;
    let batchCompanies = [];
    for await (const company of iterator) {
      batchCompanies.push(company);
      counter++;
      if (batchCompanies.length === COMPANY_SAVE_BATCH_SIZE) {
        const endTime = performance.now();
        await this.companyRepository.insertManyNative(batchCompanies);
        this.logger.log(
          `${COMPANY_SAVE_BATCH_SIZE} companies saved (${counter} total) in batch after ${endTime - startTime}ms`,
        );
        batchCompanies = [];
      }
    }
    if (batchCompanies.length > 0) {
      await this.companyRepository.insertManyNative(batchCompanies);
    }
    return counter;
  }
}
