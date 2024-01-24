import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Chat } from 'src/chat/chat.schema';

export class CreateFreeChatDto {
  userId?: string;

  @IsNotEmpty()
  @IsString()
  question: string;

  testResult?: { classification: string; situation?: string };

  @IsString()
  imageUrl?: string;
}
