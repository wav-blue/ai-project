import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { Chat } from './chat.schema';
import { ChatLog } from './chatlog.schema';
import { ChatLogType, ImageLogType } from './chat.dto';
import { FreeChatLog } from './freechatLog.schema';
import { ChatDialogue } from './chatDialogue.schema';

@Injectable()
export class ChatRepository {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    @InjectModel(ChatLog.name) private chatLogModel: Model<ChatLog>,
    @InjectModel(FreeChatLog.name) private freeChatLogModel: Model<FreeChatLog>,
    @InjectModel(ChatDialogue.name)
    private chatDialogueModel: Model<ChatDialogue>,
  ) {}

  //채팅내역 목록
  async findChatList(userId: string, session: ClientSession): Promise<Chat[]> {
    try {
      return this.chatModel
        .aggregate([
          { $match: { userId } },
          {
            $project: {
              chatId: '$_id',
              title: 1,
              _id: 0,
            },
          },
        ])
        .session(session)
        .exec();
    } catch (err) {
      throw new InternalServerErrorException(
        'DB에서 대화 내역 목록 조회 중 오류 발생',
      );
    }
  }

  //유저용 다이알로그 길이 계산
  async countDialogueLength(
    userId: string,
    chatId: string,
    session: ClientSession,
  ): Promise<number> {
    try {
      const result = await this.chatDialogueModel
        .aggregate([
          { $match: { chatId, userId } },
          { $project: { _id: 0, length: { $size: '$dialogue' } } },
        ])
        .session(session);
      return result[0].length;
    } catch (err) {
      throw new InternalServerErrorException(
        'DB에서 대화 히스토리 확인 중 오류 발생',
      );
    }
  }

  //채팅 읽기, 페이지네이션
  async findChatDialogue(
    userId: string,
    chatId: string,
    idx: number,
    limit: number,
    session: ClientSession,
  ): Promise<string[]> {
    try {
      const result = await this.chatDialogueModel
        .aggregate([
          { $match: { chatId, userId } },
          {
            $project: {
              _id: 0,
              dialogue: { $slice: ['$dialogue', idx, limit] },
            },
          },
        ])
        .session(session);

      return result[0].dialogue;
    } catch (err) {
      throw new InternalServerErrorException(
        'DB에서 대화 히스토리 읽던 중 오류 발생',
      );
    }
  }

  //채팅 생성하기
  async createChat(chatDoc: Chat, session: ClientSession): Promise<string> {
    try {
      const newChat = new this.chatModel(chatDoc);
      const savedChat = await newChat.save({ session });
      const { _id } = savedChat;
      const chatId = _id.toString();

      return chatId;
    } catch (err) {
      console.error;
      throw err;
      //throw new InternalServerErrorException('DB 에 새 채팅 생성 중 오류 발생');
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

  //로그인회원 유저아이디로 chat 찾기
  async findChatByUserId(
    userId: string,
    chatId: string,
    session: ClientSession,
  ): Promise<Chat> {
    try {
      const result = await this.chatModel
        .findOne({
          _id: chatId,
          userId,
        })
        .session(session)
        .exec();

      return result;
    } catch (err) {
      throw new InternalServerErrorException('DB 조회 중 오류 발생');
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
