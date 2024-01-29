import { Connection } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { CreateFreeChatDto, UpdateChatDto } from './chat.dto';
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
      session.endSession();
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
      session.endSession();
    }
  }

  //첫 채팅: 무료, 1번
  async start1stChat(chatDto: CreateFreeChatDto): Promise<string[][]> {
    const { guestId, question, testResult, imageUrl } = chatDto;
    const imageOCR = [];
    const session = await this.connection.startSession();
    try {
      if (imageUrl) {
        // s3 경로에서 이미지 가져와서, OCR 연결해서 대화내역 텍스트로 따옴.
        // 리턴 - {text: string, log: {count:number, uploadeaAt: Date}}
        const resultOCR = await this.chatImageService.getImageText(imageUrl);
        imageOCR.push(resultOCR);
      }
      //사전질문과 대화방캡쳐OCR 가공, 유저 입력 질문 포함해서 프롬프트 포맷팅
      //리턴- 유저의 질문 배열:ChatCompletionMessageParam[]
      const prompt = this.promptService.format1stPrompt(
        question,
        testResult,
        imageOCR[0], //임시, 마저 구현하면 타입 변경
      );

      //작성된 prompt 사용해서 구루에게 첫 채팅 날림
      //리턴- ChatCompletion
      const response = await this.openAiService.getCompletion(prompt);

      //유저 질문, 구루 답변, 메타데이터 가공
      //리턴: [chatDoc, chatLogDoc]
      const chatDoc = this.chatDataManageService.format1stCompletion(
        guestId,
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
      const result = [
        [savedId, chatDoc[2]],
        [question, chatDoc[3]],
      ];

      return result;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  //채팅 내역중에서 이어서 채팅. 무료회원:5번, 베이직:100번, 프리미엄:무제한
  //멤버십은 OCR 이전에 확인해야 한다: OCR도 돈이기 때문에
  //그런데: 유저서비스에서 멤버십조회-잔여횟수차감을 한 트랜잭션에서 하게 했을 경우
  //먼저 조회하고 깎아놓고 시작해서 - 진행하다가 open ai 에서 최종적으로 답변 받아오기 실패했을 경우
  //차감한 횟수를 어떻게 다시 돌려줄 수 있는가?
  //일단 생각한 방법..
  //1. open ai 통신은 멤버십DB 트랜잭션이 확실히 성공적으로 끝나야만 시작하게 함
  //2. 따라서 open ai 통신이 시작했다는 것은, 즉 잔여횟수 1회 차감이 커밋까지 완료되었다는 뜻
  //3. 그런데 open ai 통신하다가 뭔가 잘못된다면 - 특정 커스텀 에러를 throw
  //4. 클라이언트에 해당 에러가 반환되면 멤버십서비스에서 차감된 1회를 다시 더해주는 작업을 수행하도록 api call
  async continueChat(chatDto: UpdateChatDto): Promise<string[][]> {
    const { userId, guestId, chatId, question, imageUrl } = chatDto;
    const imageOCR = [];
    const session = await this.connection.startSession();
    try {
      //0. DB에서 userId, guestId, chatId 매칭하는 채팅 Doc 꺼내옴// 일치하는 것 없으면 여기서 end.
      //리턴 <ChatDocument> or Error
      //guestId 있을경우 guestId로, 없을경우 이미 userId 저장된 내역이므로 userId로 조회
      session.startTransaction();
      const history = guestId
        ? await this.chatRepository.findChatByGuestId(guestId, chatId, session)
        : await this.chatRepository.findChatByUserId(userId, chatId, session);
      //userId 비어있을 경우 넣어주기
      history.userId = history.userId ?? userId;

      //1. 멤버십 테이블에서 userId로 검색해서 횟수 남았는지 확인하고 차감. 커밋까지 완료.
      // const checkMembership =
      //   await this.userService.checkAndDeductMembership(userId);
      // if (!checkMembership) {
      //   throw new Error('멤버십 ㄴㄴ');
      // }

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
      console.log('프롬프트는 됨: ', prompt);

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
      //처음 조회하고나서 중간에 OCR 받아오기 + open ai 응답 받아오기 하면 시간이 꽤 걸리는데 이렇게 오래 열어둬도 되는지..?
      await this.chatRepository.updateChat(chatId, chatDoc[0], session);
      await this.chatRepository.updateChatLog(chatId, chatDoc[1], session);
      await session.commitTransaction();

      //7. 결과 가공해서 컨트롤러에 전송(실패시 멤버십 차감횟수 다시 돌려줌)
      //프론트 요청 따라 히스토리 보내지 않고 질문 답변만 보냄
      //근데 어차피 답변만 보낼거면 질문도 보낼 필요 없지 않나..프론트에서 갖고있는거 아닌가?
      const result = [
        [chatId, chatDoc[2]],
        [question, chatDoc[3]],
      ];

      return result;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }
}
