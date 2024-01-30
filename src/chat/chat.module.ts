import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatOpenAi } from './chat.openai.service';
import { ChatPromptService } from './chat.prompt.service';
import { Chat, ChatSchema } from './chat.schema';
import { ChatImageService } from './chat.image.service';
import { ChatRepository } from './chat.repository';
import { UserModule } from 'src/user/user.module';
import { ChatDataManageService } from './chat.datamanage.service';
import { ChatLog, ChatLogSchema } from './chatlog.schema';
import { FreeChatLog, FreeChatLogSchema } from './freechatLog.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: ChatLog.name, schema: ChatLogSchema },
      { name: FreeChatLog.name, schema: FreeChatLogSchema },
    ]),
    UserModule,
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatPromptService,
    ChatImageService,
    ChatOpenAi,
    ChatDataManageService,
    ChatRepository,
  ],
})
export class ChatModule {}
