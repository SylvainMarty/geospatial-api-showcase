import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginRequestDto {
  @ApiProperty({ example: 'chuck' })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'norris' })
  @IsNotEmpty()
  password: string;
}
