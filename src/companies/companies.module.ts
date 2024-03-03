import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { CommandBus, CqrsModule } from '@nestjs/cqrs';
import { HttpModule } from '@nestjs/axios';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Company } from '@/companies/entities/company.entity';
import { NafCode } from '@/companies/entities/naf-code.entity';
import { RefreshNafCodesHandler } from '@/companies/commands/handlers/refresh-naf-codes.handler';
import { RefreshNafCodesCommand } from '@/companies/commands/impl/refresh-naf-codes.command';
import { NafCodeRepository } from '@/companies/repositories/naf-code.repository';

@Module({
  imports: [
    CqrsModule,
    MikroOrmModule.forFeature([Company, NafCode]),
    HttpModule.register({
      timeout: 5000,
    }),
  ],
  providers: [NafCodeRepository, RefreshNafCodesHandler],
})
export class CompaniesModule implements OnApplicationBootstrap {
  constructor(private readonly commandBus: CommandBus) {}

  onApplicationBootstrap() {
    this.commandBus.execute(
      new RefreshNafCodesCommand({ ignoreIfIndexNotEmpty: true }),
    );
  }
}
