import { ApiProperty } from '@nestjs/swagger';
import { IsPolygon, LocationDto, PolygonDto } from '@/api/dto/geometry';
import { Company } from '@/companies/entities/company.entity';
import { IsArray, IsInt, Max, Validate } from 'class-validator';

export class GetCompaniesRequestDto {
  @ApiProperty({
    isArray: true,
    example: [
      [1.4372464947027197, 43.61070566548099],
      [1.4372464947027197, 43.592870094963246],
      [1.4730804078930078, 43.592870094963246],
      [1.4730804078930078, 43.61070566548099],
      [1.4372464947027197, 43.61070566548099],
    ],
  })
  @Validate(IsPolygon)
  polygon: PolygonDto;

  @ApiProperty({
    example: ['58.21Z'],
    description:
      'A list of company market identifiers (ex: NAF codes for french companies)',
    externalDocs: {
      description: 'French NAF codes list',
      url: 'https://github.com/SocialGouv/codes-naf/blob/master/index.json',
    },
  })
  @IsArray()
  marketIdentifiers: string[];

  @ApiProperty({ default: 1 })
  @IsInt()
  page: number;

  @ApiProperty({
    description: 'The maximum number of element in one page (max 500)',
    default: 250,
  })
  @IsInt()
  @Max(500)
  limit: number = 250;
}

export class GetCompaniesResponseDto {
  @ApiProperty()
  location: LocationDto;

  @ApiProperty()
  importId: string;

  @ApiProperty()
  companyName: string;

  @ApiProperty()
  marketIdentifier: string;

  @ApiProperty()
  marketLabel: string;

  public static createFromCompany(company: Company): GetCompaniesResponseDto {
    const dto = new GetCompaniesResponseDto();
    dto.location = LocationDto.createFromPoint(company.geometry);
    dto.companyName = company.companyName;
    dto.marketIdentifier = company.marketIdentifier;
    dto.marketLabel = company.marketLabel;
    return dto;
  }
}
