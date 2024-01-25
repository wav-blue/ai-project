import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ChatDocument = HydratedDocument<Chat>;

@Schema({ collection: 'chat' })
export class Chat {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  dialogue: Array<{ role: string; content: string; no: number }>;

  @Prop({ required: true })
  nextPromptToken: number;

  @Prop({ required: true })
  sessions: number;

  @Prop({ required: true })
  log: Array<{
    no: number;
    completionId: string;
    token: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
    fingerPrint: string;
    date: Date;
  }>;

  @Prop({ required: true })
  imageLog: Array<{ count: number; uploadedAt: Date }>;

  @Prop({ required: true })
  tokenUsageRecords: number;

  @Prop({ required: true })
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  lodedSession: number;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
