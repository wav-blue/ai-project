import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ChatCompletionContentPart } from 'openai/resources';

export type ChatDialogueDocument = HydratedDocument<ChatDialogue>;

@Schema({ collection: 'chat-dialogue', timestamps: true })
export class ChatDialogue {
  @Prop({ required: true })
  chatId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  dialogue: (string | ChatCompletionContentPart[])[];
}

export const ChatDialogueSchema = SchemaFactory.createForClass(ChatDialogue);
