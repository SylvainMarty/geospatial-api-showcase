import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { LoginRequestDto } from '@/api/auth/dto/login.dto';
import { AuthService } from '@/auth/auth.service';
import { LocalAuthGuard } from '@/auth/local-auth.guard';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @ApiBody({ type: LoginRequestDto })
  async login(
    @Body() loginRequest: LoginRequestDto,
    @Request() req: Express.Request,
  ) {
    return this.authService.login(req.user);
  }
}
