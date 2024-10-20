import { IsNotEmpty } from 'class-validator';

export class CreateReportCommentDto {
  @IsNotEmpty()
  commentId: number;

  @IsNotEmpty()
  reportType: string;

  reportUserId: string;
}
