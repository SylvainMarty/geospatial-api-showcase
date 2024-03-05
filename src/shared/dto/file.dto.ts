export class FileDto {
  constructor(
    public readonly fileName: string,
    public readonly buffer: Buffer,
  ) {}
}
