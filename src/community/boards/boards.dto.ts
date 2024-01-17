import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

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
