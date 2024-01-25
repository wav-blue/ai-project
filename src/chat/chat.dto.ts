import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
// import { Chat } from 'src/chat/chat.schema';

class TestResultType {
  @IsString()
  @IsNotEmpty()
  classification: string;

  @IsOptional()
  @IsArray()
  situation?: string[];
}

export class CreateFreeChatDto {
  @IsOptional()
  @IsString()
  userId: string;

  @IsString()
  @IsNotEmpty()
  question: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TestResultType)
  testResult?: TestResultType;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

class ChatInfoType {
  @IsNotEmpty()
  @IsString()
  chatId: string;

  @IsNotEmpty()
  @IsString()
  title: string;
}

class ChatHistoryType {
  @IsString()
  @IsNotEmpty()
  chatHistory: string;
}

export class response1stChatDto {
  @IsArray()
  @ValidateNested()
  @Type(() => ChatInfoType)
  chatInfo: ChatInfoType;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ChatHistoryType)
  chatHistory: ChatHistoryType;
}
