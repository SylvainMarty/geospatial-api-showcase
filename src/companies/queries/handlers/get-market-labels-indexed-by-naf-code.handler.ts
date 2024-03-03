import { performance } from 'perf_hooks';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMarketLabelsIndexedByNafCodeQuery } from '@/companies/queries/impl/get-market-labels-indexed-by-naf-code.query';
import { NafCodeRepository } from '@/companies/repositories/naf-code.repository';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { NafCode } from '@/companies/entities/naf-code.entity';

@QueryHandler(GetMarketLabelsIndexedByNafCodeQuery)
export class GetMarketLabelsIndexedByNafCodeHandler
  implements IQueryHandler<GetMarketLabelsIndexedByNafCodeQuery>
{
  private logger = new Logger(GetMarketLabelsIndexedByNafCodeHandler.name);

  constructor(
    @InjectRepository(NafCode)
    private readonly nafCodeRepository: NafCodeRepository,
  ) {}

  async execute(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    query: GetMarketLabelsIndexedByNafCodeQuery,
  ): Promise<Record<string, string>> {
    this.logger.debug('Building NAF codes index');
    const startTime = performance.now();
    const index = {};
    const nafCodes = await this.nafCodeRepository.findAllRaw();
    for (const { code, label } of nafCodes) {
      index[code] = label;
    }
    const endTime = performance.now();
    this.logger.log(`NAF codes index built in ${endTime - startTime}ms`);
    return index;
  }
}
