import {
  Body,
  Controller,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateFreeChatDto } from './chat.dto';
import { LocalAuthGuard } from '../user/guards/local-service.guard';
import { GetUser } from 'src/common/decorator/get-user.decorator';
//리턴타입 만들기?

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('/free')
  @UseGuards(LocalAuthGuard)
  @UsePipes(ValidationPipe)
  async createFirstChat(
    @GetUser() userId: string,
    @Body() chatDto: CreateFreeChatDto,
  ): Promise<void> {
    chatDto.userId = userId;
    try {
      const result = await this.chatService.startFisrtChat(chatDto);
      console.log(result);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  //첫채팅
  //질문은 그냥 바로 보내주고 답변이랑 같이 받기??
  //아무튼 로그를 메타데이터랑 같이 저장:주제, 날짜 토큰..
  //사전 질문지를 또 따로 저장할까..?
  // + 사전 질문지
  // + 카톡대화내역 OCR

  // 1. 클라이언트 <사용자가 채팅 전송 누름>
  // 2. 클->서 [사전질문 내역], [카카오톡 OCR 읽은것], [질문 내용]
  // 3. 서버 <서비스 or 레포지토리에서 잘 조합해서 하나의 프롬프트로 만들어준다.>
  // 4. 서 -> OAI 구루 페르소나와 함께 3에서 만든 프롬프트 쏴줌
  // 5. 서 -> 몽DB 새 chat obj 생성하며 메타데이터들 저장: 유저아이디 || guestID, 날짜, 사전질문지, 카톡첨부장수,...
  // 6. OAI -> 서 답변 전송
  // 7-1. 서 -> 클 문-답 로그 전달
  // 7-2. 서 -> 몽DB 대화 로그, 대화 주제, 토큰, 세션...등 업데이트, 멤버십 정보 업뎃 !!USER 엔티티 or membership 엔티티를 가져와야 한다!!
  // 7-3 유저가 비로그인 -> 로그인 전환한 경우: 게스트아이디, 챗 아이디, 유저아이디 전달해주면 서버에서 유저아이디만 업데이트

  //채팅목록 보여주기
  //주제, 날짜
  // 1. 클 -> 서

  //목록중 하나를 클릭하면...이전 채팅이 인피니티 스크롤로 마지막 3세션만 불러와짐!
  //log 배열의 마지막에서 6개까지만, 커서 저장
  //커서 이전 자료 요청할 경우: 커서에서 앞으로 6개 까지만 전달...

  //이전대화 유지.. 채팅을 날리면...
  //log 전체를 가져다 붙이고, + 새 질문을 붙여서 채팅 날리기
  // + 카톡대화내역 OCR

  // 요약 기능? 토큰이 너무 많이 들때 요약하게 해주기..?
}
