import { Test } from '@nestjs/testing';
import { Injectable } from '@nestjs/common';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { EmptyLogger } from '@/shared/helpers/logger.helper';
import { FileDto } from '@/shared/dto/file.dto';
import { InvalidArgumentException } from '@/shared/exceptions/invalid-argument.exception';
import { FastJsonParser } from '@/shared/helpers/fast-json.parser';
import { Company } from '@/companies/entities/company.entity';
import { COMPANIES_STRATEGIES_CLASSES } from '@/companies/import-strategies/constants';
import { ImportCompaniesHandler } from '@/companies/commands/handlers/import-companies.handler';
import { ImportCompaniesCommand } from '@/companies/commands/impl/import-companies.command';
import { AbstractImportStrategy } from '@/companies/import-strategies/abstract-import.strategy';

@Injectable()
class TestCompaniesImportStategy extends AbstractImportStrategy {
  public supportsImport(json: FastJsonParser): boolean {
    return json.getParsedValueFromKey('name') === 'test-file';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getImportId(json: FastJsonParser): string {
    return 'test-file-import';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public *generateCompany(json: FastJsonParser): Generator<Company> {
    const companyCount = json.getParsedValueFromKey<number>('companyCount');
    for (let i = 0; i < companyCount; i++) {
      yield new Company();
    }
  }
}

describe('ImportCompaniesHandler', () => {
  const moduleRefMock = { get: jest.fn() };
  const companyRepository = {
    getEntityManager: jest.fn(),
    nativeDelete: jest.fn(),
    insertManyNative: jest.fn(),
  };
  const entityManagerMock = {
    begin: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
  };
  let handler: ImportCompaniesHandler;

  beforeEach(async () => {
    jest.resetAllMocks();

    companyRepository.getEntityManager.mockReturnValue(entityManagerMock);
    moduleRefMock.get.mockReturnValue([new TestCompaniesImportStategy()]);

    const module = await Test.createTestingModule({
      providers: [
        { provide: getRepositoryToken(Company), useValue: companyRepository },
        {
          provide: COMPANIES_STRATEGIES_CLASSES,
          useClass: TestCompaniesImportStategy,
        },
        ImportCompaniesHandler,
      ],
    })
      .setLogger(new EmptyLogger())
      .compile();

    handler = module.get(ImportCompaniesHandler);
  });

  it('throws an error when JSON file is not valid', async () => {
    const file = new FileDto('test-file', Buffer.from('{', 'utf-8'));

    const promise = handler.execute(new ImportCompaniesCommand(file));

    expect(promise).rejects.toThrow(
      new InvalidArgumentException('Invalid JSON file'),
    );
  });

  it('throws an error when no strategy is found', async () => {
    const file = new FileDto(
      'test-file',
      Buffer.from('{"name": "not-a-test-file"}', 'utf-8'),
    );

    const promise = handler.execute(new ImportCompaniesCommand(file));

    expect(promise).rejects.toThrow(
      new InvalidArgumentException('No strategy found for this file'),
    );
  });

  it('opens the DB transaction and it commits on success', async () => {
    const file = new FileDto(
      'test-file',
      Buffer.from('{"name": "test-file","companyCount":1}', 'utf-8'),
    );

    await handler.execute(new ImportCompaniesCommand(file));

    expect(entityManagerMock.begin).toHaveBeenCalled();
    expect(entityManagerMock.commit).toHaveBeenCalled();
  });

  it('opens the DB transaction and rollbacks on error before throwing the error', async () => {
    const file = new FileDto(
      'test-file',
      Buffer.from('{"name": "test-file","companyCount":1}', 'utf-8'),
    );
    companyRepository.nativeDelete.mockImplementation(() => {
      throw new Error('DB error');
    });

    const promise = handler.execute(new ImportCompaniesCommand(file));

    await expect(promise).rejects.toThrow(Error);
    expect(entityManagerMock.begin).toHaveBeenCalled();
    expect(entityManagerMock.rollback).toHaveBeenCalled();
  });

  it('deletes outdated entries from the database', async () => {
    const file = new FileDto(
      'test-file',
      Buffer.from('{"name": "test-file","companyCount":1}', 'utf-8'),
    );

    await handler.execute(new ImportCompaniesCommand(file));

    expect(companyRepository.nativeDelete).toHaveBeenCalledWith({
      importId: 'test-file-import',
    });
  });

  it('insert companies in the DB', async () => {
    const file = new FileDto(
      'test-file',
      Buffer.from('{"name": "test-file","companyCount":1}', 'utf-8'),
    );

    await handler.execute(new ImportCompaniesCommand(file));

    expect(companyRepository.insertManyNative).toHaveBeenCalled();
  });

  it('insert companies in the DB but in batches of 2500', async () => {
    const file = new FileDto(
      'test-file',
      Buffer.from('{"name": "test-file","companyCount":3000}', 'utf-8'),
    );

    await handler.execute(new ImportCompaniesCommand(file));

    expect(companyRepository.insertManyNative).toHaveBeenCalledTimes(2);
  });
});
