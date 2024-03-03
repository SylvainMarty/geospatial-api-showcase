import { performance } from 'perf_hooks';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { RefreshNafCodesCommand } from '@/companies/commands/impl/refresh-naf-codes.command';
import { NafCode } from '@/companies/entities/naf-code.entity';
import { firstValueFrom } from 'rxjs';
import { Logger } from '@nestjs/common';

const CODES_NAF_JSON_FILE_URL =
  'https://raw.githubusercontent.com/SocialGouv/codes-naf/master/index.json';

@CommandHandler(RefreshNafCodesCommand)
export class RefreshNafCodesHandler
  implements ICommandHandler<RefreshNafCodesCommand>
{
  private logger = new Logger(RefreshNafCodesHandler.name);

  constructor(
    @InjectRepository(NafCode)
    private readonly nafCodeRepository: EntityRepository<NafCode>,
    private readonly httpService: HttpService,
  ) {}

  async execute(command: RefreshNafCodesCommand): Promise<void> {
    this.logger.debug('Refreshing NAF codes');
    if (
      command.options.ignoreIfIndexNotEmpty &&
      (await this.nafCodeRepository.count()) > 0
    ) {
      this.logger.log('Ignoring refresh: NAF codes already present in index');
      return;
    }

    const nafCodes = await this.fetchNafCodesFromRemote();

    const nafCodeEntities: NafCode[] = [];
    for (const { id, label } of nafCodes) {
      if (id === null) {
        continue;
      }
      const entity = new NafCode();
      entity.code = id;
      entity.label = label;
      nafCodeEntities.push(entity);
    }

    await this.nafCodeRepository.upsertMany(nafCodeEntities);
    this.logger.log('NAF code index refreshed');
  }

  private async fetchNafCodesFromRemote(): Promise<
    { id: string; label: string }[]
  > {
    const startTime = performance.now();
    const { data } = await firstValueFrom(
      this.httpService.get(CODES_NAF_JSON_FILE_URL),
    );
    const endTime = performance.now();
    this.logger.log(
      `NAF codes fetched from remote in ${endTime - startTime}ms`,
    );
    return data;
  }
}
