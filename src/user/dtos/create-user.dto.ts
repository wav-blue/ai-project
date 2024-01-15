import { IsNotEmpty, IsEnum, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEnum({ enum: ['EMAIL', 'GOOGLE', 'KAKAO'] })
  logintype: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsString()
  password: string;
}
