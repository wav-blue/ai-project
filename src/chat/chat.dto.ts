import { IsNotEmpty, IsString } from 'class-validator';
// import { Chat } from 'src/chat/chat.schema';

export class CreateFreeChatDto {
  @IsString()
  userId?: string;

  @IsNotEmpty()
  @IsString()
  question: string;

  testResult?: { classification: string; situation?: string[] };

  @IsString()
  imageUrl?: string;
}
