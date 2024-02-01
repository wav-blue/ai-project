import { Connection } from 'mongoose';
import {
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  Create1stChatDto,
  CreateFreeChatDto,
  ReturnReadChatDto,
  UpdateChatDto,
} from './dtos/chat.dto';
import { ChatPromptService } from './services/chat.prompt.service';
import { ChatOpenAi } from './services/chat.openai.service';
import { ChatRepository } from './repositories/chat.repository';
import { ChatImageService } from './services/chat.image.service';
import { ChatDataManageService } from './services/chat.datamanage.service';
import { Chat } from './schemas/chat.schema';
import { InjectConnection } from '@nestjs/mongoose';
import { MembershipService } from 'src/user/membership.service';
import { ReadChatRepository } from './repositories/readChat.repository';

@Injectable()
export class ChatService {
  constructor(
    private promptService: ChatPromptService,
    private openAiService: ChatOpenAi,
    private chatImageService: ChatImageService,
    private readChatRepository: ReadChatRepository,
    private chatRepository: ChatRepository,
    private chatDataManageService: ChatDataManageService,
    private readonly membershipService: MembershipService,
    @InjectConnection() private connection: Connection,
  ) {}

  //유저별 채팅 내역 목록
  async listChats(userId: string): Promise<Chat[]> {
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      const result = await this.readChatRepository.findChatList(
        userId,
        session,
      );
      await session.commitTransaction();
      return result;
    } catch (err) {
      await session.abortTransaction();
      throw new ServiceUnavailableException(
        '알 수 없는 이유로 목록을 읽어오지 못했습니다',
      );
    } finally {
      await session.endSession();
    }
  }

  //채팅내역중 하나 선택해서 읽기
  //커서기반 페이지네이션
  async readChat(
    userId: string,
    chatId: string,
    cursor?: number,
  ): Promise<ReturnReadChatDto> {
    const limit = 6;
    const pointer = cursor ? -cursor - limit : -limit;
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      const length = await this.readChatRepository.countDialogueLength(
        userId,
        chatId,
        session,
      );

      if (length < cursor) {
        throw new Error('조회할 수 없는 범위');
      }

      const history = await this.readChatRepository.findChatDialogue(
        userId,
        chatId,
        pointer,
        limit,
        session,
      );

      await session.commitTransaction();
      const result = { cursor: -pointer, history };
      if (length <= -pointer) {
        result.cursor = length;
        result['message'] = '가장 오래된 내역까지 조회 완료';
      }

      return result;
    } catch (err) {
      await session.abortTransaction();
      throw new ServiceUnavailableException(
        '알 수 없는 이유로 내역을 읽어오지 못했습니다',
      );
    } finally {
      session.endSession();
    }
  }

  async startFreeChat(chatDto: CreateFreeChatDto): Promise<string[][]> {
    const { question, testResult, imageUrl } = chatDto;
    const session = await this.connection.startSession();
    try {
      //1. 캡쳐 첨부했을 경우:s3 경로에서 이미지 가져와서, OCR 연결해서 대화내역 텍스트로 따옴.
      // 리턴 - {text: string, log: {count:number, uploadeaAt: Date}}
      const imageOCR = imageUrl
        ? await this.chatImageService.getImageText(imageUrl)
        : null;

      //2. 프롬프트 가공
      //[persona + greeting (with 사전설문) + 첫질문 (with imageOCR)]
      //리턴:ChatCompletionMessageParam[]
      const { prompt, questionAndOCR } = this.promptService.format1stPrompt(
        question,
        testResult,
        imageOCR,
      );

      //3. 작성된 prompt 사용해서 구루에게 첫 채팅 날림
      //리턴: ChatCompletion
      const response = await this.openAiService.getCompletion(prompt);

      //4. 유저 질문, 구루 답변, 메타데이터 가공
      //리턴: {freeChatLogDoc, title, answer}
      const { freeChatLogDoc, title, answer } =
        this.chatDataManageService.formatFreeCompletion(
          prompt,
          response,
          imageOCR,
        );

      //freeChatLog DB 무료채팅로그 저장
      session.startTransaction();
      await this.chatRepository.createFreeChatLog(freeChatLogDoc, session);
      await session.commitTransaction();

      //결과 가공해서 컨트롤러에 전송
      // [question (with OCR), answer]
      const result = [
        ['GUEST', title],
        [questionAndOCR, answer],
      ];

      return result;
    } catch (err) {
      await session.abortTransaction();
      throw new ServiceUnavailableException(
        '알 수 없는 이유로 첫 질문 생성 실패',
      );
    } finally {
      await session.endSession();
    }
  }

  //클라이언트에서 로컬스토리지에 저장해뒀던 freechat history를 DB 저장해주기
  //프롬프트 가공 -> 메타데이터 가공(첫채팅 free챗이라 메타데이터 소실) -> DB 저장 -> id, 타이틀, 질, 답
  async saveFreeChat(chatDto: Create1stChatDto): Promise<string[][]> {
    const { userId, title, history, testResult } = chatDto;
    const session = await this.connection.startSession();
    try {
      //첫채팅 프롬프트 복원, 구루 응답 형식까지 가공
      // [{persona}, {greeting}, {유저질문}, {구루응답}]
      const prompt = this.promptService.formatFreePrompt(
        title,
        history,
        testResult,
      );

      //DB 저장용 문서 가공..
      const { chatDoc, chatLogDoc, chatDialogueDoc } =
        this.chatDataManageService.freeChatForSaving(
          userId,
          title,
          history,
          prompt,
        );

      //DB 저장
      session.startTransaction();
      const savedId = await this.chatRepository.createChat(chatDoc, session);
      chatLogDoc.chatId = savedId;
      chatDialogueDoc.chatId = savedId;
      await this.chatRepository.createChatLog(chatLogDoc, session);
      await this.chatRepository.createChatDialogue(chatDialogueDoc, session);
      await session.commitTransaction();

      //결과 컨트롤러에 전송
      // [ [chatId, title], [question, answer] ]
      const result = [[savedId, title], history];
      return result;
    } catch (err) {
      await session.abortTransaction();
      throw new ServiceUnavailableException(
        '알 수 없는 이유로 로그인 전 질문 저장 실패',
      );
    } finally {
      await session.endSession();
    }
  }

  //첫 채팅: 로그인유저 첫 채팅(무료)
  async startChat(chatDto: Create1stChatDto): Promise<string[][]> {
    const { userId, question, testResult, imageUrl } = chatDto;
    const session = await this.connection.startSession();
    try {
      //1. 캡쳐 첨부했을 경우:s3 경로에서 이미지 가져와서, OCR 연결해서 대화내역 텍스트로 따옴.
      // 리턴 - {text: string, log: {count:number, uploadeaAt: Date}}
      const imageOCR = imageUrl
        ? await this.chatImageService.getImageText(imageUrl)
        : null;

      console.log('OCR', imageOCR);

      //2. 프롬프트 가공
      //[persona + greeting (with 사전설문) + 첫질문 (with new imageOCR)]
      //리턴:ChatCompletionMessageParam[]
      const { prompt, questionAndOCR } = this.promptService.format1stPrompt(
        question,
        testResult,
        imageOCR,
      );

      //3. 작성된 prompt 사용해서 구루에게 첫 채팅 날림
      //리턴: ChatCompletion
      const response = await this.openAiService.getCompletion(prompt);

      //4. 유저 질문, 구루 답변, 메타데이터 가공
      //리턴: {chatDoc, chatLogDoc, chatDialogueDoc, title, answer}
      const { chatDoc, chatLogDoc, chatDialogueDoc, title, answer } =
        this.chatDataManageService.format1stCompletion(
          userId,
          questionAndOCR,
          prompt,
          response,
          imageOCR,
        );

      //DB 저장, 저장결과 조회: chat(with oai 전송용 프롬프트), chatLog(기타 메타정보), chatDialoque(유저전송용)
      session.startTransaction();
      const savedId = await this.chatRepository.createChat(chatDoc, session);
      chatLogDoc.chatId = savedId;
      chatDialogueDoc.chatId = savedId;
      await this.chatRepository.createChatLog(chatLogDoc, session);
      await this.chatRepository.createChatDialogue(chatDialogueDoc, session);
      await session.commitTransaction();

      //결과 가공해서 컨트롤러에 전송
      // [ [chatId, title], [question, answer] ]
      const result = [
        [savedId, title],
        [questionAndOCR, answer],
      ];

      return result;
    } catch (err) {
      await session.abortTransaction();
      throw new ServiceUnavailableException(
        '알 수 없는 이유로 첫 질문 생성 실패',
      );
    } finally {
      await session.endSession();
    }
  }

  //채팅 내역중에서 이어서 채팅. 무료회원:5번, 베이직:100번, 프리미엄:무제한
  private async continueChat(chatDto: UpdateChatDto): Promise<string[]> {
    const { userId, chatId, question, imageUrl } = chatDto;
    const session = await this.connection.startSession();
    try {
      //1. DB에서 userId, guestId, chatId 매칭하는 채팅 Doc 꺼내옴// 일치하는 것 없으면 여기서 end.
      //리턴 <ChatDocument> or Error
      session.startTransaction();
      const history = await this.readChatRepository.findChatByUserId(
        userId,
        chatId,
        session,
      );

      //2. 카톡캡쳐 이미지 있는 경우 OCR 거침
      const imageOCR = imageUrl
        ? await this.chatImageService.getImageText(imageUrl)
        : null;

      //3. 저장된 다이알로그에 새 질문과 OCR결과 붙여 가공해서 프롬프트 생성
      const { prompt, questionAndOCR } =
        this.promptService.formatContinuePrompt(
          history.dialogue,
          question,
          imageOCR,
        );

      //4. 생성된 프롬프트 open ai 에 쏴줌
      const response = await this.openAiService.getCompletion(prompt);

      //5. ai 답변 받아서 db 저장 용으로 가공(1에서 꺼낸 문서 이용)
      //{ chatDoc: Chat; chatLog: ChatLogType; title: string; answer: string }
      const { chatDoc, chatLog, answer } =
        this.chatDataManageService.formatContinueCompletion(
          questionAndOCR,
          prompt,
          response,
          history,
        );

      //6. db 저장, 트랜잭션 커밋
      await this.chatRepository.updateChat(chatId, chatDoc, session);
      await this.chatRepository.updateChatLog(
        chatId,
        chatLog,
        session,
        imageOCR,
      );
      await this.chatRepository.updateChatDialogue(
        chatId,
        questionAndOCR,
        answer,
        session,
      );
      await session.commitTransaction();

      //7. 결과 가공해서 컨트롤러에 전송
      // [question (with OCR), answer]
      const result = [questionAndOCR, answer];

      return result;
    } catch (err) {
      await session.abortTransaction();
      await this.membershipService.restoreMembershipBalance(userId);
      throw new ServiceUnavailableException(
        '채팅 진행중 문제가 발생하여 차감 멤버십을 반환하였습니다.',
      );
    } finally {
      await session.endSession();
    }
  }

  //멤버십을 확인하고 진행
  async checkMembershipAndCarryOn(chatDto: UpdateChatDto): Promise<string[]> {
    try {
      //0.멤버십 테이블에서 userId로 검색해서 횟수 남았는지 확인하고 차감. 커밋까지 완료.
      const checkMembership =
        await this.membershipService.checkAndDeductMembership(chatDto.userId);
      if (!checkMembership) {
        throw new ForbiddenException('멤버십 상태를 확인해주세요.');
      }

      const result = await this.continueChat(chatDto);
      return result;
    } catch (err) {
      throw err;
    }
  }
}
