import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersService } from '@/auth/users.service';
import { LocalStrategy } from '@/auth/local.strategy';
import { AuthService } from '@/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfigFactory } from '@/auth/jwt-config.factory';
import { JwtStrategy } from '@/auth/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useClass: JwtConfigFactory,
    }),
  ],
  providers: [
    UsersService,
    AuthService,
    LocalStrategy,
    JwtConfigFactory,
    JwtStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
