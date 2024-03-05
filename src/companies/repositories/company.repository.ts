import { EntityRepository } from '@mikro-orm/postgresql';
import { Company } from '@/companies/entities/company.entity';
import { Polygon } from '@/shared/geometry/polygon';
import { Pagination } from '@/shared/mikro-orm/pagination';

const COMPANIES_PAGINATION_SIZE_LIMIT = 500;

export class CompanyRepository extends EntityRepository<Company> {
  /**
   * Native upsert function since Knex was returning an error using upsertMany...
   */
  public async insertManyNative(companies: Company[]): Promise<void> {
    const companyValues = companies
      .map((company) => {
        const params = {
          lat: company.geometry.latitude,
          long: company.geometry.longitude,
          imp_id: company.importId,
          name: company.companyName.replaceAll("'", "''"), // Fix single quotes
          marketId: company.marketIdentifier,
          marketLabel: company.marketLabel.replaceAll("'", "''"), // Fix single quotes
        };
        return `(ST_MakePoint(${params.lat}, ${params.long})::geometry(Point, 4326), '${params.imp_id}', '${params.name}', '${params.marketId}', '${params.marketLabel}')`;
      })
      .join(',');

    await this.em.getConnection().execute(`
      INSERT INTO company (geometry, import_id, company_name, market_identifier, market_label)
      VALUES ${companyValues}
    `);
  }

  public async findPaginatedCompaniesFromPolygonAndMarketIdentifies(
    polygon: Polygon,
    marketIdentifiers: string[],
    page: number,
    limit: number,
  ): Promise<Pagination<Company>> {
    const connection = this.em.getConnection();
    const safeLimit = Math.min(limit, COMPANIES_PAGINATION_SIZE_LIMIT);
    const offset = page > 1 ? page * safeLimit : 0;

    // FIXME: This is a SQL injection vulnerability, a safer method should be found
    // This is a workaround since PostGIS types are not supported by Mikro ORM query builder which throws a syntax error
    // See https://github.com/mikro-orm/mikro-orm/issues/749
    const points = polygon.points
      .map((point) => `${point.latitude} ${point.longitude}`)
      .join(',');
    let conditions = `where ST_Intersects(geometry,'POLYGON((${points}))'::geography::geometry)`;
    const params = [];
    if (marketIdentifiers.length) {
      conditions += ' and "c"."market_identifier" in (?)';
      params.push(marketIdentifiers);
    }

    // Get the total number of entries that matching the query
    const [{ count }] = await connection.execute(
      `
        select count(*)::int
        from company as c
        ${conditions}
      `,
      params,
    );
    // Fetch the paginated results
    const results = await connection.execute(
      `
        select
            c.id,
            ST_AsText(c.geometry) as geometry,
            c.import_id,
            c.company_name,
            c.market_identifier,
            c.market_label
        from company as c
        ${conditions}
        order by c.company_name asc
        offset ?
        limit ?
      `,
      [...params, offset, safeLimit],
    );

    return new Pagination<Company>(
      results.map((company) => this.map(company)),
      Math.ceil(count / safeLimit),
      count,
    );
  }
}
