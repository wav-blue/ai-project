import { IsNotEmpty } from 'class-validator';

export class CreateCommentReportDto {
  @IsNotEmpty()
  commentId: number;

  @IsNotEmpty()
  reportUserId: string;

  @IsNotEmpty()
  targetUserId: string;

  @IsNotEmpty()
  reportType: string;
}
