import { Injectable } from '@nestjs/common';
import { AbstractImportStrategy } from '@/companies/import-strategies/abstract-import.strategy';
import { Company } from '../entities/company.entity';
import { FastJsonParser } from '@/shared/helpers/fast-json.parser';
import { QueryBus } from '@nestjs/cqrs';
import { GetMarketLabelsIndexedByNafCodeQuery } from '@/companies/queries/impl/get-market-labels-indexed-by-naf-code.query';
import { Point } from '@/shared/geometry/point';

export type FeatureContent = {
  geometry: {
    type: string;
    coordinates: number[];
  };
  properties: {
    denomination: string;
    activiteprincipaleetablissement: string;
  };
};

@Injectable()
export class FrenchCompaniesImportStrategy extends AbstractImportStrategy {
  constructor(private readonly queryBus: QueryBus) {
    super();
  }

  public supportsImport(json: FastJsonParser): boolean {
    try {
      if (
        json.getParsedValueFromKey<string>('type') !== 'FeatureCollection' ||
        json.getParsedValueFromKey<string>('crs.properties.name') !==
          'urn:ogc:def:crs:OGC:1.3:CRS84'
      ) {
        return false;
      }

      const firstFeoJsonFeatureProps = json.getParsedValueFromKey<
        Record<string, unknown>
      >('features[0].properties');
      return (
        !!firstFeoJsonFeatureProps.denomination &&
        !!firstFeoJsonFeatureProps.activiteprincipaleetablissement
      );
    } catch (error) {
      return false;
    }
  }

  public getImportId(json: FastJsonParser): string {
    return json.getParsedValueFromKey<string>('name');
  }

  public async *generateCompany(json: FastJsonParser): AsyncGenerator<Company> {
    const importGeoJsonRef = json.getParsedValueFromKey<string>('name');
    const marketLabelsByNafCode = await this.queryBus.execute<
      GetMarketLabelsIndexedByNafCodeQuery,
      Record<string, string>
    >(new GetMarketLabelsIndexedByNafCodeQuery());
    const features =
      json.getParsedValueFromKey<Array<FeatureContent>>('features');
    for (const feature of features) {
      const company = new Company();
      company.companyName = feature.properties.denomination;
      company.marketIdentifier =
        feature.properties.activiteprincipaleetablissement;
      company.marketLabel = marketLabelsByNafCode[company.marketIdentifier];
      const [lat, lng] = feature.geometry.coordinates;
      company.geometry = new Point(lat, lng);
      company.importId = importGeoJsonRef;
      yield company;
    }
  }
}
