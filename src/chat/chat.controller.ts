import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateFreeChatDto, UpdateChatDto } from './chat.dto';
import { LocalAuthGuard } from '../user/guards/local-service.guard';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import * as uuid from 'uuid';
import { Chat } from './chat.schema';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  // !! 타입들, DTO 정리 필요!!
  // 커스텀 에러 생성, 정리 필요!!
  // 채팅 내역 읽기 커서기반 페이지네이션 추가해야함
  // 채팅이미지 OCR 받아오기 추가해야함

  //채팅내역
  @Get()
  @UseGuards(LocalAuthGuard)
  @UsePipes(ValidationPipe)
  async getChatsList(@GetUser() userId: string): Promise<Chat[]> {
    try {
      const result = await this.chatService.listChats(userId);
      console.log(result);
      return result;
    } catch (err) {
      throw err;
    }
  }

  //챗 내역 중 하나 선택해서 대화기록 조회
  //커서기반 페이지네이션 필요
  @Get('/:chatId')
  @UseGuards(LocalAuthGuard)
  @UsePipes(ValidationPipe)
  async getChatContents(
    @GetUser() userId: string,
    @Param('chatId') chatId: string,
  ): Promise<any> {
    try {
      const result = await this.chatService.readChat(userId, chatId);
      return result;
    } catch (err) {
      throw err;
    }
  }

  //첫 채팅 생성
  //로그인 되어있으면 userId, 안되어있으면 Geust 생성하고 싶은데 어케하지?(현재 일단 모두 게스트아이디 처리)
  //게스트가 첫 챗 후 로그인했때는 어떻게 하지? GUEST id 처리해서 쿠키에 붙여줬다가 받기? (어케 붙여줌..?)
  //타입 관리하기
  @Post('/free')
  @UsePipes(ValidationPipe)
  async create1stChat(@Body() chatDto: CreateFreeChatDto): Promise<any> {
    const guestId = `GUSET_` + uuid.v4();
    chatDto.guestId = guestId;
    console.log('게스트아이디:', guestId);
    try {
      const result = await this.chatService.start1stChat(chatDto);
      console.log('클라에 갈 결과: ', result);
      return result;
    } catch (err) {
      throw err;
    }
  }

  //채팅 이어서 하기
  // !! 아직 멤버십 차감 관련 에러 예외처리 안해줬음!
  //첫채팅 생성할 때 guest_id 를 모두 생성해서 쿠키에 넣어준다고 했을 때(게스트-유사로그인)
  //같은 Route 에서
  //guest_id 가 쿠키에 담겨있을 경우 guest_id를 기반으로 문서 찾아서 user_id 넣는 작업을 먼저 거치고
  //아니면 이미 userId 저장된거니까 userId 사용,
  //마지막으로 Guest_id 를 삭제한 쿠키를 다시 발급해줌?(게스트-유사 로그아웃)
  @Post('/:chatId')
  @UseGuards(LocalAuthGuard)
  @UsePipes(ValidationPipe)
  async updateChat(
    @GetUser() userId: string,
    @Body() chatDto: UpdateChatDto,
    @Param('chatId') chatId: string,
  ): Promise<string[][]> {
    //일단 body 로 guestId 들어온다고 가정, 생성할 때 쿠키에 넣는 법을 차후에 생각해본다..
    chatDto.userId = userId;
    chatDto.chatId = chatId;
    try {
      const result = await this.chatService.continueChat(chatDto);
      console.log('클라에 갈 결과: ', result);
      return result;
    } catch (err) {
      throw err;
    }
  }

  //채팅목록 보여주기
  //주제, 날짜
  // 1. 클 -> 서

  //목록중 하나를 클릭하면...이전 채팅이 인피니티 스크롤로 마지막 3세션만 불러와짐!
  //log 배열의 마지막에서 6개까지만, 커서 저장
  //커서 이전 자료 요청할 경우: 커서에서 앞으로 6개 까지만 전달...

  //이전대화 유지.. 채팅을 날리면...
  //log 전체를 가져다 붙이고, + 새 질문을 붙여서 채팅 날리기
  // + 카톡대화내역 OCR
}
