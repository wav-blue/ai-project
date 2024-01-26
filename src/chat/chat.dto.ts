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
import { Dayjs } from 'dayjs';
import {
  ChatCompletionAssistantMessageParam,
  ChatCompletionMessageParam,
} from 'openai/resources';
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

class TokenLogType {
  @IsNumber()
  prompt_tokens: number;

  @IsNumber()
  completion_tokens: number;

  @IsNumber()
  total_tokens: number;
}

export class ChatLogType {
  @IsNumber()
  @IsNotEmpty()
  no: number;

  @IsString()
  @IsNotEmpty()
  completionId: string;

  @ValidateNested()
  @Type(() => TokenLogType)
  token: TokenLogType;

  @IsString()
  @IsNotEmpty()
  fingerPrint: string;

  @IsNotEmpty()
  date: Dayjs;

  message: ChatCompletionMessageParam[];
}

export class Return1stCompletionDTO {
  @IsString()
  @IsNotEmpty()
  title: string;

  answer: ChatCompletionAssistantMessageParam;

  @IsNumber()
  @IsNotEmpty()
  nextPromptToken: number;

  @ValidateNested({ each: true })
  @Type(() => ChatLogType)
  log: ChatLogType;

  @IsNumber()
  @IsNotEmpty()
  tokenUsageRecords: number;
}

export class ImageLogType {
  count: number;

  uploadedAt: Date;
}
