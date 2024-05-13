import { IsOptional } from 'class-validator';

export class QueryPageDto {
  @IsOptional()
  page: number = 1;

  @IsOptional()
  limit: number = 15;
}
