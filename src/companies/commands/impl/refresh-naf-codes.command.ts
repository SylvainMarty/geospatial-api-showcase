export class RefreshNafCodesCommand {
  constructor(
    public readonly options: { ignoreIfIndexNotEmpty: boolean } = {
      ignoreIfIndexNotEmpty: true,
    },
  ) {}
}
