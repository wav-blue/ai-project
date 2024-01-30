import { Connection } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { Create1stChatDto, CreateFreeChatDto, UpdateChatDto } from './chat.dto';
import { ChatPromptService } from './chat.prompt.service';
import { ChatOpenAi } from './chat.openai.service';
import { ChatRepository } from './chat.repository';
import { ChatImageService } from './chat.image.service';
import { UserService } from 'src/user/user.service';
import { ChatDataManageService } from './chat.datamanage.service';
import { Chat } from './chat.schema';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class ChatService {
  constructor(
    private promptService: ChatPromptService,
    private openAiService: ChatOpenAi,
    private chatImageService: ChatImageService,
    private chatRepository: ChatRepository,
    private chatDataManageService: ChatDataManageService,
    private readonly userService: UserService,
    @InjectConnection() private connection: Connection,
  ) {}

  //유저별 채팅 내역
  async listChats(userId: string): Promise<Chat[]> {
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      const result = this.chatRepository.findChatList(userId, session);
      await session.commitTransaction();
      return result;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  }

  //채팅내역중 하나 선택해서 읽기
  //커서기반 페이지네이션 필요
  async readChat(userId: string, chatId: string): Promise<any> {
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      const result = this.chatRepository.findChatDialogue(
        userId,
        chatId,
        session,
      );
      await session.commitTransaction();
      return result;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  }

  //첫 채팅: 무료챗을 로그인챗으로 만들어주고 다음채팅날리기(2번째 채팅, 유료), or 로그인유저 첫 채팅(무료)
  async startChat(chatDto: Create1stChatDto): Promise<string[][]> {
    const { userId, question, history, testResult, imageUrl } = chatDto;
    const imageOCR = [];
    const session = await this.connection.startSession();
    try {
      //0. 프리 ->유료인 경우 멤버십 테이블에서 userId로 검색해서 횟수 남았는지 확인하고 차감. 커밋까지 완료.
      if (history) {
        const checkMembership =
          await this.userService.checkAndDeductMembership(userId);
        if (!checkMembership) {
          throw new Error('멤버십 ㄴㄴ');
        }
      }
      //1. 캡쳐 첨부했을 경우:s3 경로에서 이미지 가져와서, OCR 연결해서 대화내역 텍스트로 따옴.
      // 리턴 - {text: string, log: {count:number, uploadeaAt: Date}}
      if (imageUrl) {
        const resultOCR = await this.chatImageService.getImageText(imageUrl);
        imageOCR.push(resultOCR);
      }

      //2. 프롬프트 가공
      //무료 -> 유료일 경우: [persona + greeting (with 사전설문) + 첫질문(with free imageOCR) + 첫응답 + 새질문 (with new imageOCR)]
      //로그인 첫챗일경우: [persona + greeting (with 사전설문) + 첫질문 (with new imageOCR)]
      //리턴:ChatCompletionMessageParam[]
      const prompt = history
        ? this.promptService.format1stPrompt(
            question,
            testResult,
            imageOCR[0], //임시, 마저 구현하면 타입 변경
          )
        : this.promptService.format2ndPrompt(
            question,
            history,
            imageOCR[0],
            testResult,
          );

      //3. 작성된 prompt 사용해서 구루에게 첫 채팅 날림
      //리턴: ChatCompletion
      const response = await this.openAiService.getCompletion(prompt);

      //4. 유저 질문, 구루 답변, 메타데이터 가공
      //리턴: [chatDoc, chatLogDoc, title, answer]
      const chatDoc = this.chatDataManageService.format1stCompletion(
        userId,
        question,
        prompt,
        response,
        imageOCR[0], //임시
      );

      //DB 저장, 저장결과 조회
      session.startTransaction();
      const savedId = await this.chatRepository.createChat(chatDoc[0], session);
      chatDoc[1].chatId = savedId;
      await this.chatRepository.createChatLog(chatDoc[1], session);
      await session.commitTransaction();

      //결과 가공해서 컨트롤러에 전송
      // [ [chatId, title], [question, answer] ]
      const result = [
        [savedId, chatDoc[2]],
        [question, chatDoc[3]],
      ];

      return result;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  }

  async startFreeChat(chatDto: CreateFreeChatDto): Promise<string[]> {
    const { question, testResult, imageUrl } = chatDto;
    const imageOCR = [];
    const session = await this.connection.startSession();
    try {
      //1. 캡쳐 첨부했을 경우:s3 경로에서 이미지 가져와서, OCR 연결해서 대화내역 텍스트로 따옴.
      // 리턴 - {text: string, log: {count:number, uploadeaAt: Date}}
      if (imageUrl) {
        const resultOCR = await this.chatImageService.getImageText(imageUrl);
        imageOCR.push(resultOCR);
      }

      //2. 프롬프트 가공
      //[persona + greeting (with 사전설문) + 첫질문 (with imageOCR)]
      //리턴:ChatCompletionMessageParam[]
      const prompt = this.promptService.format1stPrompt(
        question,
        testResult,
        imageOCR[0], //임시, 마저 구현하면 타입 변경
        true, //freeChat용 프롬프트 생성
      );

      //3. 작성된 prompt 사용해서 구루에게 첫 채팅 날림
      //리턴: ChatCompletion
      const response = await this.openAiService.getCompletion(prompt);

      //4. 유저 질문, 구루 답변, 메타데이터 가공
      //리턴: [freeChatLogDoc, answer]
      const freeChatLogDoc = this.chatDataManageService.formatFreeCompletion(
        prompt,
        response,
        imageOCR[0], //임시
      );

      //freeChatLog DB 무료채팅로그 저장
      session.startTransaction();
      await this.chatRepository.createFreeChatLog(freeChatLogDoc[0], session);
      await session.commitTransaction();

      //결과 가공해서 컨트롤러에 전송
      // [question (with OCR), answer]
      const result = [question, freeChatLogDoc[1]];

      return result;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  }

  //채팅 내역중에서 이어서 채팅. 무료회원:5번, 베이직:100번, 프리미엄:무제한
  async continueChat(chatDto: UpdateChatDto): Promise<string[]> {
    const { userId, chatId, question, imageUrl } = chatDto;
    const imageOCR = [];
    const session = await this.connection.startSession();
    try {
      //0. DB에서 userId, guestId, chatId 매칭하는 채팅 Doc 꺼내옴// 일치하는 것 없으면 여기서 end.
      //리턴 <ChatDocument> or Error
      session.startTransaction();
      const history = await this.chatRepository.findChatByUserId(
        userId,
        chatId,
        session,
      );

      //1. 멤버십 테이블에서 userId로 검색해서 횟수 남았는지 확인하고 차감. 커밋까지 완료.
      const checkMembership =
        await this.userService.checkAndDeductMembership(userId);
      if (!checkMembership) {
        throw new Error('멤버십 ㄴㄴ');
      }

      //2. 카톡캡쳐 이미지 있는 경우 OCR 거침(실패시 멤버십 차감횟수 다시 돌려줌)
      if (imageUrl) {
        // s3 경로에서 이미지 가져와서, OCR 연결해서 대화내역 텍스트로 따옴.
        // 리턴 - {text: string, log: {count:number, uploadeaAt: Date}}
        const resultOCR = await this.chatImageService.getImageText(imageUrl);
        imageOCR.push(resultOCR);
      }

      //3. 저장된 다이알로그에 새 질문과 OCR결과 붙여 가공해서 프롬프트 생성(실패시 멤버십 차감횟수 다시 돌려줌)
      const prompt = this.promptService.formatContinuePrompt(
        history.dialogue,
        question,
        imageOCR[0], //임시, 마저 구현하면 타입 변경
      );

      //4. 생성된 프롬프트 open ai 에 쏴줌(실패시 멤버십 차감횟수 다시 돌려줌)
      const response = await this.openAiService.getCompletion(prompt);

      //5. ai 답변 받아서 db 저장 용으로 가공(1에서 꺼낸 문서 이용)(실패시 엠버십 차감횟수 다시 돌려줌)
      //데이터가공용 서비스 하나 더 파서 거기에 모아버리자
      //로그랑 다이알이랑 db 따로 만들어서 로그는 push만 해주고, 다이알만 꺼내오자
      const chatDoc = this.chatDataManageService.formatContinueCompletion(
        question,
        prompt,
        response,
        history,
      );

      //6. db 저장, 트랜잭션 커밋 (실패시 멤버십 차감횟수 다시 돌려줌)
      await this.chatRepository.updateChat(chatId, chatDoc[0], session);
      await this.chatRepository.updateChatLog(chatId, chatDoc[1], session);
      await session.commitTransaction();

      //7. 결과 가공해서 컨트롤러에 전송(실패시 멤버십 차감횟수 다시 돌려줌)
      // [question (with OCR), answer]
      const result = [question, chatDoc[3]];

      return result;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  }
}
