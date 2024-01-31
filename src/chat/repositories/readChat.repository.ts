import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { Chat } from '../schemas/chat.schema';
import { ChatDialogue } from '../schemas/chatDialogue.schema';

@Injectable()
export class ReadChatRepository {
  constructor(
    @InjectModel(Chat.name) private readonly chatModel: Model<Chat>,
    @InjectModel(ChatDialogue.name)
    private readonly chatDialogueModel: Model<ChatDialogue>,
  ) {}

  //유저의 채팅내역 목록 읽어주기
  async findChatList(userId: string, session: ClientSession): Promise<Chat[]> {
    try {
      const chatList = this.chatModel
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

      return chatList || [];
    } catch (err) {
      throw new InternalServerErrorException(
        'DB에서 구루와의 대화 목록 조회 중 오류 발생',
      );
    }
  }

  //유저의 특정 채팅내역 다이알로그 길이 계산
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

      if (result.length === 0) {
        throw new NotFoundException('일치하는 대화 내역이 없습니다.');
      }
      return result[0].length;
    } catch (err) {
      throw new InternalServerErrorException(
        'DB에서 구루와의 대화 히스토리 확인 중 오류 발생',
      );
    }
  }

  //특정 채팅 내역 읽기, 페이지네이션
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

      if (result.length === 0) {
        throw new NotFoundException('일치하는 대화 내역이 없습니다.');
      }

      return result[0].dialogue;
    } catch (err) {
      throw new InternalServerErrorException(
        'DB에서 대화 히스토리 읽던 중 오류 발생',
      );
    }
  }

  //로그인회원 유저아이디로 업데이트 할 chat 문서 찾기
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

      if (!result) {
        throw new NotFoundException(
          `해당 유저가 생성한 대화내역 id: ${chatId} 을 찾을 수 없습니다.`,
        );
      }
      return result;
    } catch (err) {
      throw new InternalServerErrorException('DB 조회 중 오류 발생');
    }
  }
}
