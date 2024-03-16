import { Test } from '@nestjs/testing';
import { FrenchCompaniesImportStrategy } from '@/companies/import-strategies/french-companies-import.strategy';
import { QueryBus } from '@nestjs/cqrs';
import { FastJsonParser } from '@/shared/helpers/fast-json.parser';
import { InvalidArgumentException } from '@/shared/exceptions/invalid-argument.exception';
import { Company } from '@/companies/entities/company.entity';
import { Point } from '@/shared/geometry/point';

const validGeoJson = {
  type: 'FeatureCollection',
  name: 'some-businesses',
  crs: {
    type: 'name',
    properties: {
      name: 'urn:ogc:def:crs:OGC:1.3:CRS84',
    },
  },
  features: [
    {
      type: 'Feature',
      properties: {
        _uid_: 1,
        denomination: 'CNRS-DELEGATION MIDI PYRENEES (0)',
        activiteprincipaleetablissement: '72.20Z',
      },
      geometry: {
        type: 'Point',
        coordinates: [1.42263, 43.596716],
      },
    },
    {
      type: 'Feature',
      properties: {
        _uid_: 2,
        denomination: 'Kok Bernard',
        activiteprincipaleetablissement: '47.71Z',
      },
      geometry: {
        type: 'Point',
        coordinates: [1.445984, 43.602908],
      },
    },
  ],
};

describe('FrenchCompaniesImportStrategy', () => {
  const queryBusMock = { execute: jest.fn() };
  let strategy: FrenchCompaniesImportStrategy;

  beforeEach(async () => {
    jest.resetAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        { provide: QueryBus, useValue: queryBusMock },
        FrenchCompaniesImportStrategy,
      ],
    }).compile();

    strategy = module.get(FrenchCompaniesImportStrategy);
  });

  describe('supportsImport', () => {
    it('returns true when the GeoJSON is fully supported', async () => {
      const jsonParser = new FastJsonParser(Buffer.from(JSON.stringify(validGeoJson)));

      const result = await strategy.supportsImport(jsonParser);

      expect(result).toStrictEqual(true);
    });

    it('returns false when the JSON file does not contain the properties needed', async () => {
      const jsonParser = new FastJsonParser(Buffer.from('{}'));

      const result = await strategy.supportsImport(jsonParser);

      expect(result).toStrictEqual(false);
    });

    it('returns false when "type" property of the GeoJSON is not supported', async () => {
      const invalidGeoJson = {
        type: 'SomeOtherType',
      };
      const jsonParser = new FastJsonParser(Buffer.from(JSON.stringify(invalidGeoJson)));

      const result = await strategy.supportsImport(jsonParser);

      expect(result).toStrictEqual(false);
    });

    it('returns false when "crs.properties.name" property of the GeoJSON is not supported', async () => {
      const invalidGeoJson = {
        type: 'FeatureCollection',
        crs: {
          type: 'name',
          properties: {
            name: 'SOME-OTHER-VALUE',
          },
        },
      };
      const jsonParser = new FastJsonParser(Buffer.from(JSON.stringify(invalidGeoJson)));

      const result = await strategy.supportsImport(jsonParser);

      expect(result).toStrictEqual(false);
    });

    it('returns false when the first GeoJSON feature properties are not supported', async () => {
      const invalidGeoJson = {
        type: 'FeatureCollection',
        crs: {
          type: 'name',
          properties: {
            name: 'urn:ogc:def:crs:OGC:1.3:CRS84',
          },
        },
        features: [
          {
            type: 'Feature',
            properties: {
              _uid_: 1,
              companyName: 'CNRS-DELEGATION MIDI PYRENEES (0)',
            },
          },
        ],
      };
      const jsonParser = new FastJsonParser(Buffer.from(JSON.stringify(invalidGeoJson)));

      const result = await strategy.supportsImport(jsonParser);

      expect(result).toStrictEqual(false);
    });
  });

  describe('getImportId', () => {
    it('returns the value of "name" property in the GeoJSON', async () => {
      const jsonParser = new FastJsonParser(Buffer.from(JSON.stringify(validGeoJson)));

      const result = await strategy.getImportId(jsonParser);

      expect(result).toEqual('some-businesses');
    });

    it('throws an error when the property "name" does not exist', async () => {
      const invalidGeoJson = {
        type: 'FeatureCollection',
      };
      const jsonParser = new FastJsonParser(Buffer.from(JSON.stringify(invalidGeoJson)));

      expect(strategy.getImportId(jsonParser)).rejects.toThrow(
        InvalidArgumentException,
      );
    });
  });

  describe('generateCompany', () => {
    it('returns an async generator that yield 2 companies', async () => {
      const jsonParser = new FastJsonParser(Buffer.from(JSON.stringify(validGeoJson)));
      queryBusMock.execute.mockResolvedValue({
        '72.20Z': 'Recherche-développement en sciences humaines et sociales',
        '47.71Z': "Commerce de détail d'habillement en magasin spécialisé",
      });

      const generator = strategy.generateCompany(jsonParser);

      expect((await generator.next()).value).toEqual(
        generateTestCompany({
          importId: 'some-businesses',
          companyName: 'CNRS-DELEGATION MIDI PYRENEES (0)',
          marketIdentifier: '72.20Z',
          marketLabel:
            'Recherche-développement en sciences humaines et sociales',
          geometry: new Point(1.42263, 43.596716),
        }),
      );
      expect((await generator.next()).value).toEqual(
        generateTestCompany({
          importId: 'some-businesses',
          companyName: 'Kok Bernard',
          marketIdentifier: '47.71Z',
          marketLabel: "Commerce de détail d'habillement en magasin spécialisé",
          geometry: new Point(1.445984, 43.602908),
        }),
      );
    });

    it('throws an error when the property "features" does not exist', () => {
      const invalidGeoJson = {
        type: 'FeatureCollection',
      };
      const jsonParser = new FastJsonParser(Buffer.from(JSON.stringify(invalidGeoJson)));

      const generator = strategy.generateCompany(jsonParser);

      expect(generator.next()).rejects.toThrow(InvalidArgumentException);
    });
  });
});

function generateTestCompany(companyOverride: Partial<Company>) {
  const company = new Company();
  Object.assign(company, companyOverride);
  return company;
}
