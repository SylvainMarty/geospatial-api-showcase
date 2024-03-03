import { EntityRepository } from '@mikro-orm/postgresql';
import { NafCode } from '@/companies/entities/naf-code.entity';

export class NafCodeRepository extends EntityRepository<NafCode> {}
