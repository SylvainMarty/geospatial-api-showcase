import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@mikro-orm/nestjs';
import { GetPaginatedCompaniesQuery } from '@/companies/queries/impl/get-paginated-companies.query';
import { CompanyRepository } from '@/companies/repositories/company.repository';
import { Company } from '@/companies/entities/company.entity';
import { Pagination } from '@/shared/mikro-orm/pagination';

@QueryHandler(GetPaginatedCompaniesQuery)
export class GetPaginatedCompaniesHandler
  implements IQueryHandler<GetPaginatedCompaniesQuery>
{
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: CompanyRepository,
  ) {}

  async execute(
    query: GetPaginatedCompaniesQuery,
  ): Promise<Pagination<Company>> {
    return this.companyRepository.findPaginatedCompaniesFromPolygonAndMarketIdentifies(
      query.polygon,
      query.marketIdentifiers,
      query.page,
      query.limit,
    );
  }
}
