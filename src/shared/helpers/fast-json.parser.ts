import * as simdjson from 'simdjson';
import { InvalidArgumentException } from '@/shared/exceptions/invalid-argument.exception';

/**
 * This class is a facade of the library used to parse big JSON file efficiently
 */
export class FastJsonParser {
  private jsonBuffer: simdjson.JSONTape;

  constructor(json: string) {
    this.jsonBuffer = simdjson.lazyParse(json);
  }

  public static isValid(json: string): boolean {
    return simdjson.isValid(json);
  }

  public getParsedValueFromKey<T>(key: string): T {
    try {
      return this.jsonBuffer.valueForKeyPath(key);
    } catch (error) {
      throw new InvalidArgumentException(
        `Could not find the following JSON field: ${key}`,
      );
    }
  }
}
