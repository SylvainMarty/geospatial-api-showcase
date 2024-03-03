import {
  Entity,
  EntityRepositoryType,
  Index,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { MapEntity } from '@/config/mikro-orm/map-entity.decorator';
import { NafCodeRepository } from '@/companies/repositories/naf-code.repository';

@MapEntity()
@Entity({ repository: () => NafCodeRepository })
export class NafCode {
  [EntityRepositoryType]?: NafCodeRepository;

  @PrimaryKey({ autoincrement: true })
  id: number;

  @Index()
  @Property({ unique: true })
  code: string;

  @Property()
  label: string;
}
