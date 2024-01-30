import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { Chat } from './chat.schema';
import { ChatLog } from './chatlog.schema';
import { ChatLogType } from './chat.dto';
import { FreeChatLog } from './freechatLog.schema';

@Injectable()
export class ChatRepository {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    @InjectModel(ChatLog.name) private chatLogModel: Model<ChatLog>,
    @InjectModel(FreeChatLog.name) private FreeChatLogModel: Model<FreeChatLog>,
  ) {}

  //채팅내역 목록
  async findChatList(userId: string, session: ClientSession): Promise<Chat[]> {
    try {
      return this.chatModel
        .find({ userId }, { title: 1, _id: 1 })
        .session(session)
        .exec();
    } catch (err) {
      throw err;
    }
  }

  //채팅 읽기, 페이지네이션 추가해야함..
  async findChatDialogue(
    userId: string,
    chatId: string,
    session: ClientSession,
  ): Promise<Chat> {
    try {
      const result = await this.chatModel
        .findOne({ _id: chatId, userId }, { dialogue: 1 })
        .session(session)
        .exec();
      return result;
    } catch (err) {
      throw err;
    }
  }

  //채팅 생성하기(무료), 게스트아이디 저장
  async createChat(chatDoc: Chat, session: ClientSession): Promise<string> {
    try {
      const newChat = new this.chatModel(chatDoc);
      const savedChat = await newChat.save({ session });
      const { _id } = savedChat;
      const chatId = _id.toString();

      return chatId;
    } catch (err) {
      throw err;
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
      throw err;
    }
  }

  //free챗 로그 생성
  async createFreeChatLog(
    freeChatLogDoc: FreeChatLog,
    session: ClientSession,
  ): Promise<void> {
    try {
      const newFreeChatLog = new this.FreeChatLogModel(freeChatLogDoc);
      await newFreeChatLog.save({ session });
    } catch (err) {
      throw err;
    }
  }

  //무료채팅 생성하며 부여한 게스트아이디로 Chat 찾기
  async findChatByGuestId(
    guestId: string,
    chatId: string,
    session: ClientSession,
  ): Promise<Chat> {
    try {
      const result = await this.chatModel
        .findOne({
          _id: chatId,
          guestId,
        })
        .session(session)
        .exec();

      return result;
    } catch (err) {
      throw new Error('일치하는 챗 내역 못찾음');
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
      throw new Error('일치하는 챗 내역 못찾음');
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
      throw new Error('저장 실패');
    }
  }

  //대화지속, 챗로그Doc 업데이트
  async updateChatLog(
    chatId: string,
    chatLog: ChatLogType,
    session: ClientSession,
  ): Promise<void> {
    try {
      await this.chatLogModel
        .updateOne({ chatId: chatId }, { $push: { log: chatLog } })
        .session(session)
        .exec();
    } catch (err) {
      throw new Error('로그 저장 실패');
    }
  }

  //   async findOne(id: string): Promise<Cat | null> {
  //     return this.catModel.findById(id).exec();
  //   }

  //   async findAll(): Promise<Cat[]> {
  //     return this.catModel.find().exec();
  //   }

  // async findOne(id: string): Promise<Cat | null> {
  //   return this.catModel.findById(id).exec();
  // }

  //   async create(cat: Cat): Promise<Cat> {
  //     const createdCat = new this.catModel(cat);
  //     return createdCat.save();
  //   }

  //   async update(id: string, cat: Cat): Promise<Cat | null> {
  //     return this.catModel.findByIdAndUpdate(id, cat, { new: true }).exec();
  //   }

  //   async delete(id: string): Promise<Cat | null> {
  //     return this.catModel.findByIdAndDelete(id).exec();
}
