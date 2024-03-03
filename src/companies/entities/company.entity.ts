import { MapEntity } from '@/config/mikro-orm/map-entity.decorator';
import {
  Entity,
  EntityRepositoryType,
  Index,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Point, PointType } from '@/shared/mikro-orm/point.type';
import { CompanyRepository } from '@/companies/repositories/company.repository';

@MapEntity()
@Entity({ repository: () => CompanyRepository })
@Index({
  name: 'company_geometry_market_identifier_idx',
  properties: ['geometry', 'marketIdentifier'],
  type: 'GIST',
  expression:
    'create index "company_geometry_market_identifier_idx" on "company" USING GIST("geometry", "market_identifier")',
})
export class Company {
  [EntityRepositoryType]?: CompanyRepository;

  @PrimaryKey()
  id: number;

  @Index({ type: 'GIST' })
  @Property({ type: PointType })
  geometry: Point;

  @Index()
  @Property({ length: 255 })
  importId: string;

  @Property({ length: 255 })
  companyName: string;

  @Property({ length: 255 })
  marketIdentifier: string;

  @Property({ length: 255 })
  marketLabel: string;
}
