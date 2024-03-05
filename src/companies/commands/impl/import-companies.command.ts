import { FileDto } from '@/shared/dto/file.dto';

export class ImportCompaniesCommand {
  constructor(public readonly file: FileDto) {}
}
