import { of } from 'rxjs';
import { Test } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { RefreshNafCodesHandler } from '@/companies/commands/handlers/refresh-naf-codes.handler';
import { RefreshNafCodesCommand } from '@/companies/commands/impl/refresh-naf-codes.command';
import { NafCode } from '@/companies/entities/naf-code.entity';

describe('RefreshNafCodesHandler', () => {
  const httpServiceMock = { get: jest.fn() };
  const nafCodeRepository = { count: jest.fn(), upsertMany: jest.fn() };
  let handler: RefreshNafCodesHandler;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        { provide: HttpService, useValue: httpServiceMock },
        { provide: getRepositoryToken(NafCode), useValue: nafCodeRepository },
        RefreshNafCodesHandler,
      ],
    }).compile();

    handler = module.get(RefreshNafCodesHandler);
  });

  it('refreshes the NAF codes', async () => {
    const command = new RefreshNafCodesCommand({
      ignoreIfIndexNotEmpty: false,
    });
    httpServiceMock.get.mockReturnValue(
      of({
        data: [
          { id: 'code1', label: 'my label 1' },
          { id: 'code2', label: 'my label 2' },
        ],
      }),
    );

    await handler.execute(command);

    expect(nafCodeRepository.count).not.toHaveBeenCalled();
    expect(httpServiceMock.get).toHaveBeenCalled();
    expect(nafCodeRepository.upsertMany).toHaveBeenCalledWith([
      Object.assign(new NafCode(), { code: 'code1', label: 'my label 1' }),
      Object.assign(new NafCode(), { code: 'code2', label: 'my label 2' }),
    ]);
  });

  it('throws an error if the NAF codes fetch fail', async () => {
    const command = new RefreshNafCodesCommand({ ignoreIfIndexNotEmpty: true });
    nafCodeRepository.count.mockResolvedValue(0);
    httpServiceMock.get.mockImplementation(() => {
      throw new Error('500 error');
    });

    const promise = handler.execute(command);

    await expect(promise).rejects.toThrow('500 error');
  });

  it('ignores the refresh if the option ignoreIfIndexNotEmpty is true and there are data in the DB', async () => {
    const command = new RefreshNafCodesCommand({ ignoreIfIndexNotEmpty: true });
    nafCodeRepository.count.mockResolvedValue(100);

    await handler.execute(command);

    expect(httpServiceMock.get).not.toHaveBeenCalled();
    expect(nafCodeRepository.upsertMany).not.toHaveBeenCalled();
  });

  it('refreshes if the option ignoreIfIndexNotEmpty is true and there is no data in the DB', async () => {
    const command = new RefreshNafCodesCommand({ ignoreIfIndexNotEmpty: true });
    nafCodeRepository.count.mockResolvedValue(0);
    httpServiceMock.get.mockReturnValue(
      of({
        data: [
          { id: 'code1', label: 'my label 1' },
          { id: 'code2', label: 'my label 2' },
        ],
      }),
    );

    await handler.execute(command);

    expect(httpServiceMock.get).toHaveBeenCalled();
    expect(nafCodeRepository.upsertMany).toHaveBeenCalled();
  });
});
