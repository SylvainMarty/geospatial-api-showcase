import { Polygon } from '@/shared/geometry/polygon';

export class GetPaginatedCompaniesQuery {
  constructor(
    public readonly polygon: Polygon,
    public readonly marketIdentifiers: string[],
    public readonly page: number,
    public readonly limit: number,
  ) {}
}
