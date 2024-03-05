import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { ImportCompaniesCommand } from '@/companies/commands/impl/import-companies.command';
import { FileDto } from '@/shared/dto/file.dto';
import { InvalidArgumentException } from '@/shared/exceptions/invalid-argument.exception';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('/import')
  @ApiOperation({
    description:
      'Upload companies to the database from a GeoJSON file and override exiting entries if they exists',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          description: 'A GeoJSON file representing the companies',
          type: 'string',
          format: 'binary',
          nullable: false,
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadCompanies(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    try {
      await this.commandBus.execute(
        new ImportCompaniesCommand(new FileDto(file.originalname, file.buffer)),
      );
    } catch (error) {
      if (error instanceof InvalidArgumentException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
