export class Pagination<T> {
  constructor(
    public readonly results: T[],
    public readonly pageCount: number,
    public readonly totalCount: number,
  ) {}
}
