import { FastJsonParser } from '@/shared/helpers/fast-json.parser';
import { InvalidArgumentException } from '@/shared/exceptions/invalid-argument.exception';

describe('FastJsonParser', () => {
  describe('isValid', () => {
    it('returns true when JSON is valid', async () => {
      const validJson = {
        some: 'property',
      };
      const parser = new FastJsonParser(Buffer.from(JSON.stringify(validJson)));

      const result = await parser.isValid();

      expect(result).toEqual(true);
    });

    it('returns false when JSON is invalid', async () => {
      const parser = new FastJsonParser(Buffer.from('{'));

      const result = await parser.isValid();

      expect(result).toEqual(false);
    });
  });

  describe('getParsedValueFromKey', () => {
    it('returns the value of the key passed in parameter', async () => {
      const json = {
        message: 'Hello world',
      };
      const jsonParser = new FastJsonParser(Buffer.from(JSON.stringify(json)));

      const generator = jsonParser.getParsedValueFromKey('message');

      expect((await generator.next()).value).toEqual(
        'Hello world',
      );
      expect((await generator.next()).done).toBeTruthy;
    });

    it('returns the value of the nested key passed in parameter', async () => {
      const json = {
        nested: {
          property: 'Hello world',
        },
      };
      const jsonParser = new FastJsonParser(Buffer.from(JSON.stringify(json)));

      const generator = jsonParser.getParsedValueFromKey('nested.property');

      expect((await generator.next()).value).toEqual(
        'Hello world',
      );
      expect((await generator.next()).done).toBeTruthy;
    });

    it('returns all the values of the array key passed in parameter', async () => {
      const json = {
        array: ['Hello world'],
      };
      const jsonParser = new FastJsonParser(Buffer.from(JSON.stringify(json)));

      const generator = jsonParser.getParsedValueFromKey('array');

      expect((await generator.next()).value).toEqual(
        ['Hello world'],
      );
      expect((await generator.next()).done).toBeTruthy;
    });

    it('returns the each value of the array key passed in parameter', async () => {
      const json = {
        array: ['Hello world'],
      };
      const jsonParser = new FastJsonParser(Buffer.from(JSON.stringify(json)));

      const generator = jsonParser.getParsedValueFromKey('array', { isArray: true });

      expect((await generator.next()).value).toEqual(
        'Hello world',
      );
      expect((await generator.next()).done).toBeTruthy;
    });

    it('throws an error when the key does not exist', async () => {
      const invalidGeoJson = {
        message: 'Hello world',
      };
      const jsonParser = new FastJsonParser(Buffer.from(JSON.stringify(invalidGeoJson)));

      const generator = jsonParser.getParsedValueFromKey('non_existing_key');

      expect(generator.next()).rejects.toThrow(
        new InvalidArgumentException(
          `Could not find the following JSON field: non_existing_key`,
        ),
      );
    });
  });
});
