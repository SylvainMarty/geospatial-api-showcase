/* eslint no-unused-vars: 0 */
/* eslint @typescript-eslint/no-unused-vars: 0 */
import { LoggerService } from '@nestjs/common';

/**
 * Logger to use to disable logs during testing
 */
export class EmptyLogger implements LoggerService {
  log(message: string): any {}
  error(message: string, trace: string): any {}
  warn(message: string): any {}
  debug(message: string): any {}
  verbose(message: string): any {}
}
