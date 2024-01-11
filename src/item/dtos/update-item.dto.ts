import { IsNotEmpty } from 'class-validator';

export class UpdateItemDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;
}
