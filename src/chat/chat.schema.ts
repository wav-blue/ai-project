import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId } from 'mongoose';

export type ChatDocument = HydratedDocument<Chat>;

@Schema()
export class Chat {
  @Prop({ required: true })
  _id: ObjectId;

  @Prop({ required: true })
  userId: string;

  @Prop()
  subject: string;

  @Prop({ required: true })
  dialogue: Array<{ role: string; content: string }>;

  @Prop()
  log: Array<{ no: number; act: string; token: number; date: Date }>;

  @Prop({ required: true })
  token: number;

  @Prop()
  session: number;

  @Prop()
  imageLog: Array<{ count: number; uploadedAt: Date }>;

  @Prop({ required: true })
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  lodedSession: number;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
