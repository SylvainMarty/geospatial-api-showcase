import { MapEntity } from '@/config/mikro-orm/map-entity.decorator';
import { Entity, Index, PrimaryKey, Property } from '@mikro-orm/core';

@MapEntity()
@Entity()
@Index({
  name: 'company_geometry_market_identifier_idx',
  properties: ['geometry', 'marketIdentifier'],
  expression:
    'create index "company_geometry_market_identifier_idx" on "company" USING GIST("geometry", "market_identifier")',
})
export class Company {
  @PrimaryKey()
  id: number;

  @Index({ type: 'GIST' })
  @Property({ columnType: 'GEOMETRY(Point,4326)' })
  geometry: string;

  @Property({ length: 255, unique: true })
  reference: string;

  @Property({ length: 255 })
  companyName: string;

  @Property({ length: 255 })
  marketIdentifier: string;

  @Property({ length: 255 })
  marketLabel: string;
}
