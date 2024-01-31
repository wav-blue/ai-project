import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { Chat } from '../schemas/chat.schema';
import { ChatLog } from '../schemas/chatlog.schema';
import { ChatLogType, ImageLogType } from '../dtos/chat.dto';
import { FreeChatLog } from '../schemas/freechatLog.schema';
import { ChatDialogue } from '../schemas/chatDialogue.schema';

@Injectable()
export class ChatRepository {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    @InjectModel(ChatLog.name) private chatLogModel: Model<ChatLog>,
    @InjectModel(FreeChatLog.name) private freeChatLogModel: Model<FreeChatLog>,
    @InjectModel(ChatDialogue.name)
    private chatDialogueModel: Model<ChatDialogue>,
  ) {}

  //채팅 생성하기
  async createChat(chatDoc: Chat, session: ClientSession): Promise<string> {
    try {
      const newChat = new this.chatModel(chatDoc);
      const savedChat = await newChat.save({ session });
      const { _id } = savedChat;
      const chatId = _id.toString();

      return chatId;
    } catch (err) {
      throw new InternalServerErrorException('DB 에 새 채팅 생성 중 오류 발생');
    }
  }

  //챗 로그 생성
  async createChatLog(
    chatLogDoc: ChatLog,
    session: ClientSession,
  ): Promise<void> {
    try {
      const newChatLog = new this.chatLogModel(chatLogDoc);
      await newChatLog.save({ session });
    } catch (err) {
      throw new InternalServerErrorException('DB 에 로그 생성 중 오류 발생');
    }
  }

  //유저용 챗다이알로그 생성
  async createChatDialogue(
    chatDialogueDoc: ChatDialogue,
    session: ClientSession,
  ): Promise<void> {
    try {
      const newChatDialogue = new this.chatDialogueModel(chatDialogueDoc);
      await newChatDialogue.save({ session });
    } catch (err) {
      throw new InternalServerErrorException(
        'DB 에 대화내역 생성 중 오류 발생',
      );
    }
  }

  //free챗 로그 생성
  async createFreeChatLog(
    freeChatLogDoc: FreeChatLog,
    session: ClientSession,
  ): Promise<void> {
    try {
      const newFreeChatLog = new this.freeChatLogModel(freeChatLogDoc);
      await newFreeChatLog.save({ session });
    } catch (err) {
      throw new InternalServerErrorException(
        'DB 에 비로그인 채팅 로그 생성 중 오류 발생',
      );
    }
  }

  //대화지속, 챗Doc 업데이트
  async updateChat(
    chatId: string,
    history: Chat,
    session: ClientSession,
  ): Promise<void> {
    try {
      await this.chatModel
        .updateOne({ _id: chatId }, { $set: history })
        .session(session)
        .exec();
    } catch (err) {
      throw new InternalServerErrorException('DB 에 채팅 기록 중 오류 발생');
    }
  }

  //대화지속, 챗로그Doc 업데이트
  async updateChatLog(
    chatId: string,
    chatLog: ChatLogType,
    session: ClientSession,
    imageOCR?: null | { text: string; log: ImageLogType },
  ): Promise<void> {
    try {
      if (imageOCR) {
        await this.chatLogModel
          .updateOne(
            { chatId: chatId },
            { $push: { log: chatLog, imageLog: imageOCR.log } },
          )
          .session(session)
          .exec();
      } else {
        await this.chatLogModel
          .updateOne({ chatId: chatId }, { $push: { log: chatLog } })
          .session(session)
          .exec();
      }
    } catch (err) {
      throw new InternalServerErrorException('DB 에 로그 기록 중 오류 발생');
    }
  }

  async updateChatDialogue(
    chatId: string,
    question: string,
    answer: string,
    session: ClientSession,
  ): Promise<void> {
    try {
      await this.chatDialogueModel
        .updateOne(
          { chatId: chatId },
          { $push: { dialogue: { $each: [question, answer] } } },
        )
        .session(session)
        .exec();
    } catch (err) {
      throw new InternalServerErrorException(
        'DB 에 대화내역 기록 중 오류 발생',
      );
    }
  }
}
