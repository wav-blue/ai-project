import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
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
  @IsOptional()
  question?: string;

  @IsString()
  @IsOptional()
  title?: string;

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
  @IsOptional()
  @IsBoolean()
  guest?: boolean;

  @IsString()
  @IsNotEmpty()
  completionId: string;

  token: CompletionUsage;

  @IsString()
  @IsNotEmpty()
  fingerPrint: string;

  @IsOptional()
  date?: Date;

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
  chatId?: string;

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
