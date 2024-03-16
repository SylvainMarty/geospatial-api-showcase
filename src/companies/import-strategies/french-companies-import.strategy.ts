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

  public async supportsImport(json: FastJsonParser): Promise<boolean> {
    try {
      if (
        (await json.getParsedValueFromKey<string>('type').next()).value !== 'FeatureCollection' ||
        (await json.getParsedValueFromKey<string>('crs.properties.name').next()).value !==
          'urn:ogc:def:crs:OGC:1.3:CRS84'
      ) {
        return false;
      }

      const firstFeoJsonFeatureProps = (await json.getParsedValueFromKey<
        Record<string, unknown>
      >('features', { isArray: true }).next()).value?.properties;
      return (
        !!firstFeoJsonFeatureProps?.denomination &&
        !!firstFeoJsonFeatureProps?.activiteprincipaleetablissement
      );
    } catch (error) {
      return false;
    }
  }

  public async getImportId(json: FastJsonParser): Promise<string> {
    return (await json.getParsedValueFromKey<string>('name').next()).value;
  }

  public async *generateCompany(json: FastJsonParser): AsyncGenerator<Company> {
    const importGeoJsonRef = (await json.getParsedValueFromKey<string>('name').next()).value;
    const marketLabelsByNafCode = await this.queryBus.execute<
      GetMarketLabelsIndexedByNafCodeQuery,
      Record<string, string>
    >(new GetMarketLabelsIndexedByNafCodeQuery());
    const features =
      json.getParsedValueFromKey<FeatureContent>('features', { isArray: true });
    for await (const feature of features) {
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
