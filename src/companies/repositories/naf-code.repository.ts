import { EntityRepository } from '@mikro-orm/postgresql';
import { NafCode } from '@/companies/entities/naf-code.entity';

export class NafCodeRepository extends EntityRepository<NafCode> {
  /**
   * Use this method is you want to fetch the data with no entity hydration.
   * It can be useful to save some time and memory.
   */
  public async findAllRaw(): Promise<{ code: string; label: string }[]> {
    return this.em.getConnection().execute('SELECT code, label FROM naf_code');
  }
}
