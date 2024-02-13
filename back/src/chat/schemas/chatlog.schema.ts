import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ChatLogType, ImageLogType } from '../dtos/chat.dto';

export type ChatLogDocument = HydratedDocument<ChatLog>;

@Schema({ collection: 'chatlog', timestamps: true })
export class ChatLog {
  @Prop({ required: true })
  chatId: string; //chat schema의 _id

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  log: ChatLogType[]; //로그기록 분석용, 각 배열에 각 세션에 전송한 전체 다이알로그가 들어감(핑거프린트 관찰용)

  @Prop({ required: true })
  imageLog?: ImageLogType[];
}

export const ChatLogSchema = SchemaFactory.createForClass(ChatLog);
