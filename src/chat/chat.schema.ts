import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ChatLogType, ImageLogType } from './chat.dto';
import { ChatCompletionMessageParam } from 'openai/resources';
import { Dayjs } from 'dayjs';

export type ChatDocument = HydratedDocument<Chat>;

@Schema({ collection: 'chat', timestamps: true })
export class Chat {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  dialogue: ChatCompletionMessageParam[]; //클라이언트 에 표시, GPT에게 전달할 대화맥락(가공됨)

  @Prop({ required: true })
  nextPromptToken: number;

  @Prop({ required: true })
  sessions: number;

  @Prop({ required: true })
  log: ChatLogType[]; //로그기록 분석용

  @Prop({ required: true })
  imageLog?: ImageLogType[];

  @Prop({ required: true })
  tokenUsageRecords: number;

  // @Prop()
  // createdAt?: Dayjs;

  // @Prop()
  // updatedAt?: Dayjs;

  // @Prop()
  // deletedAt?: Dayjs;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
