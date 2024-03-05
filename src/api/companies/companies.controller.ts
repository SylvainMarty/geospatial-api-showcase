import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ImportCompaniesCommand } from '@/companies/commands/impl/import-companies.command';
import { FileDto } from '@/shared/dto/file.dto';
import { GetPaginatedCompaniesQuery } from '@/companies/queries/impl/get-paginated-companies.query';
import {
  GetCompaniesRequestDto,
  GetCompaniesResponseDto,
} from '@/api/companies/dto/get-companies.dto';
import { convertDtoToPolygon } from '@/api/dto/geometry';
import { Pagination } from '@/shared/mikro-orm/pagination';
import { Company } from '@/companies/entities/company.entity';
import { createPaginationDto, PaginationDto } from '@/api/dto/pagination';
import { InvalidArgumentException } from '@/shared/exceptions/invalid-argument.exception';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('companies')
@ApiBearerAuth()
@ApiTags('Companies')
export class CompaniesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({
    description:
      'Get companies filtered by polygon and/or market identifiers (ex: french NAF codes) sorted by company name',
  })
  @ApiBody({ type: GetCompaniesRequestDto })
  @ApiResponse({ type: createPaginationDto(GetCompaniesResponseDto) })
  async getCompanies(@Body() dto: GetCompaniesRequestDto) {
    const paginatedResults = await this.queryBus.execute<
      GetPaginatedCompaniesQuery,
      Pagination<Company>
    >(
      new GetPaginatedCompaniesQuery(
        convertDtoToPolygon(dto.polygon),
        dto.marketIdentifiers,
        dto.page,
        dto.limit,
      ),
    );
    return new PaginationDto<GetCompaniesResponseDto>(
      paginatedResults.results.map(GetCompaniesResponseDto.createFromCompany),
      paginatedResults.pageCount,
      paginatedResults.totalCount,
    );
  }

  @Post('/import')
  @ApiOperation({
    description:
      'Upload companies to the database from a GeoJSON file and override exiting entries if they exists',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          description: 'A GeoJSON file representing the companies',
          type: 'string',
          format: 'binary',
          nullable: false,
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadCompanies(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    try {
      await this.commandBus.execute(
        new ImportCompaniesCommand(new FileDto(file.originalname, file.buffer)),
      );
    } catch (error) {
      if (error instanceof InvalidArgumentException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
