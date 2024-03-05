import { EntityRepository } from '@mikro-orm/postgresql';
import { Company } from '@/companies/entities/company.entity';

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
}
