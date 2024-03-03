import { Entity, Index, PrimaryKey, Property } from '@mikro-orm/core';
import { MapEntity } from '@/config/mikro-orm/map-entity.decorator';

@MapEntity()
@Entity()
export class NafCode {
  @PrimaryKey({ autoincrement: true })
  id: number;

  @Index()
  @Property({ unique: true })
  code: string;

  @Property()
  label: string;
}
