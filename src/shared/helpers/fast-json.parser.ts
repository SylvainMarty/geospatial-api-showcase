import { Readable } from 'stream'
import { chain } from 'stream-chain';
import { verifier } from 'stream-json/utils/Verifier';
import * as Pick from 'stream-json/filters/Pick';
import { streamArray } from 'stream-json/streamers/StreamArray';
import { streamValues } from 'stream-json/streamers/StreamValues';
import { InvalidArgumentException } from '@/shared/exceptions/invalid-argument.exception';

/**
 * This class is a facade of the library used to parse big JSON file efficiently
 */
export class FastJsonParser {
  constructor(private readonly jsonBuffer: Buffer) {}

  public async isValid(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const pipeline = chain([
        Readable.from(this.jsonBuffer),
        verifier()
      ]);
      pipeline
        .on('error', () => resolve(false))
        .on('end', () => resolve(true));
    });
  }

  public async *getParsedValueFromKey<T>(key: string, options: { isArray?: boolean } = {}): AsyncGenerator<T> {
    const pipeline = chain([
      Readable.from(this.jsonBuffer),
      Pick.withParser({filter: key}),
      options?.isArray ? streamArray() : streamValues()
    ]);
    let foundData = 0;
    for await (const data of pipeline) {
      foundData++;
      yield data.value;
    }
    if (foundData === 0) {
      throw new InvalidArgumentException(
        `Could not find the following JSON field: ${key}`,
      );
    }
  }
}
