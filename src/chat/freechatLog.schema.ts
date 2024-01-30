import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ChatLogType, ImageLogType } from './chat.dto';

export type FreeChatLogDocument = HydratedDocument<FreeChatLog>;

@Schema({ collection: 'freechatlog', timestamps: true })
export class FreeChatLog {
  @Prop({ required: true })
  log: ChatLogType[]; //로그기록 분석용, 각 배열에 각 세션에 전송한 전체 다이알로그가 들어감(핑거프린트 관찰용)

  @Prop({ required: true })
  imageLog?: ImageLogType[];
}

export const FreeChatLogSchema = SchemaFactory.createForClass(FreeChatLog);
