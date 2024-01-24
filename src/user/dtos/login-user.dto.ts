import { IsNotEmpty, IsEnum, IsString } from 'class-validator';

enum loginEnum {
  EMAIL = 'EMAIL',
  GOOGLE = 'GOOGLE',
  KAKAO = 'KAKAO',
}
export class LoginUserDto {
  @IsNotEmpty()
  @IsEnum(Object.values(loginEnum))
  logintype: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsString()
  password: string;
}
