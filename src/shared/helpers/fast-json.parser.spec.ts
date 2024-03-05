import { FastJsonParser } from '@/shared/helpers/fast-json.parser';
import { InvalidArgumentException } from '@/shared/exceptions/invalid-argument.exception';

describe('FastJsonParser', () => {
  describe('isValid', () => {
    it('returns true when JSON is valid', () => {
      const validJson = {
        some: 'property',
      };

      expect(FastJsonParser.isValid(JSON.stringify(validJson))).toEqual(true);
    });

    it('returns false when JSON is invalid', () => {
      expect(FastJsonParser.isValid('{')).toEqual(false);
    });
  });

  describe('getParsedValueFromKey', () => {
    it('returns the value of the key passed in parameter', () => {
      const json = {
        message: 'Hello world',
      };

      const jsonParser = new FastJsonParser(JSON.stringify(json));

      expect(jsonParser.getParsedValueFromKey('message')).toEqual(
        'Hello world',
      );
    });

    it('returns the value of the nested key passed in parameter', () => {
      const json = {
        nested: {
          property: 'Hello world',
        },
      };

      const jsonParser = new FastJsonParser(JSON.stringify(json));

      expect(jsonParser.getParsedValueFromKey('nested.property')).toEqual(
        'Hello world',
      );
    });

    it('returns the value of the array key passed in parameter', () => {
      const json = {
        array: ['Hello world'],
      };

      const jsonParser = new FastJsonParser(JSON.stringify(json));

      expect(jsonParser.getParsedValueFromKey('array[0]')).toEqual(
        'Hello world',
      );
    });

    it('throws an error when the key does not exist', () => {
      const invalidGeoJson = {
        message: 'Hello world',
      };
      const jsonParser = new FastJsonParser(JSON.stringify(invalidGeoJson));

      expect(() =>
        jsonParser.getParsedValueFromKey('non_existing_key'),
      ).toThrow(
        new InvalidArgumentException(
          `Could not find the following JSON field: non_existing_key`,
        ),
      );
    });
  });
});
