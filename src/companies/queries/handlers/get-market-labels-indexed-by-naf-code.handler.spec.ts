import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { NafCode } from '@/companies/entities/naf-code.entity';
import { GetMarketLabelsIndexedByNafCodeHandler } from '@/companies/queries/handlers/get-market-labels-indexed-by-naf-code.handler';
import { GetMarketLabelsIndexedByNafCodeQuery } from '@/companies/queries/impl/get-market-labels-indexed-by-naf-code.query';

describe('GetMarketLabelsIndexedByNafCodeHandler', () => {
  const nafCodeRepository = { findAllRaw: jest.fn() };
  let handler: GetMarketLabelsIndexedByNafCodeHandler;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        { provide: getRepositoryToken(NafCode), useValue: nafCodeRepository },
        GetMarketLabelsIndexedByNafCodeHandler,
      ],
    }).compile();

    handler = module.get(GetMarketLabelsIndexedByNafCodeHandler);
  });

  it('returns the labels indexed by NAF codes ', async () => {
    const query = new GetMarketLabelsIndexedByNafCodeQuery();
    nafCodeRepository.findAllRaw.mockResolvedValue([
      { code: 'naf-code-1', label: 'Awesome label for NAF code 1' },
      { code: 'naf-code-2', label: 'Awesome label for NAF code 2' },
    ]);

    const result = await handler.execute(query);

    expect(result).toEqual({
      'naf-code-1': 'Awesome label for NAF code 1',
      'naf-code-2': 'Awesome label for NAF code 2',
    });
  });
});
