import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from './chat.schema';

@Injectable()
export class ChatService {
  constructor(@InjectModel(Chat.name) private chatModel: Model<Chat>) {}

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
  // 5. 서 -> 몽DB 새 chat obj 생성하며 메타데이터들 저장: 유저아이디, 날짜, 사전질문지, 카톡첨부장수,...
  // 6. OAI -> 서 답변 전송
  // 7-1. 서 -> 클 답변 전달
  // 7-2. 서 -> 몽DB 대화 로그, 대화 주제, 토큰, 세션...등 업데이트

  //채팅목록 보여주기
  //주제, 날짜

  //목록중 하나를 클릭하면...이전 채팅이 인피니티 스크롤로 마지막 3세션만 불러와짐!
  //log 배열의 마지막에서 6개까지만, 커서 저장
  //커서 이전 자료 요청할 경우: 커서에서 앞으로 6개 까지만 전달...

  //이전대화 유지.. 채팅을 날리면...
  //log 전체를 가져다 붙이고, + 새 질문을 붙여서 채팅 날리기
  // + 카톡대화내역 OCR

  // 요약 기능? 토큰이 너무 많이 들때 요약하게 해주기..?
}
