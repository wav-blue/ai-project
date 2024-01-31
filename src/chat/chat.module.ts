import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatOpenAi } from './services/chat.openai.service';
import { ChatPromptService } from './services/chat.prompt.service';
import { Chat, ChatSchema } from './schemas/chat.schema';
import { ChatImageService } from './services/chat.image.service';
import { ChatRepository } from './repositories/chat.repository';
import { UserModule } from 'src/user/user.module';
import { ChatDataManageService } from './services/chat.datamanage.service';
import { ChatLog, ChatLogSchema } from './schemas/chatlog.schema';
import { FreeChatLog, FreeChatLogSchema } from './schemas/freechatLog.schema';
import {
  ChatDialogue,
  ChatDialogueSchema,
} from './schemas/chatDialogue.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: ChatLog.name, schema: ChatLogSchema },
      { name: FreeChatLog.name, schema: FreeChatLogSchema },
      { name: ChatDialogue.name, schema: ChatDialogueSchema },
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
