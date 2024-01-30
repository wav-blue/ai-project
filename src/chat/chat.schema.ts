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
  dialogue: ChatCompletionMessageParam[]; //클라이언트 표시, GPT에게 전달할 대화맥락(가공됨)

  @Prop({ required: true })
  nextPromptToken: number;

  @Prop({ required: true })
  tokenUsageRecords: number;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
