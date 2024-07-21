import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { QueryRunner } from 'typeorm';
//import { User } from 'src/user/user.entity';

//게시물 작성
export class CreateBoardDto {
  userId?: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsString()
  tag?: string;
}

//게시물 수정
export class UpdateBoardDto {
  userId?: string;

  @IsNotEmpty()
  @IsNumber()
  boardId: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsString()
  tag?: string;
}

export class BoardsListQueryDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => parseInt(value, 10))
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => parseInt(value, 10))
  @IsNumber()
  limit?: number = 15;
}

export class BoardSearchAndListDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsNotEmpty()
  @IsNumber()
  limit: number;

  @IsNotEmpty()
  queryRunner: QueryRunner;
}

//게시물 신고 작성
export class CreateBoardReportDto {
  @IsNotEmpty()
  boardId: number;

  reportUserId: string;

  @IsString()
  reportType: string;
}
