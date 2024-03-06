import { mixin } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

// eslint-disable-next-line @typescript-eslint/ban-types
type Constructor<T = {}> = new (...args: any[]) => T;

export class PaginationDto<T> {
  results: T[];

  @ApiProperty()
  pageCount: number;

  @ApiProperty()
  totalCount: number;

  constructor(results: T[], pageCount: number, totalCount: number) {
    this.results = results;
    this.pageCount = pageCount;
    this.totalCount = totalCount;
  }
}

/**
 * Type mixin to make generic typing works with NestJS OpenAPI
 */
export function createPaginationDto<TBase extends Constructor>(Base: TBase) {
  class TypedPaginationDto extends PaginationDto<TBase> {
    @ApiProperty({
      isArray: true,
      type: Base,
    })
    items: Array<InstanceType<TBase>>;
  }
  return mixin(TypedPaginationDto);
}
