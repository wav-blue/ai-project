import { IsNotEmpty } from 'class-validator';

export class CreateCommentReportDto {
  @IsNotEmpty()
  commentId: number;

  @IsNotEmpty()
  reportType: string;

  reportUserId: string;
}
