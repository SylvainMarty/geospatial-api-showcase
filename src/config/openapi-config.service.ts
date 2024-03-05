import { Injectable } from '@nestjs/common';
import { DocumentBuilder } from '@nestjs/swagger';

@Injectable()
export class OpenapiConfigService {
  public getDocumentConfig() {
    return new DocumentBuilder()
      .setTitle('Population API')
      .setDescription(
        'This API helps companies identify which places are interesting to establish a new selling point and maximize ROI.',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build();
  }
}
