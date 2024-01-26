import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatOpenAi } from './chat.openai.service';
import { ChatPromptService } from './chat.prompt.service';

import { Chat, ChatSchema } from './chat.schema';
import { ChatImageService } from './chat.image.service';
import { ChatRepository } from './chat.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatPromptService,
    ChatImageService,
    ChatOpenAi,
    ChatRepository,
  ],
})
export class ChatModule {}
