import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import {
  Create1stChatDto,
  CreateFreeChatDto,
  ReturnReadChatDto,
  UpdateChatDto,
} from './chat.dto';
import { LocalAuthGuard } from '../user/guards/local-service.guard';
import { GetUser } from 'src/common/decorator/get-user.decorator';
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
  //커서기반 페이지네이션
  @Get('/:chatId')
  @UseGuards(LocalAuthGuard)
  @UsePipes(ValidationPipe)
  async getChatContents(
    @GetUser() userId: string,
    @Param('chatId') chatId: string,
    @Query('cursor') cursor: number,
  ): Promise<ReturnReadChatDto> {
    try {
      const result = await this.chatService.readChat(userId, chatId, cursor);
      return result;
    } catch (err) {
      throw err;
    }
  }

  //로그인 유저 첫채팅생성 or free챗을 로그인 챗으로 저장
  //freeChat -> 로그인 챗 일경우 프론트 로컬스토리지에 저장했던 history 가 requestBody 에 포함.
  @Post()
  @UseGuards(LocalAuthGuard)
  @UsePipes(ValidationPipe)
  async create1stChat(
    @GetUser() userId: string,
    @Body() chatDto: Create1stChatDto,
  ): Promise<string[][]> {
    chatDto.userId = userId;
    try {
      const result = await this.chatService.startChat(chatDto);
      console.log('클라에 갈 결과: ', result);
      return result;
    } catch (err) {
      throw err;
    }
  }

  //무료 채팅 1회, DB 저장 X (로그만 저장)
  @Post('/free')
  @UsePipes(ValidationPipe)
  async createFreeChat(@Body() chatDto: CreateFreeChatDto): Promise<string[]> {
    try {
      const result = await this.chatService.startFreeChat(chatDto);
      console.log('클라에 갈 결과: ', result);
      return result;
    } catch (err) {
      throw err;
    }
  }

  //로그인 유저의 특정 챗에서 이어지는 챗
  @Post('/:chatId')
  @UseGuards(LocalAuthGuard)
  @UsePipes(ValidationPipe)
  async updateChat(
    @GetUser() userId: string,
    @Body() chatDto: UpdateChatDto,
    @Param('chatId') chatId: string,
  ): Promise<string[]> {
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
}
