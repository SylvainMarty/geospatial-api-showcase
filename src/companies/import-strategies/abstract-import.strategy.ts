import { Company } from '@/companies/entities/company.entity';
import { FastJsonParser } from '@/shared/helpers/fast-json.parser';

export abstract class AbstractImportStrategy {
  /**
   * Return true if the import file is supported else false
   */
  public abstract supportsImport(json: FastJsonParser): boolean;

  /**
   * Returns the identifier of the imported file
   */
  public abstract getImportId(json: FastJsonParser): string;

  /**
   * A generator function that returns a Company entity from the imported JSON file
   */
  public abstract generateCompany(
    json: FastJsonParser,
  ): Generator<Company> | AsyncGenerator<Company>;
}
