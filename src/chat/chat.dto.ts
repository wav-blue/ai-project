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
import { ChatCompletionMessageParam, CompletionUsage } from 'openai/resources';
// import { Chat } from 'src/chat/chat.schema';

class TestResultType {
  @IsString()
  @IsNotEmpty()
  classification: string;

  @IsOptional()
  @IsArray()
  situation?: string[];
}
export class Create1stChatDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsString()
  @IsNotEmpty()
  question: string;

  @IsOptional()
  @IsArray()
  history?: string[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TestResultType)
  testResult?: TestResultType;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class CreateFreeChatDto {
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

export class ChatLogType {
  @IsString()
  @IsNotEmpty()
  completionId: string;

  token: CompletionUsage;

  @IsString()
  @IsNotEmpty()
  fingerPrint: string;

  @IsNotEmpty()
  date: Date;

  message: ChatCompletionMessageParam[];
}

export class ImageLogType {
  count: number;

  uploadedAt: Date;
}

export class UpdateChatDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  chatId?: string; //history 배열 빼고 chatId만 꺼냄, API 명세서에서 고쳐줘야 함..

  @IsNotEmpty()
  @IsString()
  question: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class ReturnReadChatDto {
  @IsNotEmpty()
  @IsNumber()
  cursor: number;

  @IsNotEmpty()
  @IsArray()
  history: string[];

  @IsOptional()
  @IsString()
  message?: string;
}
