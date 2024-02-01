import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ChatCompletionMessageParam } from 'openai/resources';

export type ChatDocument = HydratedDocument<Chat>;

@Schema({ collection: 'chat', timestamps: true })
export class Chat {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  dialogue: ChatCompletionMessageParam[]; //GPT에게 전달할 대화맥락(가공됨)

  @Prop({ required: true }) //현재 저장되어있는 이전 대화맥락이 몇 토큰 짜리인지(얼마나 길어졌는지) 나타내는 데이터
  nextPromptToken: number;

  @Prop({ required: true }) //여태까지 티키타카 하면서 사용한 총 토큰 사용량
  tokenUsageRecords: number;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
