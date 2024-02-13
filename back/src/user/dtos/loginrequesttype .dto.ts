import { IsNotEmpty, IsString } from 'class-validator';

export class LoginRequestType {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
